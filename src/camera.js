import { TILE_W, TILE_H, toScreen } from './tiles.js';
import { MAP_COLS, MAP_ROWS } from './map.js';

export class Camera {
    constructor(viewW, viewH) {
        this.x = 0;
        this.y = 0;
        this.viewW = viewW;
        this.viewH = viewH;
    }

    follow(screenX, screenY) {
        // Center on target screen position
        this.x = screenX - this.viewW / 2;
        this.y = screenY - this.viewH / 2;

        // Calculate isometric map bounds
        // The four corners of the map in screen space
        const topCorner = toScreen(0, 0);            // top
        const rightCorner = toScreen(MAP_COLS, 0);    // right
        const bottomCorner = toScreen(MAP_COLS, MAP_ROWS); // bottom
        const leftCorner = toScreen(0, MAP_ROWS);     // left

        const minX = leftCorner.x - TILE_W;
        const maxX = rightCorner.x + TILE_W - this.viewW;
        const minY = topCorner.y - TILE_H;
        const maxY = bottomCorner.y + TILE_H - this.viewH;

        this.x = Math.max(minX, Math.min(maxX, this.x));
        this.y = Math.max(minY, Math.min(maxY, this.y));
    }

    resize(viewW, viewH) {
        this.viewW = viewW;
        this.viewH = viewH;
    }

    // Determine which tile range is potentially visible
    getVisibleRange() {
        // Be generous with the range to avoid popping
        const pad = 4;
        return {
            startCol: 0 - pad,
            startRow: 0 - pad,
            endCol: MAP_COLS + pad,
            endRow: MAP_ROWS + pad,
        };
    }
}
