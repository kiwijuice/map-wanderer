import { TILE_SIZE } from './tiles.js';
import { generateTileTextures, generatePlayerSprites } from './assets.js';
import { generateMap, PLAYER_START, MAP_COLS, MAP_ROWS } from './map.js';
import { Player } from './player.js';
import { Camera } from './camera.js';

// ── Canvas setup ──
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ── Generate assets ──
const tileTextures = generateTileTextures();
const playerSprites = generatePlayerSprites();
const map = generateMap();

// ── Game objects ──
const player = new Player(PLAYER_START.col, PLAYER_START.row, playerSprites);
const camera = new Camera(canvas.width, canvas.height);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.resize(canvas.width, canvas.height);
}
window.addEventListener('resize', resize);

// ── Input ──
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code.startsWith('Arrow')) e.preventDefault();
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// ── Mini-map ──
const miniMapCanvas = document.createElement('canvas');
const miniScale = 2;
miniMapCanvas.width = MAP_COLS * miniScale;
miniMapCanvas.height = MAP_ROWS * miniScale;
const miniCtx = miniMapCanvas.getContext('2d');

function buildMiniMap() {
  const tileColors = {
    0: '#4a7c3f',  // grass
    1: '#555', 2: '#555', 3: '#555', // roads
    4: '#bbb',  // sidewalk
    5: '#b33', 6: '#448', 7: '#888', 8: '#8b6914', // buildings
    9: '#5a9c4f', // park
    10: '#2a6fdb', // water
    11: '#555', 12: '#555', 13: '#555', 14: '#555', // T-intersections
    15: '#8B4513', // fence
    16: '#2d6b1e', // tree
    17: '#556', // tall building
    18: '#c8b090', // plaza
    19: '#e8d5b7', // shop
  };

  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      miniCtx.fillStyle = tileColors[map[r][c]] || '#000';
      miniCtx.fillRect(c * miniScale, r * miniScale, miniScale, miniScale);
    }
  }
}
buildMiniMap();

// ── HUD ──
function drawHUD() {
  const mmX = canvas.width - miniMapCanvas.width - 12;
  const mmY = 12;

  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#000';
  ctx.fillRect(mmX - 2, mmY - 2, miniMapCanvas.width + 4, miniMapCanvas.height + 4);
  ctx.globalAlpha = 1;
  ctx.drawImage(miniMapCanvas, mmX, mmY);

  // Player dot on mini-map
  const dotX = mmX + (player.x / TILE_SIZE) * miniScale;
  const dotY = mmY + (player.y / TILE_SIZE) * miniScale;
  ctx.fillStyle = '#f00';
  ctx.beginPath();
  ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Camera view rectangle
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    mmX + (camera.x / TILE_SIZE) * miniScale,
    mmY + (camera.y / TILE_SIZE) * miniScale,
    (canvas.width / TILE_SIZE) * miniScale,
    (canvas.height / TILE_SIZE) * miniScale
  );

  // Controls hint
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#000';
  ctx.fillRect(10, canvas.height - 38, 270, 28);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.fillText('Arrow keys / WASD to move', 18, canvas.height - 18);

  // Coordinates
  const tileCol = Math.floor(player.x / TILE_SIZE);
  const tileRow = Math.floor(player.y / TILE_SIZE);
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#000';
  ctx.fillRect(10, 10, 140, 24);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.font = '13px monospace';
  ctx.fillText(`Tile: ${tileCol}, ${tileRow}`, 18, 27);
}

// ── Game loop ──
let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  player.update(dt, keys, map);
  camera.follow(player.x, player.y);

  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render visible tiles only
  const { startCol, startRow, endCol, endRow } = camera.getVisibleRange();
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tileId = map[r][c];
      const texture = tileTextures[tileId];
      if (texture) {
        ctx.drawImage(texture, c * TILE_SIZE - camera.x, r * TILE_SIZE - camera.y);
      }
    }
  }

  player.draw(ctx, camera.x, camera.y);
  drawHUD();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
