import { TILE_SIZE, SOLID_TILES } from './tiles.js';
import { MAP_COLS, MAP_ROWS } from './map.js';

export class Player {
    constructor(col, row, sprites) {
        // Position in pixels
        this.x = col * TILE_SIZE + TILE_SIZE / 2;
        this.y = row * TILE_SIZE + TILE_SIZE / 2;
        this.speed = 180; // pixels per second
        this.sprites = sprites;

        // Direction: 0=down, 1=left, 2=right, 3=up
        this.dir = 0;
        this.frame = 0;
        this.animTimer = 0;
        this.animSpeed = 0.15; // seconds per frame
        this.moving = false;

        // Collision box (relative to center)
        this.hw = 8;  // half-width
        this.hh = 8;  // half-height (feet area)
    }

    update(dt, keys, map) {
        let dx = 0;
        let dy = 0;

        if (keys['ArrowLeft'] || keys['KeyA']) { dx -= 1; this.dir = 1; }
        if (keys['ArrowRight'] || keys['KeyD']) { dx += 1; this.dir = 2; }
        if (keys['ArrowUp'] || keys['KeyW']) { dy -= 1; this.dir = 3; }
        if (keys['ArrowDown'] || keys['KeyS']) { dy += 1; this.dir = 0; }

        this.moving = dx !== 0 || dy !== 0;

        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }

        const moveX = dx * this.speed * dt;
        const moveY = dy * this.speed * dt;

        // Try X movement
        const newX = this.x + moveX;
        if (!this.collides(newX, this.y, map)) {
            this.x = newX;
        }

        // Try Y movement
        const newY = this.y + moveY;
        if (!this.collides(this.x, newY, map)) {
            this.y = newY;
        }

        // Clamp to map bounds
        this.x = Math.max(this.hw, Math.min(MAP_COLS * TILE_SIZE - this.hw, this.x));
        this.y = Math.max(this.hh, Math.min(MAP_ROWS * TILE_SIZE - this.hh, this.y));

        // Animation
        if (this.moving) {
            this.animTimer += dt;
            if (this.animTimer >= this.animSpeed) {
                this.animTimer -= this.animSpeed;
                this.frame = (this.frame + 1) % this.sprites.frames;
            }
        } else {
            this.frame = 0;
            this.animTimer = 0;
        }
    }

    collides(px, py, map) {
        // Check all 4 corners of the collision box
        const corners = [
            { x: px - this.hw, y: py - this.hh },
            { x: px + this.hw, y: py - this.hh },
            { x: px - this.hw, y: py + this.hh },
            { x: px + this.hw, y: py + this.hh },
        ];

        for (const corner of corners) {
            const col = Math.floor(corner.x / TILE_SIZE);
            const row = Math.floor(corner.y / TILE_SIZE);

            if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) {
                return true; // Out of bounds
            }

            if (SOLID_TILES.has(map[row][col])) {
                return true;
            }
        }

        return false;
    }

    draw(ctx, camX, camY) {
        const sx = this.frame * this.sprites.frameW;
        const sy = this.dir * this.sprites.frameH;
        const drawX = this.x - camX - this.sprites.frameW / 2;
        const drawY = this.y - camY - this.sprites.frameH + this.hh + 4;

        ctx.drawImage(
            this.sprites.canvas,
            sx, sy, this.sprites.frameW, this.sprites.frameH,
            drawX, drawY, this.sprites.frameW, this.sprites.frameH
        );
    }
}
