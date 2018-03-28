// TO DO: save game /w localstorage + JSON
//          & lose/win effects
//          & game options

Mines = function (board) {
    var nMines = 0;
    var boardLock = false;
    var map = [];
    var tileMap = [];
    var maxRow, maxCol;
    var msg = document.getElementById("msg");
    
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    function isGoodIndex(r, c) {
        return map[r][c].classList.contains("unseen");
    }
    
    function showZeros(row, col) {
        
        map[row][col].classList.remove("unseen");
        map[row][col].classList.remove("flag");
        if (map[row][col].classList.contains("question")) {
            map[row][col].classList.remove("question");
            map[row][col].innerHTML = "";
        }
        
        if (0 === Number(map[row][col].getAttribute("value"))) {
            if (row !== maxRow && isGoodIndex(row + 1, col)) {
                    showZeros(row + 1, col);
            }
            if (row !== 0 && isGoodIndex(row - 1, col)) {
                    showZeros(row - 1, col);
            }
            if (col !== maxCol && isGoodIndex(row, col + 1)) {
                    showZeros(row, col + 1);
            }
            if (col !== 0 && isGoodIndex(row, col - 1)) {
                    showZeros(row, col - 1);
            }
            
            if (row !== maxRow && col !== maxCol
                && isGoodIndex(row + 1, col + 1)) {
                    showZeros(row + 1, col + 1);
            }
            if (row !== 0 && col !== maxCol
                && isGoodIndex(row - 1, col + 1)) {
                    showZeros(row - 1, col + 1);
            }
            if (row !== maxRow && col !== 0
                && isGoodIndex(row + 1, col - 1)) {
                    showZeros(row + 1, col - 1);
            }
            if (row !== 0 && col !== 0
                && isGoodIndex(row - 1, col - 1)) {
                    showZeros(row - 1, col - 1);
            }
        } else {
            map[row][col].innerHTML = map[row][col].getAttribute("value");
        }
    }
    
    function handler (evt) {
        var ele = evt.currentTarget;
        if (!ele.classList.contains("flag")
                && ele.classList.contains("unseen")) {
            ele.classList.remove("unseen");
            ele.classList.remove("question");
            if (ele.mine) {
                msg.innerHTML = "You Lose!";
            } else {
                if (Number(ele.getAttribute("value")) === 0) {
                    showZeros(Number(ele.getAttribute("row")),
                                Number(ele.getAttribute("col")));
                    updateFlagCount();
                } else {
                    ele.innerHTML = ele.getAttribute("value");
                }
            }
            // did we win?
            var unseen = board.getElementsByClassName("unseen");
            if (unseen.length === nMines) {
                var correct = 0;
                for (var a of unseen) {
                    if (a.mine) {
                        correct++;
                    }
                }
                if (correct === nMines) {
                    for (var a=0; a<unseen.length; a++) {
                        unseen[a].classList.add("flag");
                    }
                    msg.innerHTML = "You Win!";
                    boardLock = true;
                    updateFlagCount();
                    localStorage.game = null;
                }
            } else {
                saveGame(ele);
            }
        }
    }
    
    function updateFlagCount() {
        document.getElementById("flagCounter").innerHTML = nMines -
                        document.getElementsByClassName("flag").length;
    }
    
    function flagger (evt) {
        evt.preventDefault();
        var lst = evt.currentTarget.classList;
        //evt.currentTarget.classList.toggle("flag");
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
            saveGame(evt.currentTarget);
        }
    }

    function createTd (row, col) {
        var ele = document.createElement("td");
        ele.onclick = handler;
        ele.oncontextmenu = flagger;
        ele.setAttribute("row", row);
        ele.setAttribute("col", col);
        ele.setAttribute("value", 0);
        ele.classList.add("unseen");
        ele.mine = false;
        return ele;
    }
    
    function setRows(nRows) {
        while (nRows < board.children.length) {
            board.removeChild(board.lastElementChild);
            map.pop();
            tileMap.pop();
        }
        while (nRows > board.children.length) {
            board.appendChild(document.createElement("tr"));
            map.push([]);
            tileMap.push([]);
        }
    }
    
    function addCol(nCols, rowIndex) {
        var row = board.children[rowIndex];
        while (row.children.length < nCols) {
            row.appendChild(createTd(rowIndex,
                                     row.children.length));
            map[rowIndex].push(row.lastElementChild);
            tileMap[rowIndex].push(new Tile(row.lastElementChild));
        }
        while (row.children.length > nCols) {
            row.removeChild(row.lastElementChild);
            map[rowIndex].pop();
            tileMap[rowIndex].pop();
        }
    }
    
    function incrementIndex(x, y) {
        var val = Number(map[x][y].getAttribute("value")) + 1;
        map[x][y].setAttribute("value", val);
    }
    
    function setMines(maxRow, maxCol) {
        var randomRow = randomInt(0, maxRow);
        var randomCol = randomInt(0, maxCol);
        
        if (map[randomRow][randomCol].mine) {
            setMines(maxRow, maxCol);
            return;
        } else {
            map[randomRow][randomCol].mine = true;
        }
        
        if (randomRow !== 0) {
            incrementIndex(randomRow - 1, randomCol);
        }
        if (randomRow !== maxRow) {
            incrementIndex(randomRow + 1, randomCol);
        }
        if (randomCol !== 0) {
            incrementIndex(randomRow, randomCol - 1);
        }
        if (randomCol !== maxCol) {
            incrementIndex(randomRow, randomCol + 1);
        }
        
        if (randomRow !== 0 && randomCol !== 0) {
            incrementIndex(randomRow - 1, randomCol - 1);
        }
        if (randomRow !== maxRow && randomCol !== 0) {
            incrementIndex(randomRow + 1, randomCol - 1);
        }
        if (randomRow !== 0 && randomCol !== maxCol) {
            incrementIndex(randomRow - 1, randomCol + 1);
        }
        if (randomRow !== maxRow && randomCol !== maxCol) {
            incrementIndex(randomRow + 1, randomCol + 1);
        }
    }

    function saveGame(changedElement) {
        tileMap[changedElement.getAttribute("row")]
               [changedElement.getAttribute("col")] =
                        new Tile(changedElement);
        var obj = {
                    "map" : tileMap,
                    "nMines" : nMines,
                    "nRows" : maxRow + 1,
                    "nCols" : maxCol + 1
                    };
        localStorage.game = JSON.stringify(obj);
    }
    
    //this.loadGame()
    
    this.nMinesChange = function (evt) {
        nMines = Number(evt.currentTarget.value);
        this.newGame(board.children.length,
                     board.children[0].length,
                     nMines);
    }
    
    this.sizeChange = function (evt) {
        var options = evt.currentTarget.options;
        var target = options[options.selectedIndex];
        var size = Number(target.getAttribute("size"));
        this.newGame(size, size, nMines);
    }
    
    this.reSize = function (rows, cols) {
        setRows(rows);
        for (var r=0; r<board.children.length; r++) {
            addCol(cols, r);
        }
    };
    
    this.clear = function () {
        for (var a=0; a<map.length; a++) {
            for (var b=0; b<map[0].length; b++) {
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
    
    this.newGame = function (nRows, nCols,
                             numberOfMines) {
        this.clear();
        if (nRows !== undefined && nCols !== undefined) {
            this.reSize(nRows, nCols);
            maxCol = nCols - 1;
            maxRow = nRows - 1;
        }
        
        if (numberOfMines === undefined) {
            if (nMines === 0) {
                nMines = Math.floor((maxRow + 1) * (maxCol + 1) * 5 / 32);
            }
        } else {
            nMines = numberOfMines;
        }
        var miner = nMines;
        while (miner != 0) {
            setMines(maxRow, maxCol);
            miner--;
        }
        updateFlagCount();
    }
        
};
