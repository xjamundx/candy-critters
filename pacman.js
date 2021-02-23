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
    this.direction = "down";
    this.gameBoard = gameBoard;
    this.game = { height: gameBoard.length, width: gameBoard[0].length };
    this.y = gameBoard.length - 1;
    this.x = Math.ceil(gameBoard[0].length / 2);
    this.lastX = this.x;
    this.lastY = this.y;
    this.el = document.createElement("div");
    this.el.classList.add("critter");
  }
  setDirection(direction) {
    const dirs = new Set(["up", "left", "down", "right"]);
    const dir = direction.replace("Arrow", "").toLowerCase();
    if (dirs.has(dir)) {
      this.direction = dir;
      const cls = "critter-" + dir;
      if (!this.el.classList.contains(cls)) {
        this.el.classList.remove(
          "critter-up",
          "critter-down",
          "critter-left",
          "critter-right"
        );
        this.el.classList.add(cls);
      }
    }
  }
  disableBeastMode() {
    this.el.classList.remove("critter-beast");
    this.el.classList.remove("critter-fade");
  }
  enableBeastMode() {
    setTimeout(() => {
      this.el.classList.add("critter-fade");
      setTimeout(() => {
        this.el.classList.add("critter-beast");
      }, 1500);
    }, 300);
    clearTimeout(this.beastTimer);
    this.beastTimer = setTimeout(() => this.disableBeastMode(), 7500);
  }
  move() {
    const lastX = this.x;
    const lastY = this.y;
    switch (this.direction) {
      case "right":
        this.x++;
        break;
      case "left":
        this.x--;
        break;
      case "up":
        this.y--;
        break;
      case "down":
        this.y++;
        break;
      default:
        return;
    }

    const current = this.gameBoard[this.y]
      ? this.gameBoard[this.y][this.x]
      : "8";

    if (
      this.x < 0 ||
      this.y < 0 ||
      this.x >= this.game.width ||
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

    this.el.style.top = `${y + 3}px`;
    this.el.style.left = `${x + 3}px`;
  }
}

class Game {
  constructor(el) {
    this.el = el;
    this.gameBoard = board
      .trim()
      .split("\n")
      .map((x) => x.split(""));
    this.numCandies = board.replace(/[^1]/g, "").length;
    console.log(this.numCandies, board.replace(/[^1]/g, ""));
    this.critter = new Critter(this.gameBoard);
    this.renderGame(this.critter);
    this.next();
    document.body.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }
  handleKeyPress(e) {
    this.critter.setDirection(e.key);
  }
  next() {
    let pos = this.critter.y * this.gameBoard[0].length + this.critter.x + 1;
    if (this.gameBoard[this.critter.y][this.critter.x] === "1") {
      this.numCandies--;
    }
    this.gameBoard[this.critter.y][this.critter.x] = 0;
    this.el.childNodes[pos].classList.remove("cell-candy", "cell-food");
    this.critter.move();
    if (this.numCandies === 0) {
      alert("Game Over!");
      return;
    }
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
