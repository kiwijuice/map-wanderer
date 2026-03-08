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
]);

export const TILE_SIZE = 48;
