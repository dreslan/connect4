// used to hold and update the state of a connect4 board
var Board = (function () {
    function Board(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.board = [];
        for (var i = 0; i < rows; i++) {
            this.board[i] = [];
            for (var j = 0; j < cols; j++) {
                this.board[i][j] = new Spot();
            }
        }
    }
    Board.prototype.Drop = function (col, player) {
        return false;
    };
    Board.prototype.win = function () {
        return false;
    };
    Board.prototype.checkRowsForWin = function () {
        return false;
    };
    Board.prototype.checkColsForWin = function () {
        return false;
    };
    Board.prototype.checkRightDiagForWin = function () {
        return false;
    };
    Board.prototype.checkLeftDiagForWin = function () {
        return false;
    };
    return Board;
}());
// a spot on a connect4 board
var Spot = (function () {
    function Spot() {
        this.owner = Player.None;
    }
    return Spot;
}());
// model for player
var Player;
(function (Player) {
    Player[Player["None"] = 0] = "None";
    Player[Player["Player1"] = 1] = "Player1";
    Player[Player["Player2"] = 2] = "Player2";
})(Player || (Player = {}));
// model for gamestate
var Mode;
(function (Mode) {
    Mode[Mode["PvP"] = 1] = "PvP";
    Mode[Mode["PvAINormal"] = 2] = "PvAINormal";
    Mode[Mode["PvAIHard"] = 3] = "PvAIHard";
})(Mode || (Mode = {}));
// represents a connect4 webgame
// manages the ui and the gameplay
// would like to break this up more
var Game = (function () {
    function Game(element) {
        this.turn = "it's your turn! Click a column to drop a token.";
        this.boardElement = element;
        this.board = new Board(6, 7);
        this.mode = Mode.PvP;
        this.currentPlayer = Player.Player1;
        this.drawBoard();
        // let the current player know that it's their turn...
        document.getElementById("status").textContent = Player[this.currentPlayer] + " " + this.turn;
    }
    Game.prototype.drawBoard = function () {
        for (var i = 0; i < this.board.rows; i++) {
            for (var j = 0; j < this.board.cols; j++) {
                var spot = this.drawEmptySpot(i, j);
                this.boardElement.appendChild(spot);
                this.board.board[i][j].owner = Player.None;
            }
        }
    };
    Game.prototype.drawEmptySpot = function (row, col) {
        var _this = this;
        var spot = document.createElement("div");
        spot.className = "spot empty";
        spot.setAttribute("data-row", row.toString());
        spot.setAttribute("data-col", col.toString());
        spot.onclick = function () { _this.spotClicked(spot); };
        spot.style.cssText = "top: " + 100 * row + "px; left: " + 100 * col + "px";
        this.board.board[row][col].element = spot;
        return spot;
    };
    Game.prototype.spotClicked = function (spot) {
        if (this.win)
            return;
        var row = spot.getAttribute("data-row");
        var col = spot.getAttribute("data-col");
        console.log("\"Click at board[" + row + "][" + col + "]\"");
    };
    return Game;
}());
var GameAINormal = (function () {
    function GameAINormal() {
    }
    return GameAINormal;
}());
var GameAIHard = (function () {
    function GameAIHard() {
    }
    return GameAIHard;
}());
window.onload = function () {
    var el = document.getElementById('board');
    var game = new Game(el);
};
//# sourceMappingURL=connect4.js.map