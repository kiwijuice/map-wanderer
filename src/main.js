import { TILE_SIZE, TILE_W, TILE_H, TILE_HEIGHT, toScreen } from './tiles.js';
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
    0: '#4a7c3f',
    1: '#555', 2: '#555', 3: '#555',
    4: '#bbb',
    5: '#b33', 6: '#448', 7: '#888', 8: '#8b6914',
    9: '#5a9c4f',
    10: '#2a6fdb',
    11: '#555', 12: '#555', 13: '#555', 14: '#555',
    15: '#8B4513',
    16: '#2d6b1e',
    17: '#556',
    18: '#c8b090',
    19: '#e8d5b7',
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

// ── Determine visible tile range efficiently ──
function getVisibleTileRange() {
  // Convert screen corners to map space to find visible tiles
  const pad = 3;
  const corners = [
    { sx: camera.x, sy: camera.y },
    { sx: camera.x + camera.viewW, sy: camera.y },
    { sx: camera.x, sy: camera.y + camera.viewH },
    { sx: camera.x + camera.viewW, sy: camera.y + camera.viewH },
  ];

  let minCol = MAP_COLS, maxCol = 0, minRow = MAP_ROWS, maxRow = 0;
  for (const { sx, sy } of corners) {
    // Reverse isometric: from screen to map col/row
    const col = (sx / (TILE_W / 2) + sy / (TILE_H / 2)) / 2;
    const row = (sy / (TILE_H / 2) - sx / (TILE_W / 2)) / 2;
    minCol = Math.min(minCol, col);
    maxCol = Math.max(maxCol, col);
    minRow = Math.min(minRow, row);
    maxRow = Math.max(maxRow, row);
  }

  return {
    startCol: Math.max(0, Math.floor(minCol) - pad),
    endCol: Math.min(MAP_COLS - 1, Math.ceil(maxCol) + pad),
    startRow: Math.max(0, Math.floor(minRow) - pad),
    endRow: Math.min(MAP_ROWS - 1, Math.ceil(maxRow) + pad),
  };
}

// ── Game loop ──
let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  player.update(dt, keys, map);

  // Camera follows player's screen position
  const playerScreen = player.getScreenPos();
  camera.follow(playerScreen.x, playerScreen.y);

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Get visible range
  const { startCol, endCol, startRow, endRow } = getVisibleTileRange();

  // Player map position for depth sorting
  const playerDepth = Math.floor(player.getMapRow()) + Math.floor(player.getMapCol());
  let playerDrawn = false;

  // Render tiles in isometric depth order (back to front)
  // Depth = row + col; tiles with smaller sum are further from viewer
  const minDepth = startRow + startCol;
  const maxDepth = endRow + endCol;

  for (let depth = minDepth; depth <= maxDepth; depth++) {
    // Draw player at the correct depth layer
    if (!playerDrawn && depth > playerDepth) {
      player.draw(ctx, camera.x, camera.y);
      playerDrawn = true;
    }

    // All tiles where row + col = depth
    const colMin = Math.max(startCol, depth - endRow);
    const colMax = Math.min(endCol, depth - startRow);

    for (let col = colMin; col <= colMax; col++) {
      const row = depth - col;
      if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) continue;

      const tileId = map[row][col];
      const tex = tileTextures[tileId];
      if (!tex) continue;

      const screen = toScreen(col, row);
      const height = tex.offsetY || 0;

      const drawX = screen.x - camera.x - TILE_W / 2;
      const drawY = screen.y - camera.y - TILE_H / 2 - height;

      ctx.drawImage(tex.canvas, drawX, drawY);
    }
  }

  // Draw player if not drawn yet (in front of everything)
  if (!playerDrawn) {
    player.draw(ctx, camera.x, camera.y);
  }

  drawHUD();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
