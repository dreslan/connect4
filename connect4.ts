// used to hold and update the state of a connect4 board
class Board {
    public board: Spot[][];
    public rows: number;
    public cols: number;

    constructor() {
        this.rows = 6;
        this.cols = 7;
        
    }

    public Drop(col: number, player: Player) : boolean {
        return false;
    }

    win(): boolean {
        return false;
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
        // all spots start out empty
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
class Game {
    ui: GameUI;
    manager: GameManager;
    board: Board;

    constructor(el: HTMLElement) {
        this.ui = new GameUI(el);
        this.board = new Board();
        this.manager = new GameManager(this.board, this.ui);
    }
}

// draws and updates the ui
class GameUI {
    boardElement: HTMLElement;
    turn: string = "it's your turn! Click a column to drop a token.";

    constructor(el: HTMLElement) {
        this.boardElement = el;
        this.drawBoard();
    }

    drawBoard() {
        // todo
    }

    drawEmptySpot(row: number, col: number) {
        
    }

    alertPlayerOfTurn(player: Player) {
        // let the current player know that it's their turn...
        document.getElementById("status").textContent = Player[player] + " " + this.turn;
    }
}

// manages game play
class GameManager {
    ui: GameUI;
    board: Board;
    currentPlayer: number;
    win: boolean;
    mode: Mode;

    constructor(board: Board, ui: GameUI) {
        this.board = board;
        this.ui = ui;
        this.mode = Mode.PvP;
        this.currentPlayer = Player.Player1;

        
    }

    // the event handler for a spot that is clicked
    // also will end up handling game play
    // should split this out if time permits
    spotClicked(spot: HTMLElement) {
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