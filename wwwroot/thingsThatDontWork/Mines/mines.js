// TO DO:   lose/win effects
//          & game options
//          & make this more object oriented.


var boardLock = false;
var map = [];
var mineIndices = new Set();
var msg = document.getElementById("msg");
var board = document.getElementById("board");

var nMines = 3;
var maxCol = 8;
var maxRow = 8;

function showZeros(row, col) {
    var lst = map[row][col].classList;
    lst.remove("unseen");
    lst.remove("flag");
    
    if (lst.contains("question")) {
        lst.remove("question");
        map[row][col].innerHTML = "";
    }

    if ("0" === map[row][col].getAttribute("value")) {
        var r = row - 1;
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
        map[row][col].innerHTML = map[row][col].getAttribute("value");
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function eraseGame() {
    localStorage.game = undefined;
}

function createTd(row, col) {
    var ele = document.createElement("td");
    ele.onclick = handler;
    ele.oncontextmenu = flagger;
    ele.setAttribute("value", 0);
    ele.setAttribute("row", row);
    ele.setAttribute("col", col);
    ele.classList.add("unseen");
    return ele;
}

function incrementIndex(x, y) {
    var val = Number(map[x][y].getAttribute("value")) + 1;
    map[x][y].setAttribute("value", val);
}

function setMine(row, col) {
    mineIndices.add([row, col]);
    map[row][col].mine = true;
    var r = row - 1;
    
    // Increment the values around the mine
    while (r <= row + 1 && r < maxRow) {
        var c = col - 1;
        while (c <= col + 1 && c < maxCol) {
            if (c >= 0 && r >= 0) {
                incrementIndex(r, c);
            }
            c++;
        }
        r++;
    }
}

function setRandomMines(numberOfMines) {
    var mines2set = numberOfMines;
    while (mines2set > 0) {
        var randomRow = randomInt(0, maxRow - 1);
        var randomCol = randomInt(0, maxCol - 1);
        
        if (!mineIndices.has([randomRow, randomCol])) {
            setMine(randomRow, randomCol);
            mines2set--;
        }
    }
}

function setRows(nRows) {
    while (nRows < board.children.length) {
        board.removeChild(board.lastElementChild);
        map.pop();
    }
    while (nRows > board.children.length) {
        board.appendChild(document.createElement("tr"));
        map.push([]);
    }
}

function addCol(nCols, rowIndex) {
    var row = board.children[rowIndex];
    while (row.children.length < nCols) {
        var td = createTd(rowIndex, row.children.length)
        row.appendChild(td);
        map[rowIndex].push(row.lastElementChild);
    }
    while (row.children.length > nCols) {
        row.removeChild(row.lastElementChild);
        map[rowIndex].pop();
    }
}

function reSize(rows, cols) {
    setRows(rows);
    for (var r = 0; r < board.children.length; r++) {
        addCol(cols, r);
    }
}

function clear() {
    mineIndices = new Set();
    for (var a = 0; a < map.length; a++) {
        for (var b = 0; b < map[a].length; b++) {
            map[a][b].innerHTML = "";
            map[a][b].classList.remove("flag");
            map[a][b].setAttribute("value", 0);
            map[a][b].classList.add("unseen");
            map[a][b].mine = false;
        }
    }
    msg.innerHTML = "";
    boardLock = false;
}

function saveGame() {
    if (typeof(Storage) === "undefined") {
        console.log("localStorage is not supported,"
                + "game will not be saved");
    } else {
        var data = {
                    mineIndices : mineIndices,
                    nMines : nMines,
                    maxRow : maxRow,
                    maxCol : maxCol
                    };
        localStorage.game = JSON.stringify(data);
    }
}

function loadGame() {
    if (typeof(Storage) !== undefined && localStorage.game !== undefined) {
        var data = JSON.parse(localStorage.game);
        mineIndices = data.mineIndices;
        nMines = data.nMines;
        maxCol = data.maxCol;
        maxRow = data.maxRow;
        
        clear();
        reSize(maxRow, maxCol);
        
        for (var i = 0; i < board.childElementCount; i++) {
            var row = board.children[i];
            for (var j = 0; j < row.childElementCount; j++) {
                map[i][j] = row.children[j];
            }
        }
        
        for (idx of mineIndices) {
            setMine(idx[0], idx[1]);
        }
    }
}

function newGame(numberOfMines) {
    clear();
    
    if (numberOfMines === undefined || numberOfMines === 0) {
        nMines = Math.floor((maxRow + 1)
                    * (maxCol + 1) * 5 / 32);
    } else {
        nMines = numberOfMines;
    }
    
    setRandomMines(nMines);
}

function isValidInput(target) {
    return Number(target.value) >= Number(target.getAttribute("min"));
}

function stopInvalid(evt) {
    if (!isValidInput(evt.currentTarget) ||
        Number(evt.currentTarget.value).toString() === "NaN") {
            evt.currentTarget.value =
                evt.currentTarget.getAttribute("last-good-input");
    }
    flagInvalid(evt);
}

function flagInvalid(evt) {
    if (isValidInput(evt.currentTarget)) {
        evt.currentTarget.classList.remove("invalid");
        evt.currentTarget.setAttribute("last-good-input",
                                        evt.currentTarget.value);
    } else {
        evt.currentTarget.classList.add("invalid");
    }
}

function nMinesChange(evt) {
    nMines = Number(evt.currentTarget.value);
    newGame(nMines);
}
    
function sizeChange(evt) {
    var options = evt.currentTarget.options;
    var target = options[options.selectedIndex];
    var size = Number(target.getAttribute("size"));
    reSize(size, size);
    newGame(nMines);
}

function handler(evt) {
    var ele = evt.currentTarget;
    if (!ele.classList.contains("flag")
            && ele.classList.contains("unseen")) {
        ele.classList.remove("unseen");
        ele.classList.remove("question");
        
        if (ele.mine) {
            msg.innerHTML = "You Lose!";
        } else {
            showZeros(Number(ele.getAttribute("row")),
                    Number(ele.getAttribute("col")));
        }

        // did we win?
        var unseen = board.getElementsByClassName("unseen");
        if (unseen.length === nMines) {
            msg.innerHTML = "You Win!";
            boardLock = true;
            updateFlagCount();
            eraseGame();
        } else {
            saveGame();
        }
    }
}

function flagger(evt) {
    evt.preventDefault();
    var lst = evt.currentTarget.classList;
    if (lst.contains("unseen") && !boardLock) {
        if (lst.contains("flag")) {
            lst.remove("flag");
            lst.add("question");
            evt.currentTarget.innerHTML = "?";
        } else if (lst.contains("question")) {
            lst.remove("question");
            evt.currentTarget.innerHTML = "";
        } else {
            lst.add("flag");
        }
        updateFlagCount();
        saveGame();
    }
}

function updateFlagCount() {
    document.getElementById("flagCounter").innerHTML = nMines -
                    document.getElementsByClassName("flag").length;
}

