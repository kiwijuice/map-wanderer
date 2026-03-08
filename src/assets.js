import { TILE, TILE_SIZE } from './tiles.js';

// Generate all tile textures as offscreen canvases
export function generateTileTextures() {
    const textures = {};

    textures[TILE.GRASS] = makeTile((ctx, s) => {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, s, s);
        // grass detail
        ctx.fillStyle = '#5a8c4f';
        for (let i = 0; i < 12; i++) {
            const x = Math.random() * s;
            const y = Math.random() * s;
            ctx.fillRect(x, y, 2, 6);
        }
    });

    textures[TILE.ROAD_H] = makeTile((ctx, s) => {
        ctx.fillStyle = '#555';
        ctx.fillRect(0, 0, s, s);
        // lane line
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(0, s / 2);
        ctx.lineTo(s, s / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // road edges
        ctx.fillStyle = '#777';
        ctx.fillRect(0, 0, s, 3);
        ctx.fillRect(0, s - 3, s, 3);
    });

    textures[TILE.ROAD_V] = makeTile((ctx, s) => {
        ctx.fillStyle = '#555';
        ctx.fillRect(0, 0, s, s);
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(s / 2, 0);
        ctx.lineTo(s / 2, s);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#777';
        ctx.fillRect(0, 0, 3, s);
        ctx.fillRect(s - 3, 0, 3, s);
    });

    textures[TILE.ROAD_CROSS] = makeTile((ctx, s) => {
        ctx.fillStyle = '#555';
        ctx.fillRect(0, 0, s, s);
        // crosswalk marks
        ctx.fillStyle = '#fff';
        for (let i = 4; i < s - 4; i += 8) {
            ctx.fillRect(i, 2, 4, 4);
            ctx.fillRect(i, s - 6, 4, 4);
            ctx.fillRect(2, i, 4, 4);
            ctx.fillRect(s - 6, i, 4, 4);
        }
    });

    // T-intersections
    for (const type of [TILE.ROAD_T_UP, TILE.ROAD_T_DOWN, TILE.ROAD_T_LEFT, TILE.ROAD_T_RIGHT]) {
        textures[type] = makeTile((ctx, s) => {
            ctx.fillStyle = '#555';
            ctx.fillRect(0, 0, s, s);
            ctx.fillStyle = '#666';
            ctx.fillRect(s / 2 - 1, s / 2 - 1, 2, 2);
        });
    }

    textures[TILE.SIDEWALK] = makeTile((ctx, s) => {
        ctx.fillStyle = '#bbb';
        ctx.fillRect(0, 0, s, s);
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        // tile pattern
        for (let x = 0; x < s; x += s / 3) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, s); ctx.stroke();
        }
        for (let y = 0; y < s; y += s / 3) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke();
        }
    });

    textures[TILE.BUILDING_RED] = makeBuilding('#b33', '#922', '#fda');
    textures[TILE.BUILDING_BLUE] = makeBuilding('#448', '#336', '#adf');
    textures[TILE.BUILDING_GRAY] = makeBuilding('#888', '#666', '#ddd');
    textures[TILE.BUILDING_BROWN] = makeBuilding('#8b6914', '#6b4c12', '#fde');

    textures[TILE.BUILDING_TALL] = makeTile((ctx, s) => {
        ctx.fillStyle = '#556';
        ctx.fillRect(0, 0, s, s);
        ctx.fillStyle = '#445';
        ctx.fillRect(2, 2, s - 4, s - 4);
        // windows grid
        ctx.fillStyle = '#ffa';
        for (let wy = 5; wy < s - 5; wy += 10) {
            for (let wx = 6; wx < s - 6; wx += 10) {
                if (Math.random() > 0.3) {
                    ctx.fillStyle = Math.random() > 0.5 ? '#ffa' : '#aef';
                    ctx.fillRect(wx, wy, 5, 5);
                }
            }
        }
        // edge highlight
        ctx.strokeStyle = '#667';
        ctx.strokeRect(1, 1, s - 2, s - 2);
    });

    textures[TILE.BUILDING_SHOP] = makeTile((ctx, s) => {
        ctx.fillStyle = '#e8d5b7';
        ctx.fillRect(0, 0, s, s);
        // awning
        ctx.fillStyle = '#c44';
        ctx.fillRect(2, 2, s - 4, 12);
        ctx.fillStyle = '#fff';
        for (let x = 6; x < s - 6; x += 8) {
            ctx.fillRect(x, 4, 4, 8);
        }
        // shop window
        ctx.fillStyle = '#8cf';
        ctx.fillRect(6, 18, s - 12, s - 28);
        ctx.strokeStyle = '#654';
        ctx.strokeRect(6, 18, s - 12, s - 28);
        // door
        ctx.fillStyle = '#654';
        ctx.fillRect(s / 2 - 5, s - 12, 10, 12);
    });

    textures[TILE.PARK] = makeTile((ctx, s) => {
        ctx.fillStyle = '#5a9c4f';
        ctx.fillRect(0, 0, s, s);
        // flowers
        const colors = ['#f44', '#ff0', '#f9f', '#fff'];
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.arc(8 + Math.random() * (s - 16), 8 + Math.random() * (s - 16), 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    textures[TILE.WATER] = makeTile((ctx, s) => {
        ctx.fillStyle = '#2a6fdb';
        ctx.fillRect(0, 0, s, s);
        ctx.strokeStyle = '#5a9fff';
        ctx.lineWidth = 1;
        for (let y = 4; y < s; y += 10) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.quadraticCurveTo(s / 4, y - 4, s / 2, y);
            ctx.quadraticCurveTo(3 * s / 4, y + 4, s, y);
            ctx.stroke();
        }
    });

    textures[TILE.FENCE] = makeTile((ctx, s) => {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, s, s);
        // fence posts
        ctx.fillStyle = '#8B4513';
        for (let x = 4; x < s; x += 12) {
            ctx.fillRect(x, 8, 4, s - 16);
        }
        // rails
        ctx.fillRect(0, 14, s, 3);
        ctx.fillRect(0, s - 18, s, 3);
    });

    textures[TILE.TREE] = makeTile((ctx, s) => {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, s, s);
        // trunk
        ctx.fillStyle = '#6B3A1F';
        ctx.fillRect(s / 2 - 4, s / 2, 8, s / 2);
        // canopy
        ctx.fillStyle = '#2d6b1e';
        ctx.beginPath();
        ctx.arc(s / 2, s / 2 - 2, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a8a2a';
        ctx.beginPath();
        ctx.arc(s / 2 - 5, s / 2 - 6, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s / 2 + 5, s / 2 - 4, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    textures[TILE.PLAZA] = makeTile((ctx, s) => {
        ctx.fillStyle = '#c8b090';
        ctx.fillRect(0, 0, s, s);
        ctx.strokeStyle = '#a89070';
        ctx.lineWidth = 1;
        // diamond pattern
        for (let x = 0; x <= s; x += s / 2) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, s); ctx.stroke();
        }
        for (let y = 0; y <= s; y += s / 2) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke();
        }
    });

    return textures;
}

function makeTile(draw) {
    const c = document.createElement('canvas');
    c.width = c.height = TILE_SIZE;
    const ctx = c.getContext('2d');
    draw(ctx, TILE_SIZE);
    return c;
}

function makeBuilding(wallColor, roofColor, windowColor) {
    return makeTile((ctx, s) => {
        // wall
        ctx.fillStyle = wallColor;
        ctx.fillRect(0, 0, s, s);
        // darker edge (top = roof)
        ctx.fillStyle = roofColor;
        ctx.fillRect(0, 0, s, 8);
        ctx.fillRect(0, 0, 4, s);
        // windows
        ctx.fillStyle = windowColor;
        const winSize = 8;
        const gap = 6;
        for (let wy = 14; wy + winSize < s - 4; wy += winSize + gap) {
            for (let wx = 10; wx + winSize < s - 4; wx += winSize + gap) {
                ctx.fillRect(wx, wy, winSize, winSize);
                ctx.strokeStyle = roofColor;
                ctx.strokeRect(wx, wy, winSize, winSize);
            }
        }
    });
}

// Generate player sprite sheet (4 directions x 4 frames)
export function generatePlayerSprites() {
    const frameW = 32;
    const frameH = 40;
    const directions = 4; // down, left, right, up
    const frames = 4;

    const c = document.createElement('canvas');
    c.width = frameW * frames;
    c.height = frameH * directions;
    const ctx = c.getContext('2d');

    for (let dir = 0; dir < directions; dir++) {
        for (let frame = 0; frame < frames; frame++) {
            const ox = frame * frameW;
            const oy = dir * frameH;
            drawPlayerFrame(ctx, ox, oy, frameW, frameH, dir, frame);
        }
    }

    return { canvas: c, frameW, frameH, frames, directions };
}

function drawPlayerFrame(ctx, ox, oy, w, h, dir, frame) {
    const cx = ox + w / 2;

    // Walk cycle offsets
    const legOffset = [0, 3, 0, -3][frame];
    const bobY = [0, -1, 0, -1][frame];

    // Body
    ctx.fillStyle = '#3465a4'; // blue shirt
    ctx.fillRect(cx - 7, oy + 16 + bobY, 14, 12);

    // Arms
    ctx.fillStyle = '#3465a4';
    if (dir === 0) { // down
        ctx.fillRect(cx - 10, oy + 17 + bobY, 4, 10);
        ctx.fillRect(cx + 6, oy + 17 + bobY, 4, 10);
    } else if (dir === 1) { // left
        ctx.fillRect(cx - 4, oy + 17 + bobY, 4, 10);
    } else if (dir === 2) { // right
        ctx.fillRect(cx, oy + 17 + bobY, 4, 10);
    } else { // up
        ctx.fillRect(cx - 10, oy + 17 + bobY, 4, 10);
        ctx.fillRect(cx + 6, oy + 17 + bobY, 4, 10);
    }

    // Hands (skin)
    ctx.fillStyle = '#f4c68a';
    if (dir === 0) {
        ctx.fillRect(cx - 9, oy + 26 + bobY, 3, 3);
        ctx.fillRect(cx + 6, oy + 26 + bobY, 3, 3);
    } else if (dir === 1) {
        ctx.fillRect(cx - 3, oy + 26 + bobY, 3, 3);
    } else if (dir === 2) {
        ctx.fillRect(cx + 1, oy + 26 + bobY, 3, 3);
    } else {
        ctx.fillRect(cx - 9, oy + 26 + bobY, 3, 3);
        ctx.fillRect(cx + 6, oy + 26 + bobY, 3, 3);
    }

    // Legs
    ctx.fillStyle = '#555'; // dark pants
    ctx.fillRect(cx - 5, oy + 28 + bobY, 4, 8 + legOffset);
    ctx.fillRect(cx + 1, oy + 28 + bobY, 4, 8 - legOffset);

    // Shoes
    ctx.fillStyle = '#333';
    ctx.fillRect(cx - 6, oy + 35 + legOffset + bobY, 5, 3);
    ctx.fillRect(cx + 1, oy + 35 - legOffset + bobY, 5, 3);

    // Head
    ctx.fillStyle = '#f4c68a'; // skin
    ctx.beginPath();
    ctx.ellipse(cx, oy + 11 + bobY, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#4a3222';
    if (dir === 3) { // up - show back of hair
        ctx.beginPath();
        ctx.ellipse(cx, oy + 9 + bobY, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.ellipse(cx, oy + 7 + bobY, 9, 5, 0, 0, Math.PI);
        ctx.fill();
        // side hair
        ctx.fillRect(cx - 9, oy + 6 + bobY, 3, 6);
        ctx.fillRect(cx + 6, oy + 6 + bobY, 3, 6);
    }

    // Face (only front/side)
    if (dir !== 3) {
        ctx.fillStyle = '#333';
        if (dir === 0) { // down - both eyes
            ctx.fillRect(cx - 4, oy + 10 + bobY, 2, 2);
            ctx.fillRect(cx + 2, oy + 10 + bobY, 2, 2);
            // mouth
            ctx.fillRect(cx - 2, oy + 14 + bobY, 4, 1);
        } else if (dir === 1) { // left
            ctx.fillRect(cx - 4, oy + 10 + bobY, 2, 2);
            ctx.fillRect(cx - 3, oy + 14 + bobY, 3, 1);
        } else { // right
            ctx.fillRect(cx + 2, oy + 10 + bobY, 2, 2);
            ctx.fillRect(cx, oy + 14 + bobY, 3, 1);
        }
    }
}
