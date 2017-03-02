// used to hold and update the state of a connect4 board
var Board = (function () {
    function Board() {
        this.rows = 6;
        this.cols = 7;
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
        // all spots start out empty
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
var Game = (function () {
    function Game(el) {
        this.ui = new GameUI(el);
        this.board = new Board();
        this.manager = new GameManager(this.board, this.ui);
    }
    return Game;
}());
// draws and updates the ui
var GameUI = (function () {
    function GameUI(el) {
        this.turn = "it's your turn! Click a column to drop a token.";
        this.boardElement = el;
        this.drawBoard();
    }
    GameUI.prototype.drawBoard = function () {
        // todo
    };
    GameUI.prototype.drawEmptySpot = function (row, col) {
    };
    GameUI.prototype.alertPlayerOfTurn = function (player) {
        // let the current player know that it's their turn...
        document.getElementById("status").textContent = Player[player] + " " + this.turn;
    };
    return GameUI;
}());
// manages game play
var GameManager = (function () {
    function GameManager(board, ui) {
        this.board = board;
        this.ui = ui;
        this.mode = Mode.PvP;
        this.currentPlayer = Player.Player1;
    }
    // the event handler for a spot that is clicked
    // also will end up handling game play
    // should split this out if time permits
    GameManager.prototype.spotClicked = function (spot) {
    };
    return GameManager;
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