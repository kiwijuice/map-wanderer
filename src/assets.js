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
export function generateTileTextures() {
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

// ── Generate player sprite sheet (4 directions x 4 frames) ──
export function generatePlayerSprites(type = 'man') {
    const frameW = 32;
    const frameH = 48;
    const directions = 4;
    const frames = 4;

    const c = document.createElement('canvas');
    c.width = frameW * frames;
    c.height = frameH * directions;
    const ctx = c.getContext('2d');

    const drawFn = type === 'woman' ? drawWomanFrame : drawPlayerFrame;

    for (let dir = 0; dir < directions; dir++) {
        for (let frame = 0; frame < frames; frame++) {
            const ox = frame * frameW;
            const oy = dir * frameH;
            drawFn(ctx, ox, oy, frameW, frameH, dir, frame);
        }
    }

    return { canvas: c, frameW, frameH, frames, directions };
}

function drawPlayerFrame(ctx, ox, oy, w, h, dir, frame) {
    const cx = ox + w / 2;

    // Walk cycle offsets
    const legOffset = [0, 3, 0, -3][frame];
    const bobY = [0, -1, 0, -1][frame];

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, oy + h - 4, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#3465a4';
    ctx.fillRect(cx - 7, oy + 20 + bobY, 14, 12);

    // Arms
    ctx.fillStyle = '#3465a4';
    if (dir === 0 || dir === 1) { // facing down
        ctx.fillRect(cx - 10, oy + 21 + bobY, 4, 10);
        ctx.fillRect(cx + 6, oy + 21 + bobY, 4, 10);
    } else if (dir === 2) { // up-left
        ctx.fillRect(cx - 4, oy + 21 + bobY, 4, 10);
    } else { // up-right
        ctx.fillRect(cx, oy + 21 + bobY, 4, 10);
    }

    // Hands
    ctx.fillStyle = '#f4c68a';
    if (dir === 0 || dir === 1) {
        ctx.fillRect(cx - 9, oy + 30 + bobY, 3, 3);
        ctx.fillRect(cx + 6, oy + 30 + bobY, 3, 3);
    } else if (dir === 2) {
        ctx.fillRect(cx - 3, oy + 30 + bobY, 3, 3);
    } else {
        ctx.fillRect(cx + 1, oy + 30 + bobY, 3, 3);
    }

    // Legs
    ctx.fillStyle = '#555';
    ctx.fillRect(cx - 5, oy + 32 + bobY, 4, 8 + legOffset);
    ctx.fillRect(cx + 1, oy + 32 + bobY, 4, 8 - legOffset);

    // Shoes
    ctx.fillStyle = '#333';
    ctx.fillRect(cx - 6, oy + 39 + legOffset + bobY, 5, 3);
    ctx.fillRect(cx + 1, oy + 39 - legOffset + bobY, 5, 3);

    // Head
    ctx.fillStyle = '#f4c68a';
    ctx.beginPath();
    ctx.ellipse(cx, oy + 14 + bobY, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#4a3222';
    if (dir === 2 || dir === 3) { // up - back of hair
        ctx.beginPath();
        ctx.ellipse(cx, oy + 12 + bobY, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.ellipse(cx, oy + 10 + bobY, 9, 5, 0, 0, Math.PI);
        ctx.fill();
        ctx.fillRect(cx - 9, oy + 9 + bobY, 3, 6);
        ctx.fillRect(cx + 6, oy + 9 + bobY, 3, 6);
    }

    // Face
    if (dir === 0 || dir === 1) {
        ctx.fillStyle = '#333';
        if (dir === 0) { // down-right
            ctx.fillRect(cx - 1, oy + 13 + bobY, 2, 2);
            ctx.fillRect(cx + 4, oy + 13 + bobY, 2, 2);
            ctx.fillRect(cx, oy + 17 + bobY, 4, 1);
        } else { // down-left
            ctx.fillRect(cx - 5, oy + 13 + bobY, 2, 2);
            ctx.fillRect(cx, oy + 13 + bobY, 2, 2);
            ctx.fillRect(cx - 4, oy + 17 + bobY, 4, 1);
        }
    }
}

// ── Woman character sprite ──
function drawWomanFrame(ctx, ox, oy, w, h, dir, frame) {
    const cx = ox + w / 2;
    const legOffset = [0, 3, 0, -3][frame];
    const bobY = [0, -1, 0, -1][frame];

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, oy + h - 4, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dress body (A-line shape)
    ctx.fillStyle = '#d45';
    ctx.beginPath();
    ctx.moveTo(cx - 7, oy + 20 + bobY);
    ctx.lineTo(cx + 7, oy + 20 + bobY);
    ctx.lineTo(cx + 9, oy + 34 + bobY);
    ctx.lineTo(cx - 9, oy + 34 + bobY);
    ctx.closePath();
    ctx.fill();

    // Belt
    ctx.fillStyle = '#b03';
    ctx.fillRect(cx - 7, oy + 26 + bobY, 14, 2);

    // Arms (skin)
    ctx.fillStyle = '#f4c68a';
    if (dir === 0 || dir === 1) {
        ctx.fillRect(cx - 10, oy + 21 + bobY, 3, 10);
        ctx.fillRect(cx + 7, oy + 21 + bobY, 3, 10);
    } else if (dir === 2) {
        ctx.fillRect(cx - 4, oy + 21 + bobY, 3, 10);
    } else {
        ctx.fillRect(cx + 1, oy + 21 + bobY, 3, 10);
    }

    // Legs
    ctx.fillStyle = '#f4c68a';
    ctx.fillRect(cx - 4, oy + 34 + bobY, 3, 6 + legOffset);
    ctx.fillRect(cx + 1, oy + 34 + bobY, 3, 6 - legOffset);

    // Shoes
    ctx.fillStyle = '#c35';
    ctx.fillRect(cx - 5, oy + 39 + legOffset + bobY, 4, 3);
    ctx.fillRect(cx + 1, oy + 39 - legOffset + bobY, 4, 3);

    // Head
    ctx.fillStyle = '#f4c68a';
    ctx.beginPath();
    ctx.ellipse(cx, oy + 14 + bobY, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blonde hair
    ctx.fillStyle = '#f0c040';
    if (dir === 2 || dir === 3) {
        // Back view - full hair
        ctx.beginPath();
        ctx.ellipse(cx, oy + 12 + bobY, 10, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        // Long hair down back
        ctx.beginPath();
        ctx.moveTo(cx - 8, oy + 12 + bobY);
        ctx.lineTo(cx + 8, oy + 12 + bobY);
        ctx.lineTo(cx + 6, oy + 28 + bobY);
        ctx.quadraticCurveTo(cx, oy + 30 + bobY, cx - 6, oy + 28 + bobY);
        ctx.closePath();
        ctx.fill();
    } else {
        // Front - top hair + side locks
        ctx.beginPath();
        ctx.ellipse(cx, oy + 9 + bobY, 10, 6, 0, 0, Math.PI);
        ctx.fill();
        // Side locks
        ctx.beginPath();
        ctx.moveTo(cx - 10, oy + 8 + bobY);
        ctx.lineTo(cx - 10, oy + 22 + bobY);
        ctx.quadraticCurveTo(cx - 8, oy + 24 + bobY, cx - 7, oy + 22 + bobY);
        ctx.lineTo(cx - 7, oy + 8 + bobY);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 10, oy + 8 + bobY);
        ctx.lineTo(cx + 10, oy + 22 + bobY);
        ctx.quadraticCurveTo(cx + 8, oy + 24 + bobY, cx + 7, oy + 22 + bobY);
        ctx.lineTo(cx + 7, oy + 8 + bobY);
        ctx.closePath();
        ctx.fill();
    }

    // Hair highlight
    ctx.fillStyle = '#f8d860';
    if (dir !== 2 && dir !== 3) {
        ctx.beginPath();
        ctx.ellipse(cx - 2, oy + 7 + bobY, 5, 3, -0.3, 0, Math.PI);
        ctx.fill();
    }

    // Face
    if (dir === 0 || dir === 1) {
        // Blue eyes
        ctx.fillStyle = '#38a';
        if (dir === 0) {
            ctx.beginPath();
            ctx.ellipse(cx - 1, oy + 13 + bobY, 1.5, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + 5, oy + 13 + bobY, 1.5, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.ellipse(cx - 5, oy + 13 + bobY, 1.5, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + 1, oy + 13 + bobY, 1.5, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        // Eyelashes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.7;
        if (dir === 0) {
            ctx.beginPath(); ctx.moveTo(cx - 3, oy + 11.5 + bobY); ctx.lineTo(cx + 1, oy + 11.5 + bobY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx + 3, oy + 11.5 + bobY); ctx.lineTo(cx + 7, oy + 11.5 + bobY); ctx.stroke();
        } else {
            ctx.beginPath(); ctx.moveTo(cx - 7, oy + 11.5 + bobY); ctx.lineTo(cx - 3, oy + 11.5 + bobY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx - 1, oy + 11.5 + bobY); ctx.lineTo(cx + 3, oy + 11.5 + bobY); ctx.stroke();
        }
        // Lips
        ctx.fillStyle = '#e55';
        ctx.beginPath();
        const lx = dir === 0 ? cx + 1 : cx - 1;
        ctx.ellipse(lx, oy + 17 + bobY, 2.5, 1, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}
