// used to hold and update the state of a connect4 board
class Board {
    public element: HTMLElement;
    public board: Spot[][];
    public rows: number;
    public cols: number;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.board = [];
        for (let i = 0; i < rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < cols; j++) {
                this.board[i][j] = new Spot();
            }
        }
    }

    public Drop(col: number, player: Player): number[] {
        // the board fills from the bottom up, so check from bottom row and move up
        for (var row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col].owner == 0) {
                this.board[row][col].owner = player;
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
        return false;
    }

    private checkColsForWin(): boolean {
        return false;
    }

    private checkRightDiagForWin(): boolean {
        return false;
    }

    private checkLeftDiagForWin(): boolean {
        return false;
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

    constructor(element: HTMLElement) {
        this.boardElement = element;
        this.board = new Board(6, 7);
        this.mode = Mode.PvP;
        this.currentPlayer = Player.Player1;
        this.drawBoard();

        // let the current player know that it's their turn...
        document.getElementById("status").textContent = Player[this.currentPlayer] + " " + this.turn;
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
        if (this.win) return;

        let row = spot.getAttribute("data-row");
        let col = spot.getAttribute("data-col");
        console.log(`"Click at board[${row}][${col}]"`);
        let coords = this.board.Drop(parseInt(col, 10), this.currentPlayer);
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
            else document.getElementById("status").textContent = "Game over. Refresh to start over.";
        }
    }
}

class GameAINormal {

}

class GameAIHard {

}

window.onload = () => {
    let el = document.getElementById('board');
    let game = new Game(el);
};