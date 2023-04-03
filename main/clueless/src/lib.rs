use std::collections::BTreeSet;
use std::cmp::Ordering;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Heyo Bacon McDude {}", name));
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum CardType {
    Unknown = 0,
    Person,
    Room,
    Weapon,
    MaxCardType,
}

#[derive(Clone, Eq)]
struct Card {
    card_type: CardType,
    name: String,
    id: i32,
}

#[derive(Clone)]
struct Player {
    player_id: i32,
    max_cards: usize,
    known_cards: Vec<Card>,
    not_my_cards: BTreeSet<Card>,
}

struct Guess<'a> {
    cards: Vec<Card>,
    who_told: Vec<&'a mut Player>,
    who_told_not: Vec<&'a mut Player>,
    guesser: &'a mut Player,
}

struct ClueSolver<'a> {
    players: Vec<Player>,
    guesses: Vec<Box<Guess<'a>>>,
    cards_left_by_type: Vec<Vec<Card>>,
    solution: Vec<Card>,
}

trait GuessEngine<'a> {
    fn add_guess(&'a mut self, guess: Box<Guess<'a>>);
    fn update_cards_left_by_type(&mut self, found_cards: &Vec<Card>);
    fn new_game(&mut self, num_players: i32);
}

trait KnownCards<'a> {
    fn remove_owned_cards(&mut self, possible_owner: &Player) -> bool;
    fn add_not_my_cards(&mut self);
    fn resolve_cards_to_who_told(&mut self) -> Vec<Card>;
    fn remove_solution(&mut self, partial_solution: &Vec<Card>);
    fn resolve_cards(&mut self, partial_solution: &Vec<Card>) -> Vec<Card>;
}

trait PlayerInfo {
    fn are_all_cards_known(&self) -> bool;
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

impl PlayerInfo for Player {
    fn are_all_cards_known(&self) -> bool {
        self.known_cards.len() == self.max_cards
    }
}

impl <'a> KnownCards<'a> for Guess<'a> {
    fn remove_owned_cards(&mut self, possible_owner: &Player) -> bool {
        let mut were_cards_removed = false;
        let mut card_idx = self.cards.len() - 1;
        while card_idx > 0 {
            let card = self.cards[card_idx].clone();
            if possible_owner.known_cards.contains(&card) {
                self.cards.remove(card_idx);
                were_cards_removed = true;
            }
            card_idx -= 1;
        }
        were_cards_removed
    }

    fn add_not_my_cards(&mut self) {
        for player in &mut self.who_told_not {
            player.not_my_cards.extend(self.cards.clone().into_iter());
        }
    }

    fn resolve_cards_to_who_told(&mut self) -> Vec<Card> {
        let mut cards_found = Vec::<Card>::new();
        let mut told_idx = 0;
        while told_idx < self.who_told.len() {
            let mut told_clone = self.who_told[told_idx].clone();
            let mut possible_cards = self.cards.iter()
                .filter(|card| !told_clone.not_my_cards.contains(&card))
                .collect::<Vec<_>>();
            
            if possible_cards.len() == 0 { // told a card we already know
                self.remove_owned_cards(&told_clone);
                self.who_told.remove(told_idx);
            } else if possible_cards.len() == 1 { // told a card we did not know
                // unwrap is fine here, because length is 1
                let found_card: Card = (*possible_cards.pop().unwrap()).clone();
                self.who_told[told_idx].known_cards.push(found_card.clone());
                cards_found.push(found_card);
                told_clone = self.who_told[told_idx].clone();
                self.remove_owned_cards(&told_clone);
                self.who_told.remove(told_idx);
                told_idx = 0; // reduced number of cards, so re-examine any previous tellers
            } else { // too many possible cards, cannot conclude anything
                told_idx += 1;
            }
        }

        cards_found
    }

    fn remove_solution(&mut self, solution: &Vec<Card>) {
        for solution_card in solution {
            if let Some(idx) = self.cards.iter().position(|c| c == solution_card) {
                self.cards.swap_remove(idx);
            }
        }
    }

    fn resolve_cards(&mut self, partial_solution: &Vec<Card>) -> Vec<Card> {
        self.remove_solution(partial_solution);
        self.remove_owned_cards(&self.guesser.clone());
        
        let mut cards_found = self.resolve_cards_to_who_told();

        // If a card of a type is unresolved, and the solution for that type is known,
        // then the guesser guessed one of his/her own cards.
        let mut card_idx = self.cards.len() - 1;
        while card_idx < usize::MAX { // yes, using integer overflow to signal the end of the loop
            let card = self.cards[card_idx].clone();
            if partial_solution.iter().any(|sol_card| sol_card.card_type == card.card_type) {
                self.guesser.known_cards.push(card);
                let the_same_card = self.cards.swap_remove(card_idx);
                cards_found.push(the_same_card);
            }
            card_idx -= 1;
        }

        cards_found
    }
}

impl <'a> GuessEngine<'a> for ClueSolver<'a> {
    fn update_cards_left_by_type(&mut self, found_cards: &Vec<Card>) {
        for found_card in found_cards {
            if let Some(stored_idx) = self.cards_left_by_type[found_card.card_type as usize]
                    .iter().position(|c| c == found_card) {
                self.cards_left_by_type[found_card.card_type as usize].swap_remove(stored_idx);
            }
        }

        // If only one card of a type is left in cards_left_by_type, add to solution if that
        // type is not already in the solution
        for cards_of_a_type in &self.cards_left_by_type {
            if cards_of_a_type.len() == 1 && !self.solution.contains(&cards_of_a_type[0]) {
                self.solution.push(cards_of_a_type[0].clone());
            }
        }
    }

    fn add_guess(&mut self, guess: Box<Guess<'a>>) {
        // Add guess to list, then process all cards in list

        self.guesses.push(guess);

        let mut guess_idx = 0;
        while guess_idx < self.guesses.len() {
            let current = &mut self.guesses[guess_idx];

            // Add the cards in guess to not-my-cards for those who did not show.
            current.add_not_my_cards();

            // Remove cards if we know who they belong to, later removing those
            // cards from self.cards_by_type_left
            let mut cards_found = current.resolve_cards(&self.solution);

            // If no showers left and guesser cannot have it, IT'S THE ONE
            if current.who_told.len() == 0 && current.guesser.are_all_cards_known() {
                cards_found.extend(current.cards.clone());
                self.solution.extend(current.cards.drain(..));
            }

            // If all cards in a guess are known, remove guess from list
            if current.cards.len() == 0 {
                self.guesses.swap_remove(guess_idx);
            }

            // Calling this down here so we can borrow mut again
            self.update_cards_left_by_type(&cards_found);
            
            guess_idx = if cards_found.len() > 0 {
                // Found a new card, go through all the guesses again O(n^2) where n = num of guesses
                0
            } else {
                // Did not find a new card, move on to the next guess
                guess_idx + 1
            };
        }
    }

    fn new_game(&mut self, num_players: i32) {
        self.players.clear();
        self.solution.clear();
        self.guesses.clear();
    }
}

impl <'a> ClueSolver<'a> {
    const fn new() -> ClueSolver<'a> {
        let cards_left_by_type = Vec::<Vec::<Card>>::new();
        let players = Vec::<Player>::new();

        let card_type = CardType.
        cards_by_type_left.push(Vec::<Card>::new());

        ClueSolver {
            players: players,
            guesses: Vec::<Box::<Guess::<'a>>>::new(),
            cards_left_by_type: cards_left_by_type,
            solution: Vec::<Card>::new(),
        }
    }
}

fn init() {
    let solver = ClueSolver::new();
}