const board = `
111118111111111118111111
288881818888888818188882
111111111111111111111111
881881888881818888818188
001881111111811111118100
881888800888888008888188
881888800888888008888188
881888800888888008888188
881888800888888008888188
001881111111811111118100
881881888881818888818188
211111111111111111111112
111118111111111118111111
`;

const classes = {
  0: "empty",
  1: "food",
  2: "candy",
  8: "blocked",
};

const game = document.getElementById("game");

class Critter {
  constructor(gameBoard) {
    this.direction = "ArrowRight";
    this.gameBoard = gameBoard;
    this.game = { height: gameBoard.length, width: gameBoard[0].length };
    this.y = gameBoard.length - 1;
    this.x = Math.ceil(gameBoard[0].length / 2);
    this.lastX = this.x;
    this.lastY = this.y;
  }
  setDiriection(direction) {
    this.direction = direction;
  }
  move() {
    const lastX = this.x;
    const lastY = this.y;
    switch (this.direction) {
      case "ArrowRight":
        this.x++;
        break;
      case "ArrowLeft":
        this.x--;
        break;
      case "ArrowUp":
        this.y--;
        break;
      case "ArrowDown":
        this.y++;
        break;
      default:
        return;
    }

    console.log(this.game.width, this.game.height, this.x, this.y);

    if (
      this.x < 0 ||
      this.y < 0 ||
      this.x > this.game.width ||
      this.y >= this.game.height ||
      this.gameBoard[this.y][this.x - 1] === "8"
    ) {
      console.log("hitting wall at", [this.x, this.y]);
      // go backwards (don't bother setting lastX, lastY, because unchanged)
      this.x = lastX;
      this.y = lastY;
    } else {
      // continue forwards (x, y already set)
      this.lastX = lastX;
      this.lastY = lastY;
    }
  }
}

class Game {
  constructor(el) {
    this.el = el;
    this.gameBoard = board
      .trim()
      .split("\n")
      .map((x) => x.split(""));
    this.renderGame();
    this.critter = new Critter(this.gameBoard);
    this.next();
    document.body.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }
  handleKeyPress(e) {
    this.critter.setDiriection(e.key);
  }
  next() {
    let pos = this.critter.y * this.gameBoard[0].length + this.critter.x;
    this.el.childNodes[pos].classList.toggle("cell-withCritter", true);
    pos = this.critter.lastY * this.gameBoard[0].length + this.critter.lastX;
    this.el.childNodes[pos].classList.remove(
      "cell-withCritter",
      "cell-candy",
      "cell-food"
    );
    this.critter.move();
    setTimeout(() => this.next(), 300);
  }
  renderGame() {
    const frag = document.createDocumentFragment();
    for (let row of this.gameBoard) {
      for (let number of row) {
        const div = document.createElement("div");
        div.className = "cell";
        div.classList.add(`cell-${classes[number]}`);
        frag.append(div);
      }
    }
    game.append(frag);
  }
}

new Game(game, board);
