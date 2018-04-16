// handleLeftClick & handleRightClick - event handlers
// requires rootNode to have one element child that also has one element child
function View(handleLeftClick, handleRightClick) {
    var rootNode = document.getElementById("board");
    var flagBox = document.getElementById("flagCounter");
    var nodeMap = [[rootNode.children[0].children[0]]];

    ////////////////////////////////////
    // Hidden helper functions
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
            nodeMap.pop();
        }
        while (nRows > rootNode.children.length) {
            rootNode.appendChild(document.createElement("tr"));
            nodeMap.push([]);
        }
    }

    function addCol(nCols, row) {
        while (row.children.length < nCols) {
            row.appendChild(createTd(row.children.length, row));
            nodeMap[rowIndex].push(row.lastElementChild);
        }
        while (row.children.length > nCols) {
            row.removeChild(row.lastElementChild);
            nodeMap[rowIndex].pop();
        }
    }

    ////////////////////////////////////
    // Public functions
    ////////////////////////////////////

    this.getSquare = function (x, y) {
        return nodeMap[y][x];
    }
    
    this.setFlagCount = function (i) {
        flagBox.textContent = i;
    }

    this.reSize = function (cols, rows) {
        setRows(rows);
        for (var r = 0; r < rootNode.children.length; r++) {
            addCol(cols, rootNode.children[r]);
        }
    }
}