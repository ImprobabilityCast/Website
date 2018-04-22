////////////////////////////////////
// 15 April 2018
////////////////////////////////////
function Model() {
    var map = [[0]];
    var nMines = 0;
    var nFlags = 0;

    function Tile() {
        return {
            isSeen : false,
            isMine : false,
            isFlag : false,
            count : 0,
            toString : function () {
                return "{ isSeen: " + this.isSeen + ", isMine: "
                    + this.isMine + ", isFlag: " + this.isFlag + ", count: "
                    + this.count + " }";
            }
        }
    }
    
    ////////////////////////////////////
    // Hidden Helper functions
    ////////////////////////////////////

    // Generates a random integer in the range [min, max]
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function incrementIndex(x, y) {
        map[y][x].count++;
    }

    ////////////////////////////////////
    // Public functions
    ////////////////////////////////////

    // requires col >= 0 and row >= 0
    this.setMine = function (col, row) {
        map[row][col].isMine = true;
        var r = row - 1;

        // Increment the values around the mine
        while (r <= row + 1 && r < map.length) {
            var c = col - 1;
            while (c <= col + 1 && c < map[0].length) {
                if (c >= 0 && r >= 0) {
                    incrementIndex(c, r);
                }
                c++;
            }
            r++;
        }
    }

    // Saves the current game.
    this.saveGame = function () {
        localStorage.setItem("map", JSON.stringify(map));
        localStorage.setItem("nMines", JSON.stringify(nMines));
        localStorage.setItem("nFlags", JSON.stringify(nFlags));
    }

    // Loads a saved game.
    // requires a saved game to load
    this.tryLoadGame = function () {
        var newMap = localStorage.getItem("map");
        var newMines = localStorage.getItem("nMines");
        var newFlags = localStorage.getItem("nFlags");
        var result = (newMap != null && newMines != null && newFlags != null);
        if (result) {
            map = JSON.parse(newMap);
            nMines = JSON.parse(newMines);
            nFlags = JSON.parse(newFlags);
        }
        return result;
    }

    this.eraseSavedGame = function () {
        localStorage.removeItem("map");
        localStorage.removeItem("nMines");
        localStorage.removeItem("nFlags");
    }

    // requires numberOfMines <= |map|
    this.randomGame = function (numberOfMines) {
        var mines2set = numberOfMines;
        var coords = [];
        
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[0].length; j++) {
                coords.push([j, i]);
            }
        }

        // set the mines
        while (mines2set > 0) {
            var randIdx = randomInt(0, coords.length - 1);
            // splice always returns an array
            var randCoord = coords.splice(randIdx, 1)[0];
            this.setMine(randCoord[0], randCoord[1]);
            mines2set--;
        }

        nMines = numberOfMines;
    }

    this.setFlag = function (x, y, bool) {
        if (map[y][x].isFlag !== bool) {
            if (bool) {
                nFlags++;
            } else {
                nFlags--;
            }
        }
        map[y][x].isFlag = bool;
    }

    this.isFlag = function (x, y) {
        return map[y][x].isFlag;
    }
    
    this.flagCount = function () {
        return nFlags;
    }

    // returns the number field of map(x, y)
    this.see = function (x, y) {
        map[y][x].isSeen = true;
    }
    
    this.getNumber = function (x, y) {
        return map[y][x].count;
    }

    this.isSeen = function (x, y) {
        return map[y][x].isSeen;
    }
    
    this.isMine = function (x, y) {
        return map[y][x].isMine;
    }

    this.getWidth = function () {
        return map[0].length;
    }

    this.getHeight = function () {
        return map.length;
    }
    
    this.mineCount = function () {
        return nMines;
    }

    this.clear = function () {
        nMines = 0;
        nFlags = 0;
        for (var y = 0; y < map.length; y++) {
            for (var x = 0; x < map[0].length; x++) {
                map[y][x] = new Tile();
            }
        }
    }
    
    // requires width & height to be > 0
    this.reSize = function (width, height) {
        while (map.length < height) {
            map.push([]);
        }
        while (map.length > height) {
            map.pop();
        }

        for (var i = 0; i < map.length; i++) {
            while (map[i].length < width) {
                map[i].push(new Tile());
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
            for (var j = 0; j < i.length; j++) {
                str += i[j].toString();
            }
            console.log(str);
        }
    }
    this.getMap = function () {
        return map;
    }
}
