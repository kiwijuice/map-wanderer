import { TILE, TILE_W, TILE_H, TILE_HEIGHT } from './tiles.js';

const HW = TILE_W / 2; // 32
const HH = TILE_H / 2; // 16

// ── Draw an isometric diamond (flat ground tile) ──
function drawDiamond(ctx, cx, cy, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(cx, cy - HH);
    ctx.lineTo(cx + HW, cy);
    ctx.lineTo(cx, cy + HH);
    ctx.lineTo(cx - HW, cy);
    ctx.closePath();
    ctx.fill();
}

function drawDiamondStroke(ctx, cx, cy, stroke, lw) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw || 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - HH);
    ctx.lineTo(cx + HW, cy);
    ctx.lineTo(cx, cy + HH);
    ctx.lineTo(cx - HW, cy);
    ctx.closePath();
    ctx.stroke();
}

// ── Draw an isometric box (building block) ──
function drawIsoBox(ctx, cx, cy, h, topColor, leftColor, rightColor) {
    // Top face
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - HH - h);
    ctx.lineTo(cx + HW, cy - h);
    ctx.lineTo(cx, cy + HH - h);
    ctx.lineTo(cx - HW, cy - h);
    ctx.closePath();
    ctx.fill();

    // Left face
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(cx - HW, cy - h);
    ctx.lineTo(cx, cy + HH - h);
    ctx.lineTo(cx, cy + HH);
    ctx.lineTo(cx - HW, cy);
    ctx.closePath();
    ctx.fill();

    // Right face
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(cx + HW, cy - h);
    ctx.lineTo(cx, cy + HH - h);
    ctx.lineTo(cx, cy + HH);
    ctx.lineTo(cx + HW, cy);
    ctx.closePath();
    ctx.fill();
}

// ── Create offscreen canvas for a tile ──
function makeTileCanvas(h, drawFn) {
    const height = h || 0;
    const canvasW = TILE_W;
    const canvasH = TILE_H + height;
    const c = document.createElement('canvas');
    c.width = canvasW;
    c.height = canvasH;
    const ctx = c.getContext('2d');
    // Center X is at canvasW/2, center Y of the ground diamond is at (canvasH - TILE_H/2)
    const cx = canvasW / 2;
    const cy = canvasH - HH;
    drawFn(ctx, cx, cy, height);
    return { canvas: c, offsetY: height };
}

// ── Generate all isometric tile textures ──
export async function generateTileTextures() {
    const textures = {};

    // Grass
    textures[TILE.GRASS] = makeTileCanvas(0, (ctx, cx, cy) => {
        drawDiamond(ctx, cx, cy, '#4a7c3f');
        // grass detail
        ctx.fillStyle = '#5a8c4f';
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 12;
            const gx = cx + Math.cos(angle) * dist;
            const gy = cy + Math.sin(angle) * dist * 0.5;
            ctx.fillRect(gx, gy, 1, 3);
        }
    });

    // Road H
    textures[TILE.ROAD_H] = makeTileCanvas(0, (ctx, cx, cy) => {
        drawDiamond(ctx, cx, cy, '#555');
        // lane marking along horizontal
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx - HW + 6, cy);
        ctx.lineTo(cx + HW - 6, cy);
        ctx.stroke();
        ctx.setLineDash([]);
        drawDiamondStroke(ctx, cx, cy, '#777');
    });

    // Road V
    textures[TILE.ROAD_V] = makeTileCanvas(0, (ctx, cx, cy) => {
        drawDiamond(ctx, cx, cy, '#555');
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy - HH + 3);
        ctx.lineTo(cx, cy + HH - 3);
        ctx.stroke();
        ctx.setLineDash([]);
        drawDiamondStroke(ctx, cx, cy, '#777');
    });

    // Road cross
    textures[TILE.ROAD_CROSS] = makeTileCanvas(0, (ctx, cx, cy) => {
        drawDiamond(ctx, cx, cy, '#555');
        // crosswalk marks
        ctx.fillStyle = '#fff';
        for (let i = -2; i <= 2; i++) {
            ctx.fillRect(cx + i * 5 - 1, cy - HH + 4, 2, 3);
            ctx.fillRect(cx + i * 5 - 1, cy + HH - 7, 2, 3);
        }
        drawDiamondStroke(ctx, cx, cy, '#777');
    });

    // T-intersections (same look as cross for simplicity)
    for (const type of [TILE.ROAD_T_UP, TILE.ROAD_T_DOWN, TILE.ROAD_T_LEFT, TILE.ROAD_T_RIGHT]) {
        textures[type] = makeTileCanvas(0, (ctx, cx, cy) => {
            drawDiamond(ctx, cx, cy, '#555');
            drawDiamondStroke(ctx, cx, cy, '#666');
        });
    }

    // Sidewalk
    textures[TILE.SIDEWALK] = makeTileCanvas(0, (ctx, cx, cy) => {
        drawDiamond(ctx, cx, cy, '#bbb');
        // tile pattern lines
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx - HW / 2, cy - HH / 2);
        ctx.lineTo(cx + HW / 2, cy + HH / 2);
        ctx.moveTo(cx + HW / 2, cy - HH / 2);
        ctx.lineTo(cx - HW / 2, cy + HH / 2);
        ctx.stroke();
        drawDiamondStroke(ctx, cx, cy, '#999');
    });

    // Buildings
    const bh = TILE_HEIGHT[TILE.BUILDING_RED];
    textures[TILE.BUILDING_RED] = makeTileCanvas(bh, (ctx, cx, cy, h) => {
        drawIsoBox(ctx, cx, cy, h, '#c44', '#922', '#b33');
        drawBuildingWindows(ctx, cx, cy, h, '#fda');
    });

    textures[TILE.BUILDING_BLUE] = makeTileCanvas(bh, (ctx, cx, cy, h) => {
        drawIsoBox(ctx, cx, cy, h, '#55a', '#336', '#448');
        drawBuildingWindows(ctx, cx, cy, h, '#adf');
    });

    textures[TILE.BUILDING_GRAY] = makeTileCanvas(bh, (ctx, cx, cy, h) => {
        drawIsoBox(ctx, cx, cy, h, '#999', '#666', '#888');
        drawBuildingWindows(ctx, cx, cy, h, '#ddd');
    });

    textures[TILE.BUILDING_BROWN] = makeTileCanvas(bh, (ctx, cx, cy, h) => {
        drawIsoBox(ctx, cx, cy, h, '#a07820', '#6b4c12', '#8b6914');
        drawBuildingWindows(ctx, cx, cy, h, '#fde');
    });

    // Tall building
    const tbh = TILE_HEIGHT[TILE.BUILDING_TALL];
    textures[TILE.BUILDING_TALL] = makeTileCanvas(tbh, (ctx, cx, cy, h) => {
        drawIsoBox(ctx, cx, cy, h, '#667', '#445', '#556');
        // Windows on left face
        ctx.fillStyle = '#ffa';
        for (let wy = 8; wy < h - 4; wy += 10) {
            for (let wx = 3; wx < HW - 4; wx += 8) {
                const ratio = wx / HW;
                const faceX = cx - HW + wx;
                const faceY = cy - h + wy + ratio * HH;
                if (Math.random() > 0.3) {
                    ctx.fillStyle = Math.random() > 0.5 ? '#ffa' : '#aef';
                    ctx.fillRect(faceX, faceY, 3, 4);
                }
            }
        }
        // Windows on right face
        for (let wy = 8; wy < h - 4; wy += 10) {
            for (let wx = 3; wx < HW - 4; wx += 8) {
                const ratio = wx / HW;
                const faceX = cx + wx;
                const faceY = cy - h + wy + HH - (1 - ratio) * HH;
                if (Math.random() > 0.3) {
                    ctx.fillStyle = Math.random() > 0.5 ? '#ffa' : '#aef';
                    ctx.fillRect(faceX, faceY, 3, 4);
                }
            }
        }
    });

    // Shop
    const sh = TILE_HEIGHT[TILE.BUILDING_SHOP];
    textures[TILE.BUILDING_SHOP] = makeTileCanvas(sh, (ctx, cx, cy, h) => {
        drawIsoBox(ctx, cx, cy, h, '#e8d5b7', '#b09070', '#c8b090');
        // Awning stripe on top face
        ctx.fillStyle = '#c44';
        ctx.beginPath();
        ctx.moveTo(cx, cy - HH - h);
        ctx.lineTo(cx + HW * 0.6, cy - h + HH * 0.4);
        ctx.lineTo(cx, cy + HH * 0.6 - h);
        ctx.lineTo(cx - HW * 0.6, cy - h + HH * 0.4);
        ctx.closePath();
        ctx.fill();
    });

    // Park
    textures[TILE.PARK] = makeTileCanvas(0, (ctx, cx, cy) => {
        drawDiamond(ctx, cx, cy, '#5a9c4f');
        // Flowers
        const colors = ['#f44', '#ff0', '#f9f', '#fff'];
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = colors[i % colors.length];
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 10;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist * 0.5, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Water
    textures[TILE.WATER] = makeTileCanvas(0, (ctx, cx, cy) => {
        drawDiamond(ctx, cx, cy, '#2a6fdb');
        ctx.strokeStyle = '#5a9fff';
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - 14, cy + i * 5);
            ctx.quadraticCurveTo(cx - 5, cy + i * 5 - 3, cx, cy + i * 5);
            ctx.quadraticCurveTo(cx + 5, cy + i * 5 + 3, cx + 14, cy + i * 5);
            ctx.stroke();
        }
    });

    // Fence
    const fh = TILE_HEIGHT[TILE.FENCE];
    textures[TILE.FENCE] = makeTileCanvas(fh, (ctx, cx, cy, h) => {
        drawDiamond(ctx, cx, cy, '#4a7c3f');
        // Fence posts
        ctx.fillStyle = '#8B4513';
        // Left edge posts
        for (let i = 0; i <= 2; i++) {
            const t = i / 2;
            const px = cx - HW + t * HW;
            const py = cy - HH * (1 - t) - t * 0 + (1 - t) * 0;
            const screenY = cy - HH + t * HH;
            ctx.fillRect(px - 1, screenY - h, 3, h);
        }
        // Right edge posts
        for (let i = 0; i <= 2; i++) {
            const t = i / 2;
            const px = cx + t * HW;
            const screenY = cy - t * HH + (1 - t) * HH - HH;
            ctx.fillRect(px - 1, cy - HH + t * HH - h, 3, h);
        }
        // Rails
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - HW, cy - h / 2);
        ctx.lineTo(cx, cy - HH - h / 2);
        ctx.lineTo(cx + HW, cy - h / 2);
        ctx.stroke();
    });

    // Tree
    const trh = TILE_HEIGHT[TILE.TREE];
    textures[TILE.TREE] = makeTileCanvas(trh, (ctx, cx, cy, h) => {
        drawDiamond(ctx, cx, cy, '#4a7c3f');
        // Trunk
        ctx.fillStyle = '#6B3A1F';
        ctx.fillRect(cx - 2, cy - h + 8, 5, h - 6);
        // Canopy
        ctx.fillStyle = '#2d6b1e';
        ctx.beginPath();
        ctx.ellipse(cx, cy - h + 4, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a8a2a';
        ctx.beginPath();
        ctx.ellipse(cx - 4, cy - h, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 5, cy - h + 3, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    // Plaza
    textures[TILE.PLAZA] = makeTileCanvas(0, (ctx, cx, cy) => {
        drawDiamond(ctx, cx, cy, '#c8b090');
        // Pattern lines
        ctx.strokeStyle = '#a89070';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - HH / 2);
        ctx.lineTo(cx + HW / 2, cy);
        ctx.lineTo(cx, cy + HH / 2);
        ctx.lineTo(cx - HW / 2, cy);
        ctx.closePath();
        ctx.stroke();
        drawDiamondStroke(ctx, cx, cy, '#a89070');
    });

    // Landmark (beautiful isometric building with dome)
    const lmH = TILE_HEIGHT[TILE.LANDMARK];
    textures[TILE.LANDMARK] = makeLandmarkTile(lmH);

    // Modern office building (SVG-based)
    const officeH = TILE_HEIGHT[TILE.BUILDING_OFFICE];
    textures[TILE.BUILDING_OFFICE] = await makeOfficeTile(officeH);

    // File-based SVG building (loaded from public/assets/buildings/)
    textures[TILE.BUILDING_MODERN] = await loadSvgTile(
        '/assets/buildings/modern-tower.svg',
        156, // offsetY (canvasH - footprint rows * TILE_H)
        0,   // extraW (canvas is exactly footprint width)
        { cols: 2, rows: 2 }
    );

    // Skyscraper (2×2, 128×260 canvas)
    textures[TILE.BUILDING_SKYSCRAPER] = await loadSvgTile(
        '/assets/buildings/skyscraper.svg',
        196, 0, { cols: 2, rows: 2 }
    );

    // Houses (1×1, 64×90 canvases)
    textures[TILE.BUILDING_HOUSE_A] = await loadSvgTile(
        '/assets/buildings/house-a.svg', 58, 0
    );
    textures[TILE.BUILDING_HOUSE_B] = await loadSvgTile(
        '/assets/buildings/house-b.svg', 58, 0
    );
    textures[TILE.BUILDING_HOUSE_C] = await loadSvgTile(
        '/assets/buildings/house-c.svg', 58, 0
    );

    // City Hall (2×2, 128×200 canvas)
    textures[TILE.BUILDING_CITYHALL] = await loadSvgTile(
        '/assets/buildings/city-hall.svg',
        136, 0, { cols: 2, rows: 2 }
    );

    return textures;
}

// ── Create landmark building (canvas-drawn with gradients) ──
function makeLandmarkTile(h) {
    const canvasW = TILE_W + 40;
    const canvasH = TILE_H + h + 40;
    const c = document.createElement('canvas');
    c.width = canvasW;
    c.height = canvasH;
    const ctx = c.getContext('2d');
    const cx = canvasW / 2;
    const cy = canvasH - HH;

    // Left face with gradient
    const grdL = ctx.createLinearGradient(cx - HW, cy, cx, cy + HH);
    grdL.addColorStop(0, '#d4c5a0');
    grdL.addColorStop(1, '#b8a880');
    ctx.fillStyle = grdL;
    ctx.beginPath();
    ctx.moveTo(cx - HW, cy);
    ctx.lineTo(cx, cy + HH);
    ctx.lineTo(cx, cy + HH - h);
    ctx.lineTo(cx - HW, cy - h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#998870';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Right face with gradient
    const grdR = ctx.createLinearGradient(cx + HW, cy, cx, cy + HH);
    grdR.addColorStop(0, '#c8b890');
    grdR.addColorStop(1, '#a89870');
    ctx.fillStyle = grdR;
    ctx.beginPath();
    ctx.moveTo(cx + HW, cy);
    ctx.lineTo(cx, cy + HH);
    ctx.lineTo(cx, cy + HH - h);
    ctx.lineTo(cx + HW, cy - h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top face
    ctx.fillStyle = '#5a9977';
    ctx.beginPath();
    ctx.moveTo(cx, cy - HH - h);
    ctx.lineTo(cx + HW, cy - h);
    ctx.lineTo(cx, cy + HH - h);
    ctx.lineTo(cx - HW, cy - h);
    ctx.closePath();
    ctx.fill();

    // Pillars on left face
    ctx.fillStyle = '#e8dcc0';
    for (const i of [1, 3]) {
        const t = i / 4;
        const px = cx - HW + t * HW;
        const py = cy + HH * (t - 1);
        ctx.fillRect(px - 1.5, py - h + 4, 3, h - 8);
        ctx.strokeStyle = '#c0b090';
        ctx.lineWidth = 0.3;
        ctx.strokeRect(px - 1.5, py - h + 4, 3, h - 8);
    }
    // Pillars on right face
    ctx.fillStyle = '#d8ccb0';
    for (const i of [1, 3]) {
        const t = i / 4;
        const px = cx + t * HW;
        const py = cy + HH * t;
        ctx.fillRect(px - 1.5, py - h + 4, 3, h - 8);
        ctx.strokeStyle = '#b0a080';
        ctx.lineWidth = 0.3;
        ctx.strokeRect(px - 1.5, py - h + 4, 3, h - 8);
    }

    // Windows on both faces
    ctx.fillStyle = '#ffeebb';
    ctx.strokeStyle = '#aa9060';
    ctx.lineWidth = 0.5;
    for (let row = 0; row < 3; row++) {
        const wy = 10 + row * 22;
        if (wy >= h - 12) break;
        for (let i = 0; i < 3; i++) {
            const t = (i + 1) / 4;
            // Left face windows
            let wx = cx - HW + t * HW;
            let baseY = cy + HH * (t - 1);
            ctx.beginPath();
            ctx.moveTo(wx - 3, baseY - h + wy);
            ctx.lineTo(wx + 3, baseY - h + wy);
            ctx.lineTo(wx + 3, baseY - h + wy + 8);
            ctx.lineTo(wx, baseY - h + wy + 10);
            ctx.lineTo(wx - 3, baseY - h + wy + 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Right face windows
            wx = cx + t * HW;
            baseY = cy + HH * t;
            ctx.beginPath();
            ctx.moveTo(wx - 3, baseY - h + wy);
            ctx.lineTo(wx + 3, baseY - h + wy);
            ctx.lineTo(wx + 3, baseY - h + wy + 8);
            ctx.lineTo(wx, baseY - h + wy + 10);
            ctx.lineTo(wx - 3, baseY - h + wy + 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    // Cornice line
    ctx.strokeStyle = '#c0b090';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - HW, cy - h + 2);
    ctx.lineTo(cx, cy - HH - h + 2);
    ctx.lineTo(cx + HW, cy - h + 2);
    ctx.stroke();

    // Door (arched)
    ctx.fillStyle = '#654';
    ctx.beginPath();
    ctx.arc(cx - HW / 2, cy - 11, 4, Math.PI, 0);
    ctx.lineTo(cx - HW / 2 + 4, cy - 4);
    ctx.lineTo(cx - HW / 2 - 4, cy - 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#432';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Dome base
    const domeY = cy - h - HH;
    ctx.fillStyle = '#5a9977';
    ctx.beginPath();
    ctx.ellipse(cx, domeY + 4, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dome with radial gradient
    const grdDome = ctx.createRadialGradient(cx - 3, domeY - 6, 2, cx, domeY, 14);
    grdDome.addColorStop(0, '#7cc');
    grdDome.addColorStop(0.5, '#5aa');
    grdDome.addColorStop(1, '#488');
    ctx.fillStyle = grdDome;
    ctx.beginPath();
    ctx.ellipse(cx, domeY - 4, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a9';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Dome highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.ellipse(cx - 3, domeY - 8, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spire
    const grdSpire = ctx.createLinearGradient(cx, domeY - 18, cx, domeY - 32);
    grdSpire.addColorStop(0, '#c90');
    grdSpire.addColorStop(1, '#fd2');
    ctx.strokeStyle = grdSpire;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, domeY - 18);
    ctx.lineTo(cx, domeY - 30);
    ctx.stroke();

    // Spire ornament
    ctx.fillStyle = '#fd2';
    ctx.beginPath();
    ctx.arc(cx, domeY - 31, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c90';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    return { canvas: c, offsetY: h + 40, extraW: 40 };
}

// ── Modern office building rendered from inline SVG ──
function makeOfficeTile(h) {
    const extraW = 30;
    const canvasW = TILE_W + extraW;
    const canvasH = TILE_H + h + 30;
    const cx = canvasW / 2;
    const cy = canvasH - HH;

    // Build the SVG string for a modern glass office tower
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}">
  <defs>
    <!-- Left face glass gradient -->
    <linearGradient id="glL" x1="0" y1="0" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#8ec8e8"/>
      <stop offset="40%" stop-color="#a8ddf5"/>
      <stop offset="100%" stop-color="#6bafc8"/>
    </linearGradient>
    <!-- Right face glass gradient -->
    <linearGradient id="glR" x1="1" y1="0" x2="0" y2="0.5">
      <stop offset="0%" stop-color="#5a9ab5"/>
      <stop offset="50%" stop-color="#7bbbd5"/>
      <stop offset="100%" stop-color="#4a8aa0"/>
    </linearGradient>
    <!-- Top face -->
    <linearGradient id="topG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c8e8f5"/>
      <stop offset="100%" stop-color="#a0d0e5"/>
    </linearGradient>
    <!-- Window reflection -->
    <linearGradient id="winRef" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(200,240,255,0.8)"/>
      <stop offset="50%" stop-color="rgba(100,180,220,0.4)"/>
      <stop offset="100%" stop-color="rgba(60,140,200,0.6)"/>
    </linearGradient>
    <!-- Sky reflection for glass -->
    <linearGradient id="skyRef" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(200,230,255,0.3)"/>
      <stop offset="100%" stop-color="rgba(100,160,200,0.1)"/>
    </linearGradient>
    <!-- Steel frame color -->
    <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#607080"/>
      <stop offset="100%" stop-color="#4a5a68"/>
    </linearGradient>
  </defs>

  <!-- LEFT FACE (glass wall) -->
  <polygon points="${cx - HW},${cy} ${cx},${cy + HH} ${cx},${cy + HH - h} ${cx - HW},${cy - h}"
           fill="url(#glL)" stroke="#5090a8" stroke-width="0.8"/>
  <!-- Left face steel frame horizontals -->
  ${Array.from({ length: Math.floor(h / 12) }, (_, i) => {
        const fy = cy - h + 8 + i * 12;
        const t1 = (fy - (cy - h)) / h;
        return `<line x1="${cx - HW}" y1="${fy - HH * (1 - t1)}" x2="${cx}" y2="${fy + HH - HH * (1 - t1)}" stroke="#50707e" stroke-width="0.7"/>`;
    }).join('\n  ')}
  <!-- Left face steel frame verticals -->
  ${[0.25, 0.5, 0.75].map(t => {
        const vx = cx - HW + t * HW;
        const topY = cy - h + t * HH;
        const botY = cy - HH + t * HH;
        return `<line x1="${vx}" y1="${topY}" x2="${vx}" y2="${botY}" stroke="#50707e" stroke-width="0.6"/>`;
    }).join('\n  ')}
  <!-- Left face glass panels with reflections -->
  ${Array.from({ length: Math.floor(h / 12) - 1 }, (_, i) => {
        const fy = cy - h + 8 + i * 12;
        return [0.125, 0.375, 0.625].map(t => {
            const px = cx - HW + t * HW;
            const py = fy + t * HH - HH * (1 - (fy - (cy - h)) / h) + 6;
            return `<rect x="${px - 1}" y="${py}" width="5" height="8" rx="0.5"
              fill="url(#winRef)" opacity="${0.4 + Math.random() * 0.4}"/>`;
        }).join('\n  ');
    }).join('\n  ')}

  <!-- RIGHT FACE (glass wall) -->
  <polygon points="${cx + HW},${cy} ${cx},${cy + HH} ${cx},${cy + HH - h} ${cx + HW},${cy - h}"
           fill="url(#glR)" stroke="#40708a" stroke-width="0.8"/>
  <!-- Right face steel frame horizontals -->
  ${Array.from({ length: Math.floor(h / 12) }, (_, i) => {
        const fy = cy - h + 8 + i * 12;
        const t1 = (fy - (cy - h)) / h;
        return `<line x1="${cx}" y1="${fy + HH - HH * t1}" x2="${cx + HW}" y2="${fy - HH * (1 - t1) + HH}" stroke="#406878" stroke-width="0.7"/>`;
    }).join('\n  ')}
  <!-- Right face steel frame verticals -->
  ${[0.25, 0.5, 0.75].map(t => {
        const vx = cx + t * HW;
        const topY = cy - h + HH - t * HH + HH;
        const botY = cy + HH - t * HH;
        return `<line x1="${vx}" y1="${topY}" x2="${vx}" y2="${botY}" stroke="#406878" stroke-width="0.6"/>`;
    }).join('\n  ')}
  <!-- Right face glass panels with reflections -->
  ${Array.from({ length: Math.floor(h / 12) - 1 }, (_, i) => {
        const fy = cy - h + 8 + i * 12;
        return [0.125, 0.375, 0.625].map(t => {
            const px = cx + t * HW;
            const py = fy + HH - t * HH + 6 - HH * ((fy - (cy - h)) / h) + HH;
            return `<rect x="${px + 1}" y="${py}" width="5" height="8" rx="0.5"
              fill="url(#winRef)" opacity="${0.3 + Math.random() * 0.3}"/>`;
        }).join('\n  ');
    }).join('\n  ')}

  <!-- TOP FACE (roof/helipad) -->
  <polygon points="${cx},${cy - HH - h} ${cx + HW},${cy - h} ${cx},${cy + HH - h} ${cx - HW},${cy - h}"
           fill="url(#topG)" stroke="#80a8b8" stroke-width="0.5"/>
  <!-- Rooftop structures -->
  <!-- AC units -->
  <rect x="${cx - 8}" y="${cy - h - HH + 2}" width="6" height="4" rx="0.5" fill="#708090" stroke="#5a6a78" stroke-width="0.3"/>
  <rect x="${cx + 3}" y="${cy - h - HH + 4}" width="5" height="3" rx="0.5" fill="#687888" stroke="#5a6878" stroke-width="0.3"/>
  <!-- Helipad circle -->
  <ellipse cx="${cx}" cy="${cy - h}" rx="8" ry="4" fill="none" stroke="#f0f0f0" stroke-width="0.8" stroke-dasharray="2,2"/>
  <!-- H marking -->
  <text x="${cx}" y="${cy - h + 1.5}" text-anchor="middle" font-size="5" fill="#e0e0e0" font-family="sans-serif" font-weight="bold">H</text>

  <!-- Glass reflection highlights -->
  <polygon points="${cx - HW + 2},${cy - h + 4} ${cx - 2},${cy - h + HH + 4} ${cx - 2},${cy - h + HH + 12} ${cx - HW + 2},${cy - h + 12}"
           fill="rgba(255,255,255,0.08)"/>
  <polygon points="${cx + HW - 2},${cy - h + 4} ${cx + 2},${cy - h + HH + 4} ${cx + 2},${cy - h + HH + 20} ${cx + HW - 2},${cy - h + 20}"
           fill="rgba(255,255,255,0.06)"/>

  <!-- Entrance (dark glass door on left face bottom) -->
  <polygon points="${cx - HW / 2 - 3},${cy - 4} ${cx - HW / 2 + 3},${cy - 4} ${cx - HW / 2 + 3},${cy - 14} ${cx - HW / 2},${cy - 16} ${cx - HW / 2 - 3},${cy - 14}"
           fill="#2a4050" stroke="#3a5060" stroke-width="0.5"/>

  <!-- Roof edge highlight -->
  <line x1="${cx - HW}" y1="${cy - h}" x2="${cx}" y2="${cy - HH - h}" stroke="#b8dce8" stroke-width="1.2"/>
  <line x1="${cx}" y1="${cy - HH - h}" x2="${cx + HW}" y2="${cy - h}" stroke="#a0c8d8" stroke-width="1.2"/>
</svg>`;

    return new Promise((resolve) => {
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = canvasW;
            c.height = canvasH;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve({ canvas: c, offsetY: h + 30, extraW });
        };
        img.src = url;
    });
}

// ── Load an SVG tile from a file URL (public/assets/buildings/) ──
function loadSvgTile(url, offsetY, extraW = 0, footprint = null) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const result = { canvas: c, offsetY, extraW };
            if (footprint) result.footprint = footprint;
            resolve(result);
        };
        img.onerror = () => reject(new Error(`Failed to load SVG: ${url}`));
        img.src = url;
    });
}

// ── Draw windows on building faces ──
function drawBuildingWindows(ctx, cx, cy, h, winColor) {
    ctx.fillStyle = winColor;
    // Windows on left face
    for (let wy = 6; wy < h - 8; wy += 12) {
        for (let i = 0; i < 3; i++) {
            const t = (i + 1) / 4;
            const wx = cx - HW + t * HW;
            const baseY = cy + HH * (t - 1);
            ctx.fillRect(wx - 2, baseY - h + wy, 4, 5);
        }
    }
    // Windows on right face
    for (let wy = 6; wy < h - 8; wy += 12) {
        for (let i = 0; i < 3; i++) {
            const t = (i + 1) / 4;
            const wx = cx + t * HW;
            const baseY = cy + HH * t;
            ctx.fillRect(wx - 2, baseY - h + wy, 4, 5);
        }
    }
}

// ── Generate player sprite sheet from external SVG ──
export function generatePlayerSprites(type = 'man') {
    const url = `/assets/characters/${type}.svg`;
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = 128;
            c.height = 192;
            c.getContext('2d').drawImage(img, 0, 0);
            resolve({ canvas: c, frameW: 32, frameH: 48, frames: 4, directions: 4 });
        };
        img.onerror = () => reject(new Error(`Failed to load sprite: ${url}`));
        img.src = url;
    });
}
