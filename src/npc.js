import { TILE, TILE_SIZE, SOLID_TILES, toScreen } from './tiles.js';
import { MAP_COLS, MAP_ROWS } from './map.js';
import { generatePlayerSprites } from './assets.js';

// ── NPC configuration ──
const ROAD_TILES = new Set([
    TILE.ROAD_H, TILE.ROAD_V, TILE.ROAD_CROSS,
    TILE.ROAD_T_UP, TILE.ROAD_T_DOWN, TILE.ROAD_T_LEFT, TILE.ROAD_T_RIGHT,
]);

const BUILDING_TILES = new Set([...SOLID_TILES].filter(t =>
    t !== TILE.WATER && t !== TILE.FENCE && t !== TILE.TREE
));

const NPC_TYPES = [
    'npc-woman-red',
    'npc-woman-blue',
    'npc-woman-purple',
    'npc-woman-yellow',
    'npc-woman-pink',
    'npc-woman-white',
];

// ── NPC class ──
export class NPC {
    constructor(col, row, dir, sprites) {
        this.x = col * TILE_SIZE + TILE_SIZE / 2;
        this.y = row * TILE_SIZE + TILE_SIZE / 2;
        this.dir = dir;
        this.sprites = sprites;
    }

    getScreenPos() {
        const col = this.x / TILE_SIZE;
        const row = this.y / TILE_SIZE;
        return toScreen(col, row);
    }

    draw(ctx, camX, camY) {
        const screen = this.getScreenPos();
        const sy = this.dir * this.sprites.frameH;
        const drawX = screen.x - camX - this.sprites.frameW / 2;
        const drawY = screen.y - camY - this.sprites.frameH + 8;
        ctx.drawImage(
            this.sprites.canvas,
            0, sy, this.sprites.frameW, this.sprites.frameH,
            drawX, drawY, this.sprites.frameW, this.sprites.frameH
        );
    }

    // ── Check if player is within 1 tile and in front of NPC ──
    isPlayerNear(player) {
        const dx = Math.abs(this.x - player.x) / TILE_SIZE;
        const dy = Math.abs(this.y - player.y) / TILE_SIZE;
        return dx <= 1.5 && dy <= 1.5;
    }

    // ── Draw comic speech bubble ──
    drawBubble(ctx, camX, camY) {
        const screen = this.getScreenPos();
        const bx = screen.x - camX;
        const by = screen.y - camY - this.sprites.frameH - 8;
        const text = 'Hello!';
        const pw = 6;  // padding horizontal
        const ph = 4;  // padding vertical

        ctx.font = 'bold 11px sans-serif';
        const tw = ctx.measureText(text).width;
        const bw = tw + pw * 2;
        const bh = 16 + ph * 2;
        const rx = bx - bw / 2;
        const ry = by - bh;

        // Bubble body
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(rx, ry, bw, bh, 6);
        ctx.fill();
        ctx.stroke();

        // Tail triangle
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx - 4, ry + bh);
        ctx.lineTo(bx, ry + bh + 6);
        ctx.lineTo(bx + 4, ry + bh);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Fill over the tail base line
        ctx.fillStyle = '#fff';
        ctx.fillRect(bx - 3.5, ry + bh - 1.5, 7, 2);

        // Text
        ctx.fillStyle = '#222';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, bx, ry + bh / 2);
    }

    getMapRow() { return this.y / TILE_SIZE; }
    getMapCol() { return this.x / TILE_SIZE; }
}

// ── Find direction facing nearest road ──
function findRoadDirection(map, row, col) {
    const dirs = [
        { dr: 0, dc: 1, dir: 0 },  // +col → down-right
        { dr: 1, dc: 0, dir: 1 },  // +row → down-left
        { dr: 0, dc: -1, dir: 2 }, // -col → up-left
        { dr: -1, dc: 0, dir: 3 }, // -row → up-right
    ];
    for (const { dr, dc, dir } of dirs) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < MAP_ROWS && nc >= 0 && nc < MAP_COLS) {
            if (ROAD_TILES.has(map[nr][nc])) return dir;
        }
    }
    // Check 2 tiles away
    for (const { dr, dc, dir } of dirs) {
        const nr = row + dr * 2;
        const nc = col + dc * 2;
        if (nr >= 0 && nr < MAP_ROWS && nc >= 0 && nc < MAP_COLS) {
            if (ROAD_TILES.has(map[nr][nc])) return dir;
        }
    }
    return 0;
}

// ── Create NPCs placed near buildings facing roads ──
export async function createNPCs(map, count = 30) {
    // Load all sprite types in parallel
    const spriteEntries = await Promise.all(
        NPC_TYPES.map(async type => [type, await generatePlayerSprites(type)])
    );
    const spriteMap = Object.fromEntries(spriteEntries);

    // Find candidate positions: sidewalk tiles adjacent to a building
    const candidates = [];
    for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
            if (map[r][c] !== TILE.SIDEWALK) continue;

            let nearBuilding = false;
            for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr < 0 || nr >= MAP_ROWS || nc < 0 || nc >= MAP_COLS) continue;
                if (BUILDING_TILES.has(map[nr][nc])) {
                    nearBuilding = true;
                    break;
                }
            }
            if (nearBuilding) {
                candidates.push({ row: r, col: c });
            }
        }
    }

    // Random shuffle
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const chosen = candidates.slice(0, Math.min(count, candidates.length));
    const npcs = [];

    for (let i = 0; i < chosen.length; i++) {
        const { row, col } = chosen[i];
        const dir = findRoadDirection(map, row, col);
        const type = NPC_TYPES[i % NPC_TYPES.length];
        npcs.push(new NPC(col, row, dir, spriteMap[type]));
    }

    return npcs;
}
