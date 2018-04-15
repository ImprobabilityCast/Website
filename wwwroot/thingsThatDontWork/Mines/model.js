////////////////////////////////////
// 15 April 2018
////////////////////////////////////
function Model() {
    map = [[0]];
    nMines = 0;

    ////////////////////////////////////
    // Hidden Helper functions
    ////////////////////////////////////

    // Generates a random integer in the range [min, max]
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function incrementIndex(x, y) {
        map[x][y]++;
    }

    ////////////////////////////////////
    // Public functions
    ////////////////////////////////////

    // requires col >= 0 and row >= 0
    this.setMine = function (col, row) {
        map[row][col] = -10; // this way mines will always be < 0
        var r = row - 1;

        // Increment the values around the mine
        while (r <= row + 1 && r < map.length) {
            var c = col - 1;
            while (c <= col + 1 && c < map[0].length) {
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
        localStorage.setItem("nMines", nMines);
    }

    // Loads a saved game.
    // requires a saved game to load
    this.loadGame = function () {
        map = localStorage.getItem("map");
        nMines = localStorage.getItem("nMines");
    }

    this.eraseGame = function () {
        localStorage.setItem("map", undefined);
        localStorage.setItem("nMines", undefined);
        map = [[0]];
        nMines = 0;
    }

    // requires numberOfMines <= |map|
    this.randomGame = function (numberOfMines) {
        var mines2set = numberOfMines;
        var coords = [];
        
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[0].length; j++) {
                coords.push([i, j]);
            }
        }

        // set the mines
        while (mines2set > 0) {
            var randIdx = randomInt(0, coords.length - 1);
            // splice always retruns an array
            var randCoord = coords.splice(randIdx, 1)[0];
            this.setMine(randCoord[0], randCoord[1]);
            mines2set--;
        }

        nMines = numberOfMines;
    }
    
    this.flag = function (x, y) {
        map[x][y] = 30 - map[y][x];
    }

    this.isFlag = function (x, y) {
        return (10 < map[y][x]);
    }

    this.isMine = function (x, y) {
        return (map[y][x] < 0);
    }

    this.isZero = function (x, y) {
        return (map[y][x] === 0);
    }

    this.getWidth = function () {
        return map.length;
    }
    
    this.getHeight = function () {
        return map[0].length;
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

    ////////////////////////////
    // DEBUG FUNCTIONS
    ////////////////////////////

    this.printMap = function () {
        for (var i of map) {
            var str = "";
            for (var j of i) {
                str += j + ", ";
            }
            console.log(str);
        }
    }
}
