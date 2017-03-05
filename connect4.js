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
    Board.prototype.drop = function (col, player) {
        // the board fills from the bottom up, so check from bottom row and move up
        for (var row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col].owner == Player.None) {
                this.board[row][col].owner = player;
                return [row, col];
            }
        }
        // the column is full, let the caller know
        return [-1, -1];
    };
    Board.prototype.fakeDrop = function (col) {
        // the board fills from the bottom up, so check from bottom row and move up
        for (var row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col].owner == Player.None) {
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
        var _this = this;
        this.turn = "it's your turn! Click a column to drop a token.";
        this.boardElement = element;
        this.board = new Board(6, 7);
        this.mode = Mode.PvP;
        this.currentPlayer = Player.Player1;
        this.drawBoard();
        this.aiNormal = new GameAINormal(Player.Player2, Player.Player1);
        this.aiHard = new GameAIHard(Player.Player2, Player.Player1);
        // set up button listeners
        document.getElementById("pvp").onclick = function () { _this.pvpClicked(); };
        document.getElementById("ai-normal").onclick = function () { _this.aiNormalClicked(); };
        document.getElementById("ai-hard").onclick = function () { _this.aiHardClicked(); };
        // let the current player know that it's their turn...
        document.getElementById("status").textContent = Player[this.currentPlayer] + " " + this.turn;
    }
    Game.prototype.pvpClicked = function () {
        this.reset(Mode.PvP);
    };
    Game.prototype.aiNormalClicked = function () {
        this.reset(Mode.PvAINormal);
    };
    Game.prototype.aiHardClicked = function () {
        this.reset(Mode.PvAIHard);
    };
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
        if (this.win) {
            this.reset(this.mode);
            return;
        }
        switch (this.mode) {
            case Mode.PvP:
                this.pvpHandler(spot);
                break;
            case Mode.PvAINormal:
                this.aiHandler(spot);
                break;
            case Mode.PvAIHard:
                this.aiHandler(spot);
                break;
        }
    };
    Game.prototype.pvpHandler = function (spot) {
        var row = spot.getAttribute("data-row");
        var col = spot.getAttribute("data-col");
        console.log("\"Click at board[" + row + "][" + col + "]\"");
        var coords = this.board.drop(parseInt(col, 10), this.currentPlayer);
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
                document.getElementById("status").textContent = "Game over. Click on the board to reset.";
            }
        }
    };
    Game.prototype.aiHandler = function (spot) {
        if (this.currentPlayer == Player.Player2) {
            document.getElementById("status").textContent = "Not your turn.";
            return;
        }
        if (this.currentPlayer == Player.Player1) {
            this.pvpHandler(spot);
            if (this.win)
                return;
            var coords = void 0;
            (this.mode == Mode.PvAINormal) ? coords = this.aiNormal.pickMove(this.board) : coords = this.aiHard.pickMove(this.board);
            console.log("Dropping token at: " + coords + " for computer");
            if (coords[0] !== -1) {
                var target = document.querySelector("div[data-row='" + coords[0] + "'][data-col='" + coords[1] + "']");
                target.className = "spot player2";
                console.log(this.board.board);
                if (this.win = this.board.win())
                    alert("Computer won!");
                this.currentPlayer = Player.Player1;
            }
            if (coords[0] === -1) {
                // must be a tie
                alert("Tie! Click to play again.");
                this.reset(Mode.PvAINormal);
                return;
            }
            if (!this.win)
                document.getElementById("status").textContent = Player[this.currentPlayer] + " " + this.turn;
            else {
                document.getElementById("status").textContent = "Game over. Click on the board to reset.";
            }
            return;
        }
    };
    Game.prototype.reset = function (mode) {
        this.board = new Board(6, 7);
        this.win = false;
        this.mode = mode;
        this.currentPlayer = Player.Player1;
        while (this.boardElement.hasChildNodes()) {
            this.boardElement.removeChild(this.boardElement.lastChild);
        }
        this.drawBoard();
        // let the current player know that it's their turn...
        document.getElementById("status").textContent = Player[this.currentPlayer] + " " + this.turn;
    };
    return Game;
}());
var GameAINormal = (function () {
    function GameAINormal(me, opponent) {
        this.me = me;
        this.opponent = opponent;
        this.board = new Board(6, 7);
    }
    GameAINormal.prototype.pickMove = function (board) {
        // get the latest board
        this.updateBoard(board);
        // check for a spot where we can go to win
        for (var col = 0; col < board.cols; col++) {
            var target = board.fakeDrop(col);
            if (target[0] !== -1) {
                this.board.drop(col, this.me);
                if (this.board.win()) {
                    // computer wins by going here so do it
                    board.drop(col, this.me);
                    return target;
                }
                else
                    this.board.board[target[0]][target[1]].owner = Player.None;
            }
        }
        // choose a spot at random until an available one is found
        var cols = [0, 1, 2, 3, 4, 5, 6];
        while (cols.length != 0) {
            var col = cols[Math.floor(Math.random() * cols.length)];
            var target = board.fakeDrop(col);
            if (target[0] !== -1) {
                board.drop(col, this.me);
                return target;
            }
        }
        // no spots found, it must be a tie
        return [-1, -1];
    };
    GameAINormal.prototype.updateBoard = function (board) {
        for (var row = 0; row < this.board.rows; row++) {
            for (var col = 0; col < this.board.cols; col++) {
                this.board.board[row][col].owner = board.board[row][col].owner;
            }
        }
        console.log(this.board.board);
    };
    return GameAINormal;
}());
var GameAIHard = (function () {
    function GameAIHard(me, opponent) {
        this.me = me;
        this.opponent = opponent;
        this.board = new Board(6, 7);
    }
    GameAIHard.prototype.pickMove = function (board) {
        // get the latest board
        this.updateBoard(board);
        // check for a spot where we can go to win
        for (var col = 0; col < board.cols; col++) {
            var target = board.fakeDrop(col);
            if (target[0] !== -1) {
                this.board.drop(col, this.me);
                if (this.board.win()) {
                    // computer wins by going here so do it
                    board.drop(col, this.me);
                    return target;
                }
                else
                    this.board.board[target[0]][target[1]].owner = Player.None;
            }
        }
        // check for a spot where we can go to prevent the player from winning
        for (var col = 0; col < board.cols; col++) {
            var target = board.fakeDrop(col);
            if (target[0] !== -1) {
                this.board.drop(col, this.opponent);
                if (this.board.win()) {
                    // computer prevents opponent from winning by going here so do it
                    board.drop(col, this.me);
                    return target;
                }
                else
                    this.board.board[target[0]][target[1]].owner = Player.None;
            }
        }
        // choose a spot at random until an available one is found
        var cols = [0, 1, 2, 3, 4, 5, 6];
        while (cols.length != 0) {
            var col = cols[Math.floor(Math.random() * cols.length)];
            var target = board.fakeDrop(col);
            if (target[0] !== -1) {
                board.drop(col, this.me);
                return target;
            }
        }
        // no spots found, it must be a tie
        return [-1, -1];
    };
    GameAIHard.prototype.updateBoard = function (board) {
        for (var row = 0; row < this.board.rows; row++) {
            for (var col = 0; col < this.board.cols; col++) {
                this.board.board[row][col].owner = board.board[row][col].owner;
            }
        }
        console.log(this.board.board);
    };
    return GameAIHard;
}());
window.onload = function () {
    var el = document.getElementById('board');
    var game = new Game(el);
};
//# sourceMappingURL=connect4.js.map