// Controller
function Controller() {
    var model = new Model();
    var view = new View(handleLeftClick, handleRightClick);

    function handleRightClick(evt) {
        evt.preventDefault();
        var lst = evt.currentTarget.classList;
        if (lst.contains("unseen")) {
            if (lst.contains("flag")) {
                lst.remove("flag");
                lst.add("question");
                evt.currentTarget.textContent = "?";
            } else if (lst.contains("question")) {
                lst.remove("question");
                evt.currentTarget.textContent = "";
            } else {
                lst.add("flag");
            }
        }
    }

    function handleLeftClick(evt) {
        var ele = evt.currentTarget;

        if (model.isZero(ele.col, ele.row)) {
            showZeros(ele.col, ele.row);
        } else if (!model.isFlag(ele.col, ele.row)
                && !model.isSeen(ele.col, ele.row)) {
            ele.classList.remove("unseen");
            ele.classList.remove("question");
            if (model.isMine(ele.col, ele.row)) {
                ele.classList.add("explode");
            } else {
                view.getSquare(x, y).textContent = model.see(x, y);
            }
        }
    }

    // shows zeros and surrounding numbers
    // requires (x, y) = 0
    function showZeros(x, y) {
        var lst = view.getSquare(x, y).classList;
        lst.remove("unseen");
        lst.remove("flag");
        lst.remove("question");

        view.getSquare(x, y).textContent = model.see(x, y);

        var col = x - 1;
        while (col <= x + 1 && col < model.getWidth()) {
            var row = y - 1;
            while (row <= y + 1 && row < model.getHeight()) {
                if (col >= 0 && row >= 0 && !model.isSeen(col, row)) {
                    if (model.isZero(col, row)) {
                        showZeros(col, row);
                    } else {
                        view.getSquare(x, y).textContent = model.see(x, y);
                    }
                }
                row++;
            }
            col++;
        }
    }
}