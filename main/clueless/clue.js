import init, { Card, Guess, Player, GameOptions, ClueSolver } from "./pkg/clueless.js";

var solver;
var guessCardsDragDrop = gimmieADraggyDroppy();
var nextStepGuess = gimmieADraggyDroppy();

function cardEl(centerText="?", modalTrigger=""){
  return `
    <div ${modalTrigger} class="cl-card card" draggable="true">
      ${centerText}
    </div>
  `;
}

// very inspired by https://stackoverflow.com/a/12034334
function htmlEscape(str) {
  return (str.replace(/\&/g, '&amp;')
    .replace(/\</g, '&lt;')
    .replace(/\>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/\'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
    .replace(/\`/g, '&#x60;')
    .replace(/\=/g, '&#x3D;')
  );
}

function render() {
  const table = $('#table');
  table.empty();

  let rows = [];
  let hands = [];
  let cardTypes = solver.get_card_types();
  cardTypes.forEach((cardType, idx) => {
    let handBox = $(`
      <div class="p-0" id="${cardType}">
        <div class="hand">
          <h5 class="text-white">
            ${cardType}s
          </h5>
          <div class="cards"></div>
        </div>
      </div>
    `);
    rows[idx] = handBox.find('.cards');
    hands[idx] = handBox; 
  });

  for (let cardData of solver.get_card_display_data()) {
    let row = rows[cardData.card_type_idx];
    let cardEle = $(cardEl(cardData.name));
    cardEle.attr("card-id", cardData.id);
    cardEle.attr("card-type", cardTypes[cardData.card_type_idx]);
    guessCardsDragDrop.registerSource(cardEle);
    cardEle.addClass("owner-" + cardData.owner.color);
    if (cardData.owner.name.length > 0) {
      cardEle.attr("title", htmlEscape(cardData.owner.name) + " has this");
    }
    row.append(cardEle);
  }
  hands.forEach((v, _) => table.append(v));

  // setup guess stuff
  addGuessCards();
  $("#guessBtn").prop("disable", true);
  $('#guessCardsHand').removeClass("d-none");
}

function updatePlayerData() {
  $("#clueStye")[0].sheet
  solver.get_players().forEach((player, _) => {
    let playerSuspect = $("#playerColor" + player.id)[0].selectedOptions[0];
    let nickname = $("#nickname" + player.id).val();
    let numCards = $("#numCards" + player.id + " input:checked").val() - 0;
    player.name = nickname.length > 0 ? nickname : playerSuspect.innerText;
    player.color = playerSuspect.value;
    player.max_cards = numCards;
    let err = solver.update_player(player);
    if (err.length > 0) console.log(err);
  });
}

function gimmieADraggyDroppy() {
  let _obj = {};
  let _moveModeIsMove = true;
  let _selectedSlot = null;

  function _f(func, param = null) {
    (func ?? (() => 0))(param);
  }

  function _clickDestinationNode(e) {
    let data = $(e.target).attr(_obj.identifierName) - 0;
    if (data >= 0 && _moveModeIsMove) { // re-show card hidden on move
      $(`[${_obj.identifierName}="${data}"`).show();
    }

    _f(_obj.unfilter);

    if (_selectedSlot === e.target) {
      _selectedSlot = null;
      // let newDest = _obj.emptySlotGenerator($(e.target).index());
      // _obj.registerDestination(newDest);
      // $(e.target).replaceWith(newDest);
    } else {
      _f(_obj.filter, e.target);
      _selectedSlot = e.target;
    }
  }

  function _clickSourceNode(e) {
    if (_selectedSlot != null) {
      let data = $(e.target).attr(_obj.identifierName) - 0;
      if (_obj.dropCondition(e.target, data)) {
        _moveCard(data, _selectedSlot);
        _selectedSlot = null;
        _f(_obj.unfilter);
      }
    }
  }

  function _unregisterSourceNode(node) {
    node = $(node);
    node[0].removeEventListener("dragstart", _handleDragStart);
    node[0].removeEventListener('click', _clickSourceNode);
  }

  function _moveCard(data, destNode) {
    let og = $(`${_obj.cardBoxId} [${_obj.identifierName}="${data}"`);
    let node = og.clone();
    if (_moveModeIsMove) {
      og.hide();
    }
    node.prop("draggable", _obj.stilDraggableAfterDrop);
    if (!_obj.stilDraggableAfterDrop) _unregisterSourceNode(node);
    _obj.registerDestination(node[0]);
    $(destNode).replaceWith(node);

    _f(_obj.unfilter);
    _f(_obj.onCardMoveComplete);
  }

  function _handleDragOverCard(e) {
    let data = e.dataTransfer.getData("text/plain") - 0;
    if (_obj.dropCondition(e.target, data)) {
      e.preventDefault(); // allow dropping
    }
  }

  function _handleDropCard(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData("text/plain");
    _moveCard(data, e.target);
  }

  function _handleDragStart(e) {
    let identity = $(e.target).attr(_obj.identifierName);
    e.dataTransfer.setData("text/plain", identity);
  }

  _obj = {
    identifierName: "",
    cardBoxId: "",
    onCardMoveComplete: null,
    setMoveCardBehaviorToClone: () => _moveModeIsMove = false,
    setMoveCardBehaviorToMove: () => _moveModeIsMove = true,
    setMoveCardBehaviorToCustom: (customMove) => _moveCard = customMove,
    emptySlotGenerator: (idx) => "",
    stilDraggableAfterDrop: false,
    dropCondition: () => true,
    filter: null,
    unfilter: null,
    registerDestination: function (node) {
      node = $(node);
      let jsNode = node[0];
      jsNode.addEventListener("dragover", _handleDragOverCard);
      jsNode.addEventListener("drop", _handleDropCard);
      node.on("click", _clickDestinationNode);
    },
    registerSource: function(node) {
      node = $(node);
      node[0].addEventListener("dragstart", _handleDragStart);
      node.on('click', _clickSourceNode);
    }
  };
  return _obj;
}

function generateGuessSlot(idx) {
  let cardType = solver.get_card_types()[idx];
  let ele = $(cardEl(cardType, `card-type="${cardType}"`));
  ele.prop("draggable", false);
  ele.addClass("fake-guess-card");
  return ele;
}

function addGuessCards() {
  let mom = $("#guessCards");
  mom.empty();
  for (let idx in solver.get_card_types()) {
    let ele = generateGuessSlot(idx);
    guessCardsDragDrop.registerDestination(ele);
    mom.append(ele);
  }
}

function clickAddGuessBtn() {
  let htmlList = $("#guesserList");
  htmlList.empty();
  for (let player of solver.get_players()) {
    let ele = $(cardEl(player.name, `player-id="${player.id}"`));
    ele.addClass("owner-tab-" + player.color);
    ele.addClass("owner-" + player.color);
    ele.on("click", clickPlayerCard);
    nextStepGuess.registerSource(ele);
    htmlList.append(ele);
  }

  $("#nextGuessStepBtn").prop("disabled", true);

  // disable / hide guess entry cards
  $("#table").toggleClass("d-none");
  $("#guessCardsHand").toggleClass("d-none");
  $("#addGuessPlayersStep").toggleClass("d-none");
}

function clickNextGuessStepBtn() {
  // copy the guessed cards to the next step
  let markerRow = $("<div class='marker-box d-flex position-relative top-50'></div>")[0];
  let guessList = $("#guessList");
  guessList.empty();

  for (let card of $("#guessCards > *")) {
    let newNode = card.cloneNode(true);
    newNode.id = "";
    newNode.append(markerRow.cloneNode());
    $(newNode).attr("max-players", 1);
    nextStepGuess.registerDestination(newNode);
    guessList.append(newNode);
  }
  // add an idk slot after the og cards
  let idkEle = $(cardEl("idk which", "max-players=3"));
  idkEle.addClass("owner-lightgrey");
  idkEle.append(markerRow);
  nextStepGuess.registerDestination(idkEle);
  guessList.append(idkEle);

  clonePlayersLeft();
}

function clickPlayerCard(e) {
  $(e.target.parentElement.children).attr("selected-player", false);
  $(e.target).attr("selected-player", true);
  $("#nextGuessStepBtn").prop("disabled", false);
}

function clonePlayersLeft() {
  let destNode = $("#playerListForGuess");
  destNode.empty();
  for (let playerCard of $("#guesserList > [selected-player=false]")) {
    let cloned = playerCard.cloneNode(true);
    cloned.removeAttribute("selected-player");
    nextStepGuess.registerSource(cloned);
    destNode.append(cloned);
  }
}

function clickFinalGuessBtn() {
  // get data from guess and pass to rust
  let guess = new Guess();
  guess.cards = [];
  guess.who_told = [];
  guess.who_told_not = [];
  for(let card of $("#guessList > div")) {
    let cardId = $(card).attr("card-id");
    let players = $(card).find("[player-id]");
    if (cardId !== undefined) {
      guess.cards.push(solver.get_card(cardId));
      if (players.length > 0) { // will only ever be one here
        solver.own_card(players.attr("player-id"), cardId);
      }
    }
    for (let player of players) {
      guess.who_told.push($(player).attr("player-id"));
    }
  }

  guess.guesser = $("#guesserList > [selected-player=true]").attr("player-id");
  solver.add_guess(guess);

  // reset everything
  $("#table").toggleClass("d-none");
  $("#guessCardsHand").toggleClass("d-none");
  $("#addGuessPlayersStep").toggleClass("d-none");

  // re-render everything from updated rust data
  render();
}

function ownCardForMainPlayer(card) {
  let err = solver.own_card(Player.get_main_player_id(), card.id);
  if (err.length > 0 ) console.log(err);
  let ele = $(cardEl(card.name));
  $('#addCardBtn').before(ele);
  // TODO: remove add button if max cards reached maybe
}

function radioCard(player, val) {
  return (`<input type="radio" class="btn-check" name="numCards${player.id}" id="numCards${player.id}${val}"
    autocomplete="off" ${player.max_cards == val ? "checked" : ""} value="${val}">
    <label class="btn btn-outline-primary" for="numCards${player.id}${val}">${val} Cards</label>
  `);
}

function setupPlayers() {
  let playerNames = $("#playerNamesForm");
  playerNames.empty();
  let idx = 0;
  let players = solver.get_players();
  let maxCards = players[0].max_cards;
  let minCards = players[players.length - 1].max_cards;
  for (let player of  solver.get_players()) {
    let selectPlayerName = $(`<select class="form-select col-md m-1" id="playerColor${player.id}"></select>`);
    for (let colorData of solver.get_colors()) {
      selectPlayerName.append(`<option value="${colorData.color}">${colorData.name}</option>`);
    }
    selectPlayerName[0].selectedIndex = idx++;
    let box = $(`<div class="container row mb-3"></div>`);
    box.append(`<input class="form-control col-md m-1" type="text" id="nickname${player.id}"
      placeholder="${Player.get_main_player_id() == player.id ? "You" : "Nickname"}">`);
    box.append(selectPlayerName);
    if (maxCards != minCards) {
      box.append(`<div class="btn-group col-md m-1" role="group" id="numCards${player.id}">
        ${radioCard(player, minCards)}
        ${radioCard(player, maxCards)}
        </div>`);
    }
    playerNames.append(box);
  }
}

function deal() {
  const numHandsEle = $('#numHands');
  var gameOptions = new GameOptions();
  gameOptions.num_players = clamp(parseInt(numHandsEle.val() || '4', 10), numHandsEle[0].min, numHandsEle[0].max);
  gameOptions.disable_conservatory = Array.from($('#houseRules')[0].selectedOptions).some(i => i.value === "noConservatory");
  solver.new_game(gameOptions);
  setupPlayers();
}

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function populateCardsLeftModal(idx) {
  let parent = $("#cardModalCards");
  parent.empty();
  for (let card of solver.get_cards_left_by_type()[idx]) {
    let ele = $(cardEl(card.name, `data-bs-dismiss="modal"`));
    ele.on('click', () => {
      ownCardForMainPlayer(card);
    });
    parent.append(ele);
  }
}

function setupNextStepGuessCards() {
  let smCardEle = (data) => {
    let result = $(`<div ${nextStepGuess.identifierName}=${data} class="sm-card card me-1 mt-1" draggable="false"></div>`);
    result.on("click", handleMarkerClick);
    let player = solver.get_players().find(p => p.id == data);
    result.addClass("owner-tab-" + player.color);
    return result[0];
  }

  let handleMarkerClick = (e) => {
    $(e.target).remove();
    updateFinGuessBtn();
  }

  let updateFinGuessBtn = () => {
    $("#finalGuessBtn").prop("disabled", $(`#guessList .sm-card`).length <= 3);
  }

  nextStepGuess.setMoveCardBehaviorToCustom((data, destNode) => {
    for (let card of $(`#guessList .sm-card[${nextStepGuess.identifierName}="${data}"`)) {
      $(card).remove();
    }
    let finalDestination = $(destNode).find(".marker-box");
    if ($(destNode).attr("max-players") == finalDestination.children().length) {
      finalDestination.children().first()?.remove();
    }
    let smCard = smCardEle(data);
    finalDestination.append(smCard);
    updateFinGuessBtn();
  });
  
  // button will add guess to rust and refresh with new data from rust
  nextStepGuess.identifierName = "player-id";
  nextStepGuess.cardBoxId = "";
  nextStepGuess.emptySlotGenerator = generateGuessSlot;
}

function setupGuessCards() {
  guessCardsDragDrop.onCardMoveComplete = () => {
    $("#guessBtn").prop("disabled", $("#guessCards > [card-id]").length != 3);
  };
  guessCardsDragDrop.filter = (card) => {
    let cardType = $(card).attr("card-type");
    $(`#table > :not(#${cardType})`).hide();
  };
  guessCardsDragDrop.unfilter = () => $('#table *').show();
  guessCardsDragDrop.identifierName = "card-id";
  guessCardsDragDrop.cardBoxId = "#table";
  guessCardsDragDrop.dropCondition = (card, cardId) => {
    return solver.get_card(cardId).card_type === $(card).attr("card-type");
  };
  guessCardsDragDrop.setMoveCardBehaviorToClone();
  guessCardsDragDrop.emptySlotGenerator = generateGuessSlot;
}

async function startup() {
  await init();
  $.getJSON("./cards.json", function(data) {
    solver = ClueSolver.from_json(data);
    $('#newGameTriggerBtn').prop("disabled", false);
    let modal = $("#cardTypeModalCards");
    let modalTrigger = `data-bs-toggle="modal" data-bs-target="#cardsLeftInTypeModal"`;
    let cardTypes = solver.get_card_types();
    solver.get_cards_left_by_type().forEach((val, i) => {
      let ele = $(cardEl(cardTypes[i], modalTrigger));
      ele.on('click', () => populateCardsLeftModal(i));
      modal.append(ele);
    });
  });
  $('#startGameBtn').on('click', () => {
    $('#formCarousel').hide();
    render();
  });
  setupGuessCards();
  setupNextStepGuessCards();

  $('#updatePlayerDataTrigger').on('click', updatePlayerData);
  $('#newGameTriggerBtn').on('click', deal);
  $('#guessBtn').on('click', clickAddGuessBtn);
  $('#nextGuessStepBtn').on('click', clickNextGuessStepBtn);
  $('#finalGuessBtn').on('click', clickFinalGuessBtn);
}
startup();
