const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

let board = createMatrix(COLS, ROWS);
let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;
let score = 0;
let playerName = "";

const colors = [
  null,
  "#00f0f0", // I
  "#f0f000", // O
  "#a000f0", // T
  "#00f000", // S
  "#f00000", // Z
  "#0000f0", // J
  "#f0a000", // L
];

const tetrominoes = {
  I: [[1, 1, 1, 1]],
  J: [
    [0, 2],
    [0, 2],
    [2, 2],
  ],
  L: [
    [3, 0],
    [3, 0],
    [3, 3],
  ],
  O: [
    [4, 4],
    [4, 4],
  ],
  S: [
    [0, 5, 5],
    [5, 5, 0],
  ],
  T: [
    [0, 6, 0],
    [6, 6, 6],
  ],
  Z: [
    [7, 7, 0],
    [0, 7, 7],
  ],
};

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(board, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        board[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(board, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (
        m[y][x] &&
        (board[y + o.y] && board[y + o.y][x + o.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function playerReset() {
  const pieces = "TJLOSZI";
  const piece = pieces[(Math.random() * pieces.length) | 0];
  player.matrix = tetrominoes[piece];
  player.pos.y = 0;
  player.pos.x = ((COLS / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(board, player)) {
    alert(`Game Over, ${playerName}! Score: ${score}`);
    board = createMatrix(COLS, ROWS);
    score = 0;
    updateScore();
  }
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(board, player)) {
    player.pos.x -= dir;
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(board, player)) {
    player.pos.y--;
    merge(board, player);
    playerReset();
    clearLines();
  }
  dropCounter = 0;
}

function playerRotate() {
  const pos = player.pos.x;
  let offset = 1;
  player.matrix = rotate(player.matrix);
  while (collide(board, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      player.matrix = rotate(player.matrix);
      player.matrix = rotate(player.matrix);
      player.matrix = rotate(player.matrix);
      player.pos.x = pos;
      return;
    }
  }
}

function clearLines() {
  let rowCount = 1;
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (!board[y][x]) continue outer;
    }
    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    score += rowCount * 10;
    rowCount *= 2;
    updateScore();
  }
}

function updateScore() {
  scoreElement.textContent = `Score : ${score}`;
}

function draw() {
  context.fillStyle = "#111";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(board, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
};

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") playerMove(-1);
  else if (event.key === "ArrowRight") playerMove(1);
  else if (event.key === "ArrowDown") playerDrop();
  else if (event.key === "ArrowUp") playerRotate();
});

function startGame() {
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) {
    alert("Entre ton nom !");
    return;
  }

  document.getElementById("menu").style.display = "none";
  document.getElementById("gameContainer").style.display = "flex";

  playerReset();
  updateScore();
  update();
}
