// HOW TO BUILD: wasm-pack build --target web

use std::cmp::Ordering;
use wasm_bindgen::prelude::*;
use serde::Deserialize;
use serde::Serialize;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[derive(Deserialize)]
struct JsonCards {
    cards: Vec<Card>,
    colors: Vec<JsonColor>,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Eq, Deserialize, Serialize)]
pub enum CardType {
    Unknown = -1,
    Suspect = 0,
    Weapon = 1,
    Room = 2,
    MaxCardType,
}

#[wasm_bindgen]
pub struct GameOptions {
    #[wasm_bindgen(getter, setter)]
    pub num_players: usize,
    #[wasm_bindgen(getter, setter)]
    pub disable_conservatory: bool,
}

const SOLUTION_ID: usize = 1;
const DEFAULT_CARD_COLOR: &str = "lightgrey";

#[wasm_bindgen]
#[derive(Deserialize, Serialize)]
pub struct JsonColor {
    color: String,
    name: String,
}

#[wasm_bindgen]
#[derive(Clone, Eq, Deserialize, Serialize)]
pub struct Card {
    card_type: CardType,
    name: String,
    #[serde(default)]
    id: usize, // sequential: 0, 1, 2, 3...
}

#[wasm_bindgen]
#[derive(Serialize)]
pub struct JsCard {
    card_type_idx: usize,
    id: usize,
    name: String,
    owner: Player,
}

#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct Player {
    #[wasm_bindgen(getter, setter)]
    id: usize, // by 2: 2, 4, 8, 16, 32...
    #[wasm_bindgen(getter, setter)]
    max_cards: usize,
    #[wasm_bindgen(getter, setter)]
    color: String,
    #[wasm_bindgen(getter, setter)]
    name: String,
}

#[wasm_bindgen]
#[derive(Clone, Deserialize)]
pub struct Guess {
    cards: Vec<Card>,
    who_told: Vec<usize>,
    who_told_not: Vec<usize>,
    guesser: usize,
}

#[wasm_bindgen]
pub struct ClueSolver {
    players: Vec<Player>,
    guesses: Vec<Guess>,
    cards_left_by_type: Vec<Vec<Card>>,
    cards_by_id: Vec<Card>,
    // [bits 31-1 = players][is_solution]
    // so with 3 players 0...01111 means the card could be anyone's
    // 0...00001 would mean that the card is part of the solution
    // 0...00101 would mean that the card is either part of the solution
    // or part of player 2's hand
    // 0...00010 would mean that the card is part of player 1's hand
    owner_mask_by_card_id: Vec<usize>,
    colors: Vec<JsonColor>,
}

trait GuessEngine {
    fn _add_guess(&mut self, guess: Guess);
    fn _new_game(&mut self, options: &GameOptions);

    fn partial_solution(&self) -> Vec<Card>;
    fn _own_card(&mut self, player_id: usize, card: &Card);
    fn _update_player(&mut self, player: Player);

    fn remove_owned_cards(&mut self, guess: &mut Guess) -> bool;
    fn add_not_my_cards(&mut self, guess: &Guess);
    fn resolve_cards_to_who_told(&mut self, guess: &mut Guess) -> usize;
    fn resolve_cards(&mut self, guess: &mut Guess) -> usize;
    fn disable_card(&mut self, card_name: &str);

    fn are_all_cards_known(&self, player: &Player) -> bool;
    fn get_player(&self, player_id: usize) -> Player;
}

impl PartialEq for Card {
    fn eq(&self, other: &Self) -> bool {
        self.id.eq(&other.id)
    }
}

impl PartialOrd for Card {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        self.id.partial_cmp(&other.id)
    }
}

impl Ord for Card {
    fn cmp(&self, other: &Self) -> Ordering {
        self.id.cmp(&other.id)
    }

    fn max(self, other: Self) -> Self {
        let id_of_max = self.id.max(other.id);
        if id_of_max == self.id {
            self
        } else {
            other
        }
    }

    fn min(self, other: Self) -> Self {
        let id_of_min = self.id.min(other.id);
        if id_of_min == self.id {
            self
        } else {
            other
        }
    }
}

#[wasm_bindgen]
impl Player {
    pub fn get_main_player_id() -> usize {
        2
    }
}

#[wasm_bindgen]
impl GameOptions {
    #[wasm_bindgen(constructor)]
    pub fn new() -> GameOptions {
        GameOptions {
            num_players: 2,
            disable_conservatory: false,
        }
    }
}

#[wasm_bindgen]
impl Guess {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Guess {
        Guess {
            cards: Vec::new(),
            who_told: Vec::new(),
            who_told_not: Vec::new(),
            guesser: 0,
        }
    }
}


impl GuessEngine for ClueSolver {
    fn get_player(&self, mut player_id: usize) -> Player {
        let mut idx = 0;
        while player_id > 2 { // player ids start at 2
            player_id >>= 1;
            idx += 1;
        }
        self.players[idx].clone()
    }

    fn are_all_cards_known(&self, player: &Player) -> bool {
        self.owner_mask_by_card_id.iter().filter(|&x| *x == player.id)
            .count() == player.max_cards
    }

    // fn update_cards_left_by_type(&mut self, found_cards: &[Card]) {
    //     for found_card in found_cards {
    //         if let Some(stored_idx) = self.cards_left_by_type[found_card.card_type as usize]
    //                 .iter().position(|c| c == found_card) {
    //             self.cards_left_by_type[found_card.card_type as usize].swap_remove(stored_idx);
    //         }
    //     }
    // }

    fn _add_guess(&mut self, guess: Guess) {
        // Add guess to list, then process all cards in list

        self.guesses.push(guess);

        let mut guess_idx = self.guesses.len() - 1;
        while guess_idx < usize::MAX {
            let mut current = self.guesses[guess_idx].clone();

            // Add the cards in guess to not-my-cards for those who did not show.
            self.add_not_my_cards(&current);

            // Remove cards if we know who they belong to, later removing those
            // cards from self.cards_by_type_left
            let mut cards_resolved = self.resolve_cards(&mut current);

            // If no showers left and guesser cannot have it, IT'S THE ONE
            let player = self.get_player(current.guesser);
            if current.who_told.len() == 0 && self.are_all_cards_known(&player) {
                cards_resolved += current.cards.len();
                for card in current.cards.drain(..) {
                    self._own_card(SOLUTION_ID, &card);
                }
            }

            // If all cards in a guess are known, remove guess from list
            if current.cards.len() == 0 {
                self.guesses.swap_remove(guess_idx);
            } else { // otherwise update the guess in the list
                self.guesses[guess_idx] = current;
            }

            // If only one card of a type is left in cards_left_by_type, add to solution
            let to_be_owned_by_solution = self.cards_left_by_type.iter_mut().filter_map(|x|
                if x.len() == 1 {
                    Some(x.pop().unwrap())
                } else {
                    None
                }
            ).collect::<Vec<Card>>();
            for card in to_be_owned_by_solution {
                self.owner_mask_by_card_id[card.id] = SOLUTION_ID;
            }

            // Calling this down here so we can borrow mut again
            //self.update_cards_left_by_type(&cards_resolved[..]);

            
            guess_idx = if cards_resolved > 0 {
                // Found a new card, go through all the guesses again O(n^2) where n = num of guesses
                self.guesses.len() - 1
            } else {
                // Did not find a new card, move on to the next guess
                guess_idx - 1
            };
        }
    }

    // remove cards mapped to either players or the solution
    fn remove_owned_cards(&mut self, guess: &mut Guess) -> bool {
        let mut were_cards_removed = false;
        let mut card_idx = guess.cards.len() - 1;

        while card_idx > 0 {
            let card = guess.cards[card_idx].clone();
            let mask = self.owner_mask_by_card_id[card.id];
            // if solution bit is 0, a player owns it
            // if the solution bit is 1 and the rest are 0, then it is part of the solution
            if mask % 2 == 0 || mask == SOLUTION_ID {
                guess.cards.remove(card_idx);
                were_cards_removed = true;
                guess.who_told.retain(|x| *x == mask);
            }
            card_idx -= 1;
        }
        were_cards_removed
    }

    fn add_not_my_cards(&mut self, guess: &Guess) {
        let mut no_tell_mask = 0;
        for player_id in &guess.who_told_not {
            no_tell_mask |= player_id;
        }
        for card in &guess.cards {
            self.owner_mask_by_card_id[card.id] &= !no_tell_mask;
        }
    }

    fn partial_solution(&self) -> Vec<Card> {
        self.owner_mask_by_card_id.iter().enumerate()
            .filter_map(|(mask, &idx)|
                if mask == SOLUTION_ID { Some(self.cards_by_id[idx].clone()) } else { None }
            ).collect::<Vec<Card>>()
    }

    fn _own_card(&mut self, player_id: usize, card: &Card) {
        self.cards_left_by_type[card.card_type as usize].retain(|c| c != card);
        self.owner_mask_by_card_id[card.id] = player_id;
    }

    fn resolve_cards_to_who_told(&mut self, guess: &mut Guess) -> usize {
        let mut cards_found = 0;
        let mut told_idx = 0;
        // see if we can assign any of the cards in the guess to
        // the player who has them
        while told_idx < guess.who_told.len() {
            let rat_id = guess.who_told[told_idx];
            let possible_cards = guess.cards.iter()
                .filter(|card| (self.owner_mask_by_card_id[card.id] & rat_id) != 0)
                .collect::<Vec<_>>();
            
            if possible_cards.len() == 0 { // told a card we already know
                alert("why");
            } else if possible_cards.len() == 1 { // told a card we did not know
                // unwrap is fine here, because length is 1
                let found_card = guess.cards.pop().unwrap();
                self._own_card(rat_id, &found_card);
                cards_found += 1;
                guess.who_told.remove(told_idx);
                told_idx = 0; // reduced number of cards, so re-examine any previous tellers
            } else { // too many possible cards, cannot conclude anything
                told_idx += 1;
            }
        }

        cards_found
    }

    fn resolve_cards(&mut self, guess: &mut Guess) -> usize {
        self.remove_owned_cards(guess);
        let mut cards_found = self.resolve_cards_to_who_told(guess);

        // If a card of a type is unresolved, and the solution for that type is known,
        // then the guesser guessed one of his/her own cards.
        let mut card_idx = guess.cards.len() - 1;
        while card_idx < usize::MAX { // yes, using integer overflow to signal the end of the loop
            let card = &guess.cards[card_idx];
            if self.partial_solution().iter().any(|sol_card| sol_card.card_type == card.card_type) {
                self._own_card(guess.guesser, card);
                guess.cards.swap_remove(card_idx);
                cards_found += 1;
            }
            card_idx -= 1;
        }

        cards_found
    }

    fn disable_card(&mut self, card_name: &str) {
        if let Some(idx) = self.cards_by_id.iter().position(|c| &c.name == card_name) {
            self.owner_mask_by_card_id[idx] = 0;
            self._own_card(0, &self.cards_by_id[idx].clone());
        }
    }

    fn _new_game(&mut self, options: &GameOptions) {
        self.guesses.clear();

        // refill self.cards_by_type_left
        self.cards_left_by_type[CardType::Suspect as usize].clear();
        self.cards_left_by_type[CardType::Weapon as usize].clear();
        self.cards_left_by_type[CardType::Room as usize].clear();
        for card in &self.cards_by_id {
            self.cards_left_by_type[card.card_type as usize].push(card.clone());
        }

        // reset self.owner_mask_by_card_id
        self.owner_mask_by_card_id = vec![!0; self.cards_by_id.len()];

        if options.disable_conservatory {
            self.disable_card("Conservatory");
        }

        self.players.clear();
        let total_cards_for_players = self.cards_left_by_type[CardType::Suspect as usize].len()
            + self.cards_left_by_type[CardType::Weapon as usize].len()
            + self.cards_left_by_type[CardType::Room as usize].len()
            - 3; // solution cards
        let extra_cards = total_cards_for_players % options.num_players;
        let base_cards = total_cards_for_players / options.num_players;
        for i in 1..=options.num_players {
            let player = Player {
                id: 1 << i,
                max_cards: base_cards + ((i <= extra_cards) as usize),
                name: String::new(),
                color: String::new(),
            };
            self.players.push(player);
        }
    }

    fn _update_player(&mut self, player: Player) {
        self.players.retain(|p| p.id != player.id);
        self.players.push(player);
    }
}

#[wasm_bindgen]
impl ClueSolver {
    const fn new() -> ClueSolver {
        let cards_left_by_type = Vec::<Vec::<Card>>::new();
        let players = Vec::<Player>::new();

        ClueSolver {
            players: players,
            guesses: Vec::<Guess>::new(),
            cards_left_by_type: cards_left_by_type,
            cards_by_id: Vec::<Card>::new(),
            owner_mask_by_card_id: Vec::<usize>::new(),
            colors: Vec::<JsonColor>::new(),
        }
    }

    pub fn from_json(json_value: JsValue) -> Result<ClueSolver, String> {
        let json_thingy = serde_wasm_bindgen::from_value::<JsonCards>(json_value);
        if let Err(err) = json_thingy {
            return Err(err.to_string());
        }
        let mut json = json_thingy.unwrap();
        let mut solver = ClueSolver::new();
        solver.cards_left_by_type.extend(vec![Vec::<Card>::new(); 3]);
        let mut card_id_counter = 0;

        for mut card in json.cards.drain(..)  {
            card.id = card_id_counter;
            solver.cards_left_by_type[card.card_type as usize].push(card.clone());
            solver.cards_by_id.push(card);
            card_id_counter += 1;
        }
        solver.owner_mask_by_card_id = vec![!0; card_id_counter];

        solver.colors = json.colors;

        Ok(solver)
    }

    pub fn new_game(&mut self, options: &GameOptions) {
        self._new_game(options)
    }

    pub fn get_players(&self) -> js_sys::Array {
        self.players.iter().map(|p| serde_wasm_bindgen::to_value(&p).unwrap()).collect::<js_sys::Array>()
    }

    pub fn get_cards_left_by_type(&self) ->js_sys::Array {
        self.cards_left_by_type.iter().map(|cards|
            cards.iter().map(|c| serde_wasm_bindgen::to_value(&c).unwrap()).collect::<js_sys::Array>()
        ).collect::<js_sys::Array>()
    }

    pub fn own_card(&mut self, player_id: usize, card_id: usize) -> String {
        if card_id < self.cards_by_id.len() {
            let card = self.cards_by_id[card_id].clone();
            self._own_card(player_id, &card);
            String::new()
        } else {
            String::from("card_id out of bounds")
        }
    }

    pub fn get_colors(&self) -> js_sys::Array {
        self.colors.iter().map(|c| serde_wasm_bindgen::to_value(&c).unwrap()).collect::<js_sys::Array>()
    }

    pub fn update_player(&mut self, js_player: JsValue) -> String {
        let json_thingy = serde_wasm_bindgen::from_value::<Player>(js_player);
        if let Err(err) = json_thingy {
            return err.to_string();
        }
        self._update_player(json_thingy.unwrap());
        return String::new();
    }

    pub fn get_card_display_data(&self) -> js_sys::Array {
        let nobody_player = Player {
            id: usize::MAX,
            name: String::new(),
            color: String::from(DEFAULT_CARD_COLOR),
            max_cards: usize::MAX,
        };
        self.cards_by_id.iter().map(|c|
            serde_wasm_bindgen::to_value(
                &JsCard {
                    card_type_idx: c.card_type as usize,
                    id: c.id,
                    name: c.name.clone(),
                    owner: if let Some(owner) = self.players.iter().find(|p| p.id == self.owner_mask_by_card_id[c.id]) {
                        owner.clone()
                    } else {
                        nobody_player.clone()
                    },
                }
            ).unwrap()
        ).collect::<js_sys::Array>()
    }

    pub fn get_card_types(&self) -> js_sys::Array {
        let mut card_types = vec![CardType::Unknown; 3];
        card_types[CardType::Suspect as usize] = CardType::Suspect;
        card_types[CardType::Weapon as usize] = CardType::Weapon;
        card_types[CardType::Room as usize] = CardType::Room;
        card_types.iter().map(|x| serde_wasm_bindgen::to_value(&x).unwrap()).collect::<js_sys::Array>()
    }

    pub fn get_card(&self, id: usize) -> JsValue {
        serde_wasm_bindgen::to_value(&self.cards_by_id[id]).unwrap()
    }

    pub fn add_guess(&mut self, js_guess: JsValue) -> String {
        let guess_box = serde_wasm_bindgen::from_value::<Guess>(js_guess);
        if let Err(err) = guess_box {
            return err.to_string();
        }
        let mut guess = guess_box.unwrap();

        guess.who_told_not = self.players.iter().filter_map(|p|
            if guess.who_told.contains(&p.id) {
                None
            } else {
                Some(p.id)
            }
        ).collect::<Vec<usize>>();

        self._add_guess(guess);
        return String::new();
    }
}
