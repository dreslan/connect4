﻿// used to hold and update the state of a connect4 board
class Board {
    public board: Spot[][];
    public rows: number;
    public cols: number;
    public winLength: number;
    private player1Win;
    private player2Win;

    constructor(rows: number, cols: number, winLength: number) {
        this.rows = rows;
        this.cols = cols;
        this.winLength = winLength;
        this.board = [];
        this.player1Win = this.repeatString("1", this.winLength);
        this.player2Win = this.repeatString("2", this.winLength);
        console.log(this.player1Win);
        console.log(this.player2Win);
        for (let i = 0; i < rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < cols; j++) {
                this.board[i][j] = new Spot();
            }
        }
    }

    public drop(col: number, player: Player): number[] {
        // the board fills from the bottom up, so check from bottom row and move up
        for (var row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col].owner == Player.None) {
                this.board[row][col].owner = player;
                return [row, col];
            }
        }
        // the column is full, let the caller know
        return [-1, -1];
    }

    public fakeDrop(col: number): number[] {
        // the board fills from the bottom up, so check from bottom row and move up
        for (var row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col].owner == Player.None) {
                return [row, col];
            }
        }
        // the column is full, let the caller know
        return [-1, -1];
    }

    win(): boolean {
        return this.checkRowsForWin() ? true :
            this.checkColsForWin() ? true :
                this.checkRightDiagForWin() ? true :
                    this.checkLeftDiagForWin() ? true : false;
    }

    private checkRowsForWin(): boolean {
        // check bottom up
        for (let row = this.rows - 1; row > 0; row--) {
            // convert to string to make use of the search method
            let rowHolder = "";
            for (let col = 0; col < this.cols; col++) {
                rowHolder += this.board[row][col].owner;
            }
            if (this.checkStringForWin(rowHolder)) return true;
        }
        return false;
    }

    private checkColsForWin(): boolean {
        for (let col = 0; col < this.cols; col++) {
            // convert to string to make use of search method
            let colHolder = "";
            for (let row = this.rows - 1; row > 0; row--) {
                colHolder += this.board[row][col].owner;
            }
            if (this.checkStringForWin(colHolder)) return true;
        }
        return false;
    }

    private checkRightDiagForWin(): boolean {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                let diag = "";
                diag += this.board[row][col].owner;
                diag += this.board[row + 1][col + 1].owner;
                diag += this.board[row + 2][col + 2].owner;
                diag += this.board[row + 3][col + 3].owner;
                if (this.checkStringForWin(diag)) return true;
            }
        }
        return false;
    }

    private checkLeftDiagForWin(): boolean {
        for (let row = 0; row < 3; row++) {
            for (let col = 6; col > 2; col--) {
                let diag = "";
                diag += this.board[row][col].owner;
                diag += this.board[row + 1][col - 1].owner;
                diag += this.board[row + 2][col - 2].owner;
                diag += this.board[row + 3][col - 3].owner;
                if (this.checkStringForWin(diag)) return true;
            }
        }
        return false;
    }

    checkStringForWin(s: string): boolean {
        if (s.search(this.player1Win) !== -1) {
            return true;
        }
        if (s.search(this.player2Win) !== -1) {
            return true;
        }
        return false;
    }

    repeatString(s: string, numTimesToRepeat: number): string {
        let result = "";
        for (let i = 0; i < numTimesToRepeat; i++) {
            result += s;
        }
        return result;
    }
}

// a spot on a connect4 board
class Spot {
    owner: Player;

    constructor() {
        this.owner = Player.None;
    }
}

// model for player
enum Player {
    None = 0,
    Player1 = 1,
    Player2 = 2
}

// model for gamestate
enum Mode {
    PvP = 1,
    PvAINormal = 2,
    PvAIHard = 3
}

// represents a connect4 webgame
// manages the ui and the gameplay
// would like to break this up more
class Game {
    board: Board;
    currentPlayer: number;
    win: boolean;
    mode: Mode;
    boardElement: HTMLElement;
    turn: string = "it's your turn! Click a column to drop a token.";
    aiNormal: GameAINormal;
    aiHard: GameAIHard;

    constructor(element: HTMLElement) {
        this.boardElement = element;
        this.board = new Board(6, 7, 4);
        this.mode = Mode.PvP;
        this.currentPlayer = Player.Player1;
        this.drawBoard();
        this.aiNormal = new GameAINormal(Player.Player2, Player.Player1, this.board);
        this.aiHard = new GameAIHard(Player.Player2, Player.Player1, this.board);

        // set up button listeners
        document.getElementById("pvp").onclick = () => { this.pvpClicked() };
        document.getElementById("ai-normal").onclick = () => { this.aiNormalClicked() };
        document.getElementById("ai-hard").onclick = () => { this.aiHardClicked() };

        // let the current player know that it's their turn...
        document.getElementById("status").textContent = Player[this.currentPlayer] + " " + this.turn;
    }

    pvpClicked() {
        this.reset(Mode.PvP);
    }

    aiNormalClicked() {
        this.reset(Mode.PvAINormal);
    }

    aiHardClicked() {
        this.reset(Mode.PvAIHard);
    }

    drawBoard() {
        for (let i = 0; i < this.board.rows; i++) {
            for (let j = 0; j < this.board.cols; j++) {
                let spot = this.drawEmptySpot(i, j);
                this.boardElement.appendChild(spot);
                this.board.board[i][j].owner = Player.None;
            }
        }
    }

    drawEmptySpot(row: number, col: number) : HTMLElement {
        let spot = document.createElement("div");
        spot.className = "spot empty";
        spot.setAttribute("data-row", row.toString());
        spot.setAttribute("data-col", col.toString());
        spot.onclick = () => { this.spotClicked(spot) };
        spot.style.cssText = `top: ${100 * row}px; left: ${100 * col}px`;
        return spot;
    }

    // this event handler could use some refactoring
    spotClicked(spot: HTMLElement) {
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
    }

    pvpHandler(spot: HTMLElement) {
        let row = spot.getAttribute("data-row");
        let col = spot.getAttribute("data-col");
        console.log(`"Click at board[${row}][${col}]"`);
        let coords = this.board.drop(parseInt(col, 10), this.currentPlayer);
        console.log("Dropping token at: " + coords);
        if (coords[0] !== -1) {
            let target = document.querySelector(`div[data-row='${coords[0]}'][data-col='${coords[1]}']`);
            if (this.currentPlayer === Player.Player1) {
                target.className = "spot player1";
                this.currentPlayer = Player.Player2;
                if (this.win = this.board.win()) alert("You won Player1!");
            }
            else {
                target.className = "spot player2";
                this.currentPlayer = Player.Player1;
                if (this.win = this.board.win()) alert("You won Player2!");
            }

            if (!this.win) document.getElementById("status").textContent = Player[this.currentPlayer] + " " + this.turn;
            else {
                document.getElementById("status").textContent = "Game over. Click on the board to reset.";
            }
        }
    }

    aiHandler(spot: HTMLElement) {
        if (this.currentPlayer == Player.Player2) {
            document.getElementById("status").textContent = "Not your turn.";
            return;
        }

        if (this.currentPlayer == Player.Player1) {

            this.pvpHandler(spot);

            if (this.win) return;

            let coords : number[];
            (this.mode == Mode.PvAINormal) ? coords = this.aiNormal.pickMove(this.board) : coords = this.aiHard.pickMove(this.board);

            console.log("Dropping token at: " + coords + " for computer");
            if (coords[0] !== -1) {
                let target = document.querySelector(`div[data-row='${coords[0]}'][data-col='${coords[1]}']`);
                target.className = "spot player2";
                console.log(this.board.board);
                if (this.win = this.board.win()) alert("Computer won!");
                this.currentPlayer = Player.Player1;
            }
            if (coords[0] === -1) {
                // must be a tie
                alert("Tie! Click to play again.");
                this.reset(Mode.PvAINormal);
                return;
            }
            if (!this.win) document.getElementById("status").textContent = Player[this.currentPlayer] + " " + this.turn;
            else {
                document.getElementById("status").textContent = "Game over. Click on the board to reset.";
            }
            return;
        }


        
    }

    reset(mode: Mode) {
        this.board = new Board(this.board.rows,this.board.cols, this.board.winLength);
        this.win = false;
        this.mode = mode;
        this.currentPlayer = Player.Player1;
        while (this.boardElement.hasChildNodes()) {
            this.boardElement.removeChild(this.boardElement.lastChild);
        }
        this.drawBoard();
        // let the current player know that it's their turn...
        document.getElementById("status").textContent = Player[this.currentPlayer] + " " + this.turn; 
    }
}

class GameAINormal {
    me: Player;
    opponent: Player;
    board: Board;

    constructor(me: Player, opponent: Player, board: Board) {
        this.me = me;
        this.opponent = opponent;
        this.board = new Board(board.rows, board.cols, board.winLength);
    }

    pickMove(board: Board): number[] {
        // get the latest board
        this.updateBoard(board);

        // check for a spot where we can go to win
        for (let col = 0; col < board.cols; col++) {
            let target = board.fakeDrop(col);
            if (target[0] !== -1) {
                this.board.drop(col, this.me);
                if (this.board.win()) {
                    // computer wins by going here so do it
                    board.drop(col, this.me);
                    return target;
                }
                else this.board.board[target[0]][target[1]].owner = Player.None;
             }
         }

        // choose a spot at random until an available one is found
        let cols : number[] = [board.cols];
        for (let i = 0; i < board.cols; i++) {
            cols[i] = i;
        }
        while (cols.length != 0) {
            let col = cols[Math.floor(Math.random() * cols.length)];
            let target = board.fakeDrop(col);
            if (target[0] !== -1) {
                board.drop(col, this.me);
                return target;
            }
        }

        // no spots found, it must be a tie
        return [-1, -1];
    }

    updateBoard(board: Board) {
        for (let row = 0; row < this.board.rows; row++) {
            for (let col = 0; col < this.board.cols; col++) {
                this.board.board[row][col].owner = board.board[row][col].owner;
            }
        }
        console.log(this.board.board);
    }
}


class GameAIHard {
    me: Player;
    opponent: Player;
    board: Board;

    constructor(me: Player, opponent: Player, board: Board) {
        this.me = me;
        this.opponent = opponent;
        this.board = new Board(board.rows, board.cols, board.winLength);
    }

    pickMove(board: Board): number[] {
        // get the latest board
        this.updateBoard(board);

        // check for a spot where we can go to win
        for (let col = 0; col < board.cols; col++) {
            let target = board.fakeDrop(col);
            if (target[0] !== -1) {
                this.board.drop(col, this.me);
                if (this.board.win()) {
                    // computer wins by going here so do it
                    board.drop(col, this.me);
                    return target;
                }
                else this.board.board[target[0]][target[1]].owner = Player.None;
            }
        }
        // check for a spot where we can go to prevent the player from winning
        for (let col = 0; col < board.cols; col++) {
            let target = board.fakeDrop(col);
            if (target[0] !== -1) {
                this.board.drop(col, this.opponent);
                if (this.board.win()) {
                    // computer prevents opponent from winning by going here so do it
                    board.drop(col, this.me);
                    return target;
                }
                else this.board.board[target[0]][target[1]].owner = Player.None;
            }
        }

        // choose a spot at random until an available one is found
        let cols = [0, 1, 2, 3, 4, 5, 6];
        while (cols.length != 0) {
            let col = cols[Math.floor(Math.random() * cols.length)];
            let target = board.fakeDrop(col);
            if (target[0] !== -1) {
                board.drop(col, this.me);
                return target;
            }
        }

        // no spots found, it must be a tie
        return [-1, -1];
    }

    updateBoard(board: Board) {
        for (let row = 0; row < this.board.rows; row++) {
            for (let col = 0; col < this.board.cols; col++) {
                this.board.board[row][col].owner = board.board[row][col].owner;
            }
        }
        console.log(this.board.board);
    }
}

window.onload = () => {
    let el = document.getElementById('board');
    let game = new Game(el);
};