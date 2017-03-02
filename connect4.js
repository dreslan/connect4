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
        // the board fills from the bottom up, so check from bottom row and move up
        for (var row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col].owner == 0) {
                this.board[row][col].owner = player;
                return [row, col];
            }
        }
        // the column is full, let the caller know
        return [-1, -1];
    };
    Board.prototype.win = function () {
        return this.checkRowsForWin() ? true :
            this.checkColsForWin() ? true :
                this.checkRightDiagForWin() ? true :
                    this.checkLeftDiagForWin() ? true : false;
    };
    Board.prototype.checkRowsForWin = function () {
        // check bottom up
        for (var row = this.rows - 1; row > 0; row--) {
            // convert to string to make use of the search method
            var rowHolder = "";
            for (var col = 0; col < this.cols; col++) {
                rowHolder += this.board[row][col].owner;
            }
            if (this.checkStringForWin(rowHolder))
                return true;
        }
        return false;
    };
    Board.prototype.checkColsForWin = function () {
        for (var col = 0; col < this.cols; col++) {
            // convert to string to make use of search method
            var colHolder = "";
            for (var row = this.rows - 1; row > 0; row--) {
                colHolder += this.board[row][col].owner;
            }
            if (this.checkStringForWin(colHolder))
                return true;
        }
        return false;
    };
    Board.prototype.checkRightDiagForWin = function () {
        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 4; col++) {
                var diag = "";
                diag += this.board[row][col].owner;
                diag += this.board[row + 1][col + 1].owner;
                diag += this.board[row + 2][col + 2].owner;
                diag += this.board[row + 3][col + 3].owner;
                if (this.checkStringForWin(diag))
                    return true;
            }
        }
        return false;
    };
    Board.prototype.checkLeftDiagForWin = function () {
        for (var row = 0; row < 3; row++) {
            for (var col = 6; col > 2; col--) {
                var diag = "";
                diag += this.board[row][col].owner;
                diag += this.board[row + 1][col - 1].owner;
                diag += this.board[row + 2][col - 2].owner;
                diag += this.board[row + 3][col - 3].owner;
                if (this.checkStringForWin(diag))
                    return true;
            }
        }
        return false;
    };
    Board.prototype.checkStringForWin = function (s) {
        if (s.search("1111") !== -1) {
            return true;
        }
        if (s.search("2222") !== -1) {
            return true;
        }
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
        return spot;
    };
    // this event handler could use some refactoring
    Game.prototype.spotClicked = function (spot) {
        if (this.win)
            return;
        var row = spot.getAttribute("data-row");
        var col = spot.getAttribute("data-col");
        console.log("\"Click at board[" + row + "][" + col + "]\"");
        var coords = this.board.Drop(parseInt(col, 10), this.currentPlayer);
        console.log("Dropping token at: " + coords);
        if (coords[0] !== -1) {
            var target = document.querySelector("div[data-row='" + coords[0] + "'][data-col='" + coords[1] + "']");
            if (this.currentPlayer === Player.Player1) {
                target.className = "spot player1";
                this.currentPlayer = Player.Player2;
                if (this.win = this.board.win())
                    alert("You won Player1!");
            }
            else {
                target.className = "spot player2";
                this.currentPlayer = Player.Player1;
                if (this.win = this.board.win())
                    alert("You won Player2!");
            }
            if (!this.win)
                document.getElementById("status").textContent = Player[this.currentPlayer] + " " + this.turn;
            else {
                document.getElementById("status").textContent = "Game over. Refresh to start over.";
                this.reset();
            }
        }
    };
    Game.prototype.reset = function () {
        this.board = new Board(6, 7);
        this.win = false;
        this.drawBoard();
    };
    return Game;
}());
var GameAINormal = (function () {
    function GameAINormal(me, opponent) {
        this.me = me;
        this.me = opponent;
        this.board = new Board(6, 7);
    }
    GameAINormal.prototype.pickMove = function (board) {
        //first get a local copy of the board state to work with
        this.updateBoard(board);
        // check for a spot where we can go to prevent the player from winning
        // choose first available spot
        for (var col = 0; col < board.cols; col++) {
            var target = this.board.Drop(col, this.me);
            if (target !== [-1, -1])
                return target;
        }
        return [-1, -1];
    };
    GameAINormal.prototype.updateBoard = function (board) {
        for (var row = 0; row < board.rows; row++) {
            for (var col = 0; col < board.cols; col++) {
                this.board.board[row][col] = board.board[row][col];
            }
        }
    };
    return GameAINormal;
}());
var GameAIHard = (function () {
    function GameAIHard() {
    }
    GameAIHard.prototype.pickMove = function (board) {
        // check for a spot where we can go to prevent the player from winning
        // check for a spot where we can go to prevent the player from winning
        // choose first available spot
        return [-1, -1];
    };
    return GameAIHard;
}());
window.onload = function () {
    var el = document.getElementById('board');
    var game = new Game(el);
};
//# sourceMappingURL=connect4.js.map