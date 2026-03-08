import { TILE_SIZE, TILE_W, TILE_H, SOLID_TILES, toScreen } from './tiles.js';
import { MAP_COLS, MAP_ROWS } from './map.js';

export class Player {
    constructor(col, row, sprites) {
        // Position in map-space pixels (col/row * TILE_SIZE)
        this.x = col * TILE_SIZE + TILE_SIZE / 2;
        this.y = row * TILE_SIZE + TILE_SIZE / 2;
        this.speed = 120; // pixels per second in map space
        this.sprites = sprites;

        // Direction: 0=down-right, 1=down-left, 2=up-left, 3=up-right (isometric)
        this.dir = 0;
        this.frame = 0;
        this.animTimer = 0;
        this.animSpeed = 0.15;
        this.moving = false;

        // Collision box (relative to center, in map space)
        this.hw = 6;
        this.hh = 6;
    }

    update(dt, keys, map) {
        let dx = 0;
        let dy = 0;

        // Arrow keys map to isometric directions
        // Right arrow = move +col (down-right in iso)
        // Left arrow = move -col (up-left in iso)
        // Down arrow = move +row (down-left in iso)
        // Up arrow = move -row (up-right in iso)
        if (keys['ArrowRight'] || keys['KeyD']) { dx += 1; }
        if (keys['ArrowLeft'] || keys['KeyA']) { dx -= 1; }
        if (keys['ArrowDown'] || keys['KeyS']) { dy += 1; }
        if (keys['ArrowUp'] || keys['KeyW']) { dy -= 1; }

        this.moving = dx !== 0 || dy !== 0;

        // Determine facing direction
        if (dx > 0 && dy >= 0) this.dir = 0;   // down-right
        else if (dx <= 0 && dy > 0) this.dir = 1;   // down-left
        else if (dx < 0 && dy <= 0) this.dir = 2;   // up-left
        else if (dx >= 0 && dy < 0) this.dir = 3;   // up-right

        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }

        const moveX = dx * this.speed * dt;
        const moveY = dy * this.speed * dt;

        // Try X movement (col direction)
        const newX = this.x + moveX;
        if (!this.collides(newX, this.y, map)) {
            this.x = newX;
        }

        // Try Y movement (row direction)
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
                return true;
            }

            if (SOLID_TILES.has(map[row][col])) {
                return true;
            }
        }

        return false;
    }

    // Get screen position for isometric rendering
    getScreenPos() {
        const col = this.x / TILE_SIZE;
        const row = this.y / TILE_SIZE;
        return toScreen(col, row);
    }

    draw(ctx, camX, camY) {
        const screen = this.getScreenPos();
        const sx = this.frame * this.sprites.frameW;
        const sy = this.dir * this.sprites.frameH;
        const drawX = screen.x - camX - this.sprites.frameW / 2;
        const drawY = screen.y - camY - this.sprites.frameH + 8;

        ctx.drawImage(
            this.sprites.canvas,
            sx, sy, this.sprites.frameW, this.sprites.frameH,
            drawX, drawY, this.sprites.frameW, this.sprites.frameH
        );
    }

    // Map row/col for sorting
    getMapRow() { return this.y / TILE_SIZE; }
    getMapCol() { return this.x / TILE_SIZE; }
}
