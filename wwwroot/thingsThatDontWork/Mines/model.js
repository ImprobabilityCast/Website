
var map = [];
var nMines;


function incrementIndex(x, y) {
    map[x][y]++;
}

function setMine(row, col) {
    mineIndices.add([row, col]);
    map[row][col] = -10; // this way mines will always be < 0
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

// Saves the current game.
this.saveGame = function () {
    localStorage.setItem("map", map);
}

// Loads a saved game.
// requires a saved game to load
this.loadGame = function () {
    map = localStorage.getItem("map");
}

this.newGame = function () {
    
}

this.randomGame = function () {
    
}

this.eraseGame = function () {
    localStorage.setItem("map", undefined);
}

// requires width & height to be > 0
this.setMapSize = function (width, height) {
    while (map.length < height) {
        map.push([]);
    }
    while (map.length > height) {
        map.pop();
    }
    
    for (var i = 0; i < map.length; i++) {
        while (map[i].length < width) {
            map[i].push(0);
        }
        while (map[i].length > width) {
            map[i].pop();
        }
    }
}


