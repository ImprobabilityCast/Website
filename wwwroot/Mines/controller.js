////////////////////////////////////
// 27 January 2020
////////////////////////////////////

// Controller
function Controller() {
    var model = new Model();
    var view = new View(handleLeftClick, handleRightClick);
    var lost = false;
    var levels = new Map();
	levels.set(10, {width: 8, height: 8});
    levels.set(35, {width: 16, height: 12});
    levels.set(150, {width: 32, height: 24});

    // restore saved game
    if (model.tryLoadGame()) {
        view.reSize(model.getWidth(), model.getHeight());
    } else {
        loadGame(level);
    }

    // make the view refect the model
    for (var x = 0; x < model.getWidth(); x++) {
        for (var y = 0; y < model.getHeight(); y++) {
            var ele = view.getSquare(x, y);
            if (model.isSeen(x, y)) {
                ele.classList.remove("unseen");
                var num = model.getNumber(x, y);
                if (num !== 0) {
                    ele.textContent = num;
                    ele.setAttribute("val", num);
                }
            }
            if (model.isFlag(x, y)) {
                ele.classList.add("flag");
            }
        }
    }
    view.setFlagCount(model.mineCount() - model.flagCount());

    // did we win already?
    if (model.isGameWon()) {
        winEffects();
    }


    function winEffects() {
        var flags = document.getElementsByClassName("unseen");
        for (var f of flags) {
            f.classList.add("win");
            f.classList.add("flag");
            model.setFlag(f.cellIndex, f.parentNode.rowIndex, true);
        }
    }

    function loseEffects() {
        var maxWidth = model.getWidth();
        var maxHeight = model.getHeight();
        for (var x = 0; x < maxWidth; x++) {
            for (var y = 0; y < maxHeight; y++) {
                var lst = view.getSquare(x, y).classList;
                if (model.isMine(x, y) && !model.isFlag(x, y)) {
                    if (!lst.contains("explode")) {
                        lst.add("bomb");
                    }
                } else if (!model.isMine(x, y) && model.isFlag(x, y)) {
                    lst.remove("flag");
                    lst.add("wrong");
                }
            }
        }
    }

    function handleRightClick(evt) {
        evt.preventDefault();
        var ele = evt.currentTarget;
        var lst = ele.classList;
        if (lst.contains("unseen")) {
            if (lst.contains("flag")) {
                lst.remove("flag");
                lst.add("question");
                ele.textContent = "?";
                model.setFlag(ele.cellIndex, ele.parentNode.rowIndex, false);
            } else if (lst.contains("question")) {
                lst.remove("question");
                ele.textContent = "";
            } else if (lst.contains("wrong")) {
                lst.remove("wrong");
                model.setFlag(ele.cellIndex, ele.parentNode.rowIndex, false);
            } else {
                lst.add("flag");
                model.setFlag(ele.cellIndex, ele.parentNode.rowIndex, true);
            }
            view.setFlagCount(model.mineCount() - model.flagCount());
        }
		
		if (!lost) {
			model.saveGame();
		}
    }

    function handleLeftClick(evt) {
        var ele = evt.currentTarget;
        var row = ele.parentNode.rowIndex

        if (!model.isFlag(ele.cellIndex, row)
                && !model.isSeen(ele.cellIndex, row)) {
            if (model.isMine(ele.cellIndex, row)) {
                ele.classList.remove("question");
                ele.classList.remove("bomb");
                ele.classList.remove("unseen");
                ele.classList.add("explode");
                ele.textContent = "";
                loseEffects();
                lost = true;
                model.eraseSavedGame();
            } else {
                showZeros(ele.cellIndex, row);
                // check if we won
				if (!lost) {
					if (model.isGameWon()) {
						winEffects();
						model.eraseSavedGame();
					} else {
						model.saveGame();
					}
				}
                view.setFlagCount(model.mineCount() - model.flagCount());
            }
        }
    }

    // shows zeros and surrounding numbers
    // requires (x, y) is not a mine
    function showZeros(x, y) {
        var lst = view.getSquare(x, y).classList;
        lst.remove("flag");
        lst.remove("question");
        lst.remove("unseen");

        model.setFlag(x, y, false);
        model.see(x, y);
        var num = model.getNumber(x, y);

        if (num === 0) {
            var col = x - 1;
            while (col <= x + 1 && col < model.getWidth()) {
                var row = y - 1;
                while (row <= y + 1 && row < model.getHeight()) {
                    if (col >= 0 && row >= 0 && !model.isSeen(col, row)) {
                        showZeros(col, row);
                    }
                    row++;
                }
                col++;
            }
        } else {
            var node = view.getSquare(x, y);
            node.textContent = num;
            node.setAttribute("val", num);
        }
    }

    function loadGame(level) {
        var params = levels.get(level);
        lost = false;
        model.clear();
        model.reSize(params.width, params.height);
        model.randomGame(level);
        model.eraseSavedGame();

        view.clear();
        view.reSize(params.width, params.height);
        view.setFlagCount(model.mineCount() - model.flagCount());
    }

    ////////////////////////////////////
    // Public functions
    ////////////////////////////////////
    
    this.setCustomLevel = function (name, params) {
        levels.set(name, params);
    }

    this.newGame = function (level) {
        loadGame(level);
    }

    this.eraseSavedGame = function () {
        model.eraseSavedGame();
    }
}