const board = `
111118111111111118111111
281818118888888818181882
111111111111111111111111
881881881881818888818188
011811111118111111181001
881888801888188008888188
881888801888188008888188
881811111888111118888188
881888800888888008888188
001881111111811111118111
881881888881818888818181
211111111111111111111182
111118111111111118111111
`;

const style = getComputedStyle(document.documentElement);
const CELL_SIZE = parseInt(style.getPropertyValue("--cell-size"), 10);
const MOVE_TIME = parseInt(style.getPropertyValue("--move-time"), 10);

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
    this.el = document.createElement("div");
    this.el.classList.add("critter");
  }
  setDiriection(direction) {
    this.direction = direction;
  }
  disableBeastMode() {
    this.el.classList.remove("critter-beast");
  }
  enableBeastMode() {
    this.el.classList.add("critter-beast");
    clearTimeout(this.beastTimer);
    this.beastTimer = setTimeout(() => this.disableBeastMode(), 7500);
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

    const current = this.gameBoard?.[this.y]?.[this.x];

    if (
      this.x < 0 ||
      this.y < 0 ||
      this.x > this.game.width ||
      this.y >= this.game.height ||
      current === "8"
    ) {
      // console.log("hitting wall at", [this.x, this.y]);
      // go backwards (don't bother setting lastX, lastY, because unchanged)
      this.x = lastX;
      this.y = lastY;
    } else {
      // continue forwards (x, y already set)
      this.lastX = lastX;
      this.lastY = lastY;
    }

    if (current === "2") {
      this.enableBeastMode();
    }

    const x = this.x * CELL_SIZE;
    const y = this.y * CELL_SIZE;
    this.el.style.transform = `translate(${x}px, ${y}px)`;
  }
}

class Game {
  constructor(el) {
    this.el = el;
    this.gameBoard = board
      .trim()
      .split("\n")
      .map((x) => x.split(""));
    this.critter = new Critter(this.gameBoard);
    this.renderGame(this.critter);
    this.next();
    document.body.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }
  handleKeyPress(e) {
    this.critter.setDiriection(e.key);
  }
  next() {
    let pos = this.critter.y * this.gameBoard[0].length + this.critter.x + 1;
    this.el.childNodes[pos].classList.remove("cell-candy", "cell-food");
    this.critter.move();
    setTimeout(() => this.next(), MOVE_TIME);
  }
  renderGame(critter) {
    const frag = document.createDocumentFragment();
    for (let row of this.gameBoard) {
      for (let number of row) {
        const div = document.createElement("div");
        div.className = "cell";
        div.classList.add(`cell-${classes[number]}`);
        frag.append(div);
      }
    }
    frag.append(critter.el);
    game.append(frag);
  }
}

new Game(game, board);
