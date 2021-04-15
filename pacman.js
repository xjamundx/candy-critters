const board = `
111118111111111118111111
281818118888888818181882
111111111111111111111111
881881881881818888818188
011811111111111111111001
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

class Game {
  constructor(el) {
    this.paused = false;
    this.el = el;
    this.gameBoard = board
      .trim()
      .split("\n")
      .map((x) => x.split(""));
    this.numCandies = board.replace(/[^1]/g, "").length;
    const critterX = Math.ceil(this.gameBoard[0].length / 2);
    const critterY = this.gameBoard.length - 1;
    this.critter = new Critter(critterX, critterY, this.gameBoard);
    let ghostX = Math.floor(this.gameBoard[0].length / 2) - 2;
    this.ghosts = Array(4)
      .fill("")
      .map(() => new Ghost(ghostX++, 0, this.gameBoard));
    this.ghosts.forEach((ghost) => ghost.draw());
    this.renderGame();
    this.tick();
    document.body.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }
  handleKeyPress(e) {
    if (this.paused) return;
    this.critter.setDirection(e.key);
  }
  move() {
    if (this.paused) return;
    let pos = this.critter.y * this.gameBoard[0].length + this.critter.x + 1;
    if (this.gameBoard[this.critter.y][this.critter.x] === "1") {
      this.numCandies--;
    }
    this.gameBoard[this.critter.y][this.critter.x] = 0;
    this.el.childNodes[pos].classList.remove("cell-candy", "cell-food");
    if (this.checkCollisions()) {
      return;
    }
    this.critter.move();
    this.ghosts.forEach((ghost) => ghost.move());
  }
  checkCollisions() {
    if (this.critter.beastMode) return;
    const { x, y, width, height } = this.critter.el.getBoundingClientRect();
    const critterX = x + width / 2;
    const critterY = y + height / 2;
    const dead = this.ghosts.some((ghost) => {
      const ghostBounds = ghost.el.getBoundingClientRect();
      return (
        critterX > ghostBounds.x &&
        critterX <= ghostBounds.x + ghostBounds.width &&
        critterY > ghostBounds.y &&
        critterY <= ghostBounds.y + ghostBounds.height
      );
      // return ghost.x === this.critter.x && this.critter.y === ghost.y;
    });
    if (dead) {
      this.paused = true;
      this.critter.die();
      return true;
    }
  }
  tick() {
    this.move();
    if (this.numCandies === 0) {
      this.paused = true;
      alert("Game Over!");
      return;
    }
    setTimeout(() => this.tick(), MOVE_TIME);
  }
  renderGame() {
    const frag = document.createDocumentFragment();
    for (let [i, row] of this.gameBoard.entries()) {
      for (let [j, number] of row.entries()) {
        const div = document.createElement("div");
        div.className = "cell";
        div.classList.add(`cell-${classes[number]}`);
        if (number === "8") {
          if ((row[j + 1] ?? "8") !== number) div.classList.add("border-right");
          if ((row[j - 1] ?? "8") !== number) div.classList.add("border-left");
          if ((this.gameBoard[i - 1]?.[j] ?? "8") !== number)
            div.classList.add("border-top");
          if ((this.gameBoard[i + 1]?.[j] ?? "8") !== number)
            div.classList.add("border-bottom");
        }
        frag.append(div);
      }
    }
    frag.append(this.critter.el);
    this.ghosts.forEach((ghost) => frag.append(ghost.el));
    frag.append(this.critter.el);
    game.append(frag);
  }
}

class MovingThing {
  constructor(x, y, gameBoard) {
    this.el = document.createElement("div");
    this.x = x;
    this.y = y;
    this.lastX = x;
    this.lastY = y;
    this.gameBoard = gameBoard;
  }
  move() {
    this.draw();
  }
  draw() {
    const x = this.x * CELL_SIZE;
    const y = this.y * CELL_SIZE;
    this.el.style.top = `${y + 3}px`;
    this.el.style.left = `${x + 3}px`;
  }
}

class Ghost extends MovingThing {
  constructor(x, y, gameBoard) {
    super(x, y, gameBoard);
    this.directions = new Set(["up", "left", "down", "right"]);
    this.chooseRandomDirection();
    this.el.classList.add("ghost");
  }
  chooseRandomDirection() {
    this.direction = Array.from(this.directions)[
      Math.floor(this.directions.size * Math.random())
    ];
  }
  isValidMove(x, y) {
    if ((this.gameBoard[y]?.[x] ?? "8") === "8") {
      return false;
    }
    return true;
  }
  move() {
    this.lastX = this.x;
    this.lastY = this.y;
    if (this.direction === "up") {
      this.y -= 1;
    } else if (this.direction === "down") {
      this.y += 1;
    } else if (this.direction === "left") {
      this.x -= 1;
    } else if (this.direction === "right") {
      this.x += 1;
    }
    if (this.isValidMove(this.x, this.y)) {
      this.draw();
    } else {
      this.chooseRandomDirection();
      this.x = this.lastX;
      this.y = this.lastY;
    }
  }
}

class Critter extends MovingThing {
  constructor(x, y, gameBoard) {
    super(x, y, gameBoard);
    this.animationTimeout = 300;
    this.alive = true;
    this.beastMode = false;
    this.el.classList.add("critter");
    this.direction = "down";
    this.game = { height: gameBoard.length, width: gameBoard[0].length };
  }
  die() {
    this.alive = false;
    this.el.classList.add("critter-dead");
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
    this.beastMode = false;
  }
  enableBeastMode() {
    this.beastMode = true;
    setTimeout(() => {
      this.el.classList.add("critter-fade");
      setTimeout(() => {
        this.el.classList.add("critter-beast");
      }, 1500);
    }, this.animationTimeout);
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

    this.draw();
  }
}

new Game(game, board);
