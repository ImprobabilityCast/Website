// handleLeftClick & handleRightClick - event handlers
// requires rootNode to have one element child
function View(rootNode, handleLeftClick, handleRightClick) {
    var nodeMap = [[rootNode.children[0]]];

    ////////////////////////////////////
    // Hidden Helper functions
    ////////////////////////////////////
    
    function createTd(x, y) {
        var ele = document.createElement("td");
        ele.onclick = handleLeftClick;
        ele.oncontextmenu = handleRightClick;
        ele.col = x;
        ele.row = y;
        ele.classList.add("unseen");
        return ele;
    }

    function setRows(nRows) {
        while (nRows < rootNode.children.length) {
            rootNode.removeChild(rootNode.lastElementChild);
            map.pop();
        }
        while (nRows > rootNode.children.length) {
            rootNode.appendChild(document.createElement("tr"));
            map.push([]);
        }
    }

    function addCol(nCols, row) {
        while (row.children.length < nCols) {
            row.appendChild(createTd(row.children.length, row));
            map[rowIndex].push(row.lastElementChild);
        }
        while (row.children.length > nCols) {
            row.removeChild(row.lastElementChild);
            map[rowIndex].pop();
        }
    }

    ////////////////////////////////////
    // Public functions
    ////////////////////////////////////

    this.reSize = function (cols, rows) {
        setRows(rows);
        for (var r = 0; r < rootNode.children.length; r++) {
            addCol(cols, rootNode.children[r]);
        }
    }

    // resets game to begining
    this.reset = function () {
        for (var a = 0; a < map.length; a++) {
            for (var b = 0; b < map[a].length; b++) {
                map[a][b].textContent = "";
                map[a][b].classList.remove("flag");
                map[a][b].val = 0;
                map[a][b].classList.add("unseen");
            }
        }
    }
}