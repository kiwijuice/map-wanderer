// ── Tile types ──
export const TILE = {
    GRASS: 0,
    ROAD_H: 1,
    ROAD_V: 2,
    ROAD_CROSS: 3,
    SIDEWALK: 4,
    BUILDING_RED: 5,
    BUILDING_BLUE: 6,
    BUILDING_GRAY: 7,
    BUILDING_BROWN: 8,
    PARK: 9,
    WATER: 10,
    ROAD_T_UP: 11,
    ROAD_T_DOWN: 12,
    ROAD_T_LEFT: 13,
    ROAD_T_RIGHT: 14,
    FENCE: 15,
    TREE: 16,
    BUILDING_TALL: 17,
    PLAZA: 18,
    BUILDING_SHOP: 19,
    LANDMARK: 20,
    BUILDING_OFFICE: 21,
    BUILDING_MODERN: 22,
    OCCUPIED: 23,
    BUILDING_SKYSCRAPER: 24,
    BUILDING_HOUSE_A: 25,
    BUILDING_HOUSE_B: 26,
    BUILDING_HOUSE_C: 27,
    BUILDING_CITYHALL: 28,
};

// Which tiles block the player
export const SOLID_TILES = new Set([
    TILE.BUILDING_RED,
    TILE.BUILDING_BLUE,
    TILE.BUILDING_GRAY,
    TILE.BUILDING_BROWN,
    TILE.BUILDING_TALL,
    TILE.BUILDING_SHOP,
    TILE.WATER,
    TILE.FENCE,
    TILE.TREE,
    TILE.LANDMARK,
    TILE.BUILDING_OFFICE,
    TILE.BUILDING_MODERN,
    TILE.OCCUPIED,
    TILE.BUILDING_SKYSCRAPER,
    TILE.BUILDING_HOUSE_A,
    TILE.BUILDING_HOUSE_B,
    TILE.BUILDING_HOUSE_C,
    TILE.BUILDING_CITYHALL,
]);

// Isometric tile dimensions
export const TILE_W = 64;   // width of diamond
export const TILE_H = 32;   // height of diamond
export const TILE_SIZE = 32; // logical grid size for movement/collision

// Heights for raised tiles (in pixels above ground)
export const TILE_HEIGHT = {
    [TILE.BUILDING_RED]: 40,
    [TILE.BUILDING_BLUE]: 40,
    [TILE.BUILDING_GRAY]: 40,
    [TILE.BUILDING_BROWN]: 40,
    [TILE.BUILDING_TALL]: 64,
    [TILE.BUILDING_SHOP]: 32,
    [TILE.TREE]: 36,
    [TILE.FENCE]: 16,
    [TILE.LANDMARK]: 90,
    [TILE.BUILDING_OFFICE]: 110,
    [TILE.BUILDING_MODERN]: 120,
    [TILE.BUILDING_SKYSCRAPER]: 160,
    [TILE.BUILDING_HOUSE_A]: 44,
    [TILE.BUILDING_HOUSE_B]: 44,
    [TILE.BUILDING_HOUSE_C]: 44,
    [TILE.BUILDING_CITYHALL]: 100,
};

// Multi-tile building footprints (anchor is at bottom-right corner)
export const TILE_FOOTPRINT = {
    [TILE.BUILDING_MODERN]: { cols: 2, rows: 2 },
    [TILE.BUILDING_SKYSCRAPER]: { cols: 2, rows: 2 },
    [TILE.BUILDING_CITYHALL]: { cols: 2, rows: 2 },
};

// Convert map (col, row) to isometric screen (x, y)
export function toScreen(col, row) {
    return {
        x: (col - row) * (TILE_W / 2),
        y: (col + row) * (TILE_H / 2),
    };
}

// Convert screen (x, y) to map (col, row) — fractional
export function toMap(sx, sy) {
    return {
        col: (sx / (TILE_W / 2) + sy / (TILE_H / 2)) / 2,
        row: (sy / (TILE_H / 2) - sx / (TILE_W / 2)) / 2,
    };
}
