// handleLeftClick & handleRightClick - event handlers
// requires rootNode to have one element child that also has one element child
function View(handleLeftClick, handleRightClick) {
    var rootNode = document.getElementById("board");
    var flagBox = document.getElementById("flagCounter");
    var nodeMap = [[]];

    ////////////////////////////////////
    // Hidden helper functions
    ////////////////////////////////////

    function createTd(y) {
        var ele = document.createElement("td");
        ele.onclick = handleLeftClick;
        ele.oncontextmenu = handleRightClick;
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

    function addCol(nCols, rowIndex) {
        var row = rootNode.children[rowIndex];
        while (row.children.length < nCols) {
            row.appendChild(createTd(rowIndex));
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

    this.clear = function () {
        for (var nodes of nodeMap) {
            for (var node of nodes) {
                node.classList = ["unseen"];
                node.textContent = "";
                node.setAttribute("val", 0);
            }
        }
    }
    
    this.reSize = function (width, height) {
        setRows(width);
        for (var r = 0; r < rootNode.children.length; r++) {
            addCol(height, r);
        }
    }

}