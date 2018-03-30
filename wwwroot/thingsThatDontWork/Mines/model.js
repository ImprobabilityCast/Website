
var map = [];
var nMines;


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


