import { TILE_SIZE } from './tiles.js';
import { MAP_COLS, MAP_ROWS } from './map.js';

export class Camera {
    constructor(viewW, viewH) {
        this.x = 0;
        this.y = 0;
        this.viewW = viewW;
        this.viewH = viewH;
    }

    follow(targetX, targetY) {
        // Center on target
        this.x = targetX - this.viewW / 2;
        this.y = targetY - this.viewH / 2;

        // Clamp to map edges
        const maxX = MAP_COLS * TILE_SIZE - this.viewW;
        const maxY = MAP_ROWS * TILE_SIZE - this.viewH;
        this.x = Math.max(0, Math.min(maxX, this.x));
        this.y = Math.max(0, Math.min(maxY, this.y));
    }

    resize(viewW, viewH) {
        this.viewW = viewW;
        this.viewH = viewH;
    }

    // Get visible tile range
    getVisibleRange() {
        const startCol = Math.floor(this.x / TILE_SIZE);
        const startRow = Math.floor(this.y / TILE_SIZE);
        const endCol = Math.min(MAP_COLS - 1, Math.ceil((this.x + this.viewW) / TILE_SIZE));
        const endRow = Math.min(MAP_ROWS - 1, Math.ceil((this.y + this.viewH) / TILE_SIZE));
        return { startCol, startRow, endCol, endRow };
    }
}
