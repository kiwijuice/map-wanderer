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
let tileTextures;
const map = generateMap();

// ── Character selection ──
let gameStarted = false;
let player, camera;
const previewMan = generatePlayerSprites('man');
const previewWoman = generatePlayerSprites('woman');

function drawCharacterSelect() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('City Walker', canvas.width / 2, canvas.height / 2 - 140);

  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Choose your character', canvas.width / 2, canvas.height / 2 - 100);

  // Draw two character preview boxes
  const boxW = 140;
  const boxH = 180;
  const gap = 60;
  const leftX = canvas.width / 2 - boxW - gap / 2;
  const rightX = canvas.width / 2 + gap / 2;
  const boxY = canvas.height / 2 - 60;

  // Man box
  drawCharBox(leftX, boxY, boxW, boxH, previewMan, 'Man', manHovered);
  // Woman box
  drawCharBox(rightX, boxY, boxW, boxH, previewWoman, 'Woman', womanHovered);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText('Click to select', canvas.width / 2, boxY + boxH + 40);
}

let manHovered = false;
let womanHovered = false;

function drawCharBox(x, y, w, h, sprites, label, hovered) {
  // Box background
  ctx.fillStyle = hovered ? '#2a2a4e' : '#222240';
  ctx.strokeStyle = hovered ? '#6af' : '#444';
  ctx.lineWidth = hovered ? 2 : 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();

  // Draw the front-facing idle frame (dir=0, frame=0)
  const scale = 3;
  const fw = sprites.frameW;
  const fh = sprites.frameH;
  const drawW = fw * scale;
  const drawH = fh * scale;
  const sx = 0;
  const sy = 0;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprites.canvas, sx, sy, fw, fh,
    x + w / 2 - drawW / 2, y + 20, drawW, drawH);
  ctx.imageSmoothingEnabled = true;

  // Label
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h - 16);
}

function handleSelectClick(e) {
  if (gameStarted) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const boxW = 140;
  const boxH = 180;
  const gap = 60;
  const leftX = canvas.width / 2 - boxW - gap / 2;
  const rightX = canvas.width / 2 + gap / 2;
  const boxY = canvas.height / 2 - 60;

  if (mx >= leftX && mx <= leftX + boxW && my >= boxY && my <= boxY + boxH) {
    startGame('man');
  } else if (mx >= rightX && mx <= rightX + boxW && my >= boxY && my <= boxY + boxH) {
    startGame('woman');
  }
}

function handleSelectMove(e) {
  if (gameStarted) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const boxW = 140;
  const boxH = 180;
  const gap = 60;
  const leftX = canvas.width / 2 - boxW - gap / 2;
  const rightX = canvas.width / 2 + gap / 2;
  const boxY = canvas.height / 2 - 60;

  manHovered = mx >= leftX && mx <= leftX + boxW && my >= boxY && my <= boxY + boxH;
  womanHovered = mx >= rightX && mx <= rightX + boxW && my >= boxY && my <= boxY + boxH;
  canvas.style.cursor = (manHovered || womanHovered) ? 'pointer' : 'default';
}

canvas.addEventListener('click', handleSelectClick);
canvas.addEventListener('mousemove', handleSelectMove);

function startGame(charType) {
  gameStarted = true;
  canvas.style.cursor = 'none';
  canvas.removeEventListener('click', handleSelectClick);
  canvas.removeEventListener('mousemove', handleSelectMove);

  const playerSprites = generatePlayerSprites(charType);
  player = new Player(PLAYER_START.col, PLAYER_START.row, playerSprites);
  camera = new Camera(canvas.width, canvas.height);
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (camera) camera.resize(canvas.width, canvas.height);
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
    20: '#5aa',
    21: '#4ab8d0',
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

  // Two-pass rendering: flat ground tiles first, then elevated tiles + player depth-sorted.
  // This prevents flat ground diamonds from overlapping the player's legs.
  const minDepth = startRow + startCol;
  const maxDepth = endRow + endCol;

  // Pass 1: Draw all flat ground tiles (no height)
  for (let depth = minDepth; depth <= maxDepth; depth++) {
    const colMin = Math.max(startCol, depth - endRow);
    const colMax = Math.min(endCol, depth - startRow);
    for (let col = colMin; col <= colMax; col++) {
      const row = depth - col;
      if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) continue;
      const tileId = map[row][col];
      const tex = tileTextures[tileId];
      if (!tex || tex.offsetY) continue; // skip tiles with height

      const screen = toScreen(col, row);
      ctx.drawImage(tex.canvas, screen.x - camera.x - TILE_W / 2, screen.y - camera.y - TILE_H / 2);
    }
  }

  // Pass 2: Draw elevated tiles + player in depth order
  const playerDepth = player.getMapRow() + player.getMapCol();
  let playerDrawn = false;

  for (let depth = minDepth; depth <= maxDepth; depth++) {
    if (!playerDrawn && depth > playerDepth) {
      player.draw(ctx, camera.x, camera.y);
      playerDrawn = true;
    }

    const colMin = Math.max(startCol, depth - endRow);
    const colMax = Math.min(endCol, depth - startRow);
    for (let col = colMin; col <= colMax; col++) {
      const row = depth - col;
      if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) continue;
      const tileId = map[row][col];
      const tex = tileTextures[tileId];
      if (!tex || !tex.offsetY) continue; // only tiles with height

      const screen = toScreen(col, row);
      const extraW = tex.extraW || 0;
      const drawX = screen.x - camera.x - (TILE_W + extraW) / 2;
      const drawY = screen.y - camera.y - TILE_H / 2 - tex.offsetY;
      ctx.drawImage(tex.canvas, drawX, drawY);
    }
  }

  if (!playerDrawn) {
    player.draw(ctx, camera.x, camera.y);
  }

  drawHUD();

  requestAnimationFrame(gameLoop);
}

// ── Character selection loop ──
function selectionLoop() {
  if (gameStarted) return;
  drawCharacterSelect();
  requestAnimationFrame(selectionLoop);
}

// ── Boot: load async assets, then start ──
generateTileTextures().then((tex) => {
  tileTextures = tex;
  requestAnimationFrame(selectionLoop);
});
