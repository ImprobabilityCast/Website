// Controller
function Controller() {
    var model = new Model();
    var view = new View(handleLeftClick, handleRightClick);

    // restore saved game
    if (!model.tryLoadGame()) {
        // set up default game
        model.reSize(8, 8);
        model.randomGame(10);
    }
    view.reSize(model.getWidth(), model.getHeight());
    
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

    function handleRightClick(evt) {
        evt.preventDefault();
        var ele = evt.currentTarget;
        var lst = ele.classList;
        if (lst.contains("unseen")) {
            if (lst.contains("flag")) {
                lst.remove("flag");
                lst.add("question");
                ele.textContent = "?";
                model.setFlag(ele.cellIndex, ele.rowIndex, false);
            } else if (lst.contains("question")) {
                lst.remove("question");
                ele.textContent = "";
            } else {
                lst.add("flag");
                model.setFlag(ele.cellIndex, ele.rowIndex, true);
            }
            view.setFlagCount(model.mineCount() - model.flagCount());
        }
        model.saveGame();
    }

    function handleLeftClick(evt) {
        var ele = evt.currentTarget;

        if (!model.isFlag(ele.cellIndex, ele.rowIndex)
                && !model.isSeen(ele.cellIndex, ele.rowIndex)) {
            if (model.isMine(ele.cellIndex, ele.rowIndex)) {
                ele.classList.remove("unseen");
                ele.classList.remove("question");
                ele.classList.add("explode");
                ele.textContent = "";
            } else {
                showZeros(ele.cellIndex, ele.rowIndex);
            }
        }
        model.saveGame();
    }

    // shows zeros and surrounding numbers
    // requires (x, y) = 0
    function showZeros(x, y) {
        var lst = view.getSquare(x, y).classList;
        lst.remove("unseen");
        lst.remove("flag");
        lst.remove("question");

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
    
    this.newGame = function () {
        view.clear();
        model.clear();
        model.randomGame(10);
        model.eraseSavedGame();
        view.setFlagCount(model.mineCount() - model.flagCount());
    }

    this.eraseSavedGame = function () {
        model.eraseSavedGame();
    }
}