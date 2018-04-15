// Controller
function Controller() {
    var model = new Model();
    //var view = new View();
    
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
        if (!ele.classList.contains("flag")
                && ele.classList.contains("unseen")) {
            ele.classList.remove("unseen");
            ele.classList.remove("question");

            showZeros(ele.row, ele.col);
        }
    }

    function showZeros(x, y) {
        var lst = map[row][col].classList;
        lst.remove("unseen");
        lst.remove("flag");
        
        if (lst.contains("question")) {
            lst.remove("question");
            map[row][col].textContent = "";
        }

        if (0 === map[row][col].val) {
            var r = x - 1;
            while (r <= row + 1 && r < maxRow) {
                var c = col - 1;
                while (c <= col + 1 && c < maxCol) {
                    if (c >= 0 && r >= 0
                            && map[r][c].classList.contains("unseen")) {
                        showZeros(r, c);
                    }
                    c++;
                }
                r++;
            }
        } else {
            map[row][col].textContent = map[row][col].val;
        }
    }