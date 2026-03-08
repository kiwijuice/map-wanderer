import { TILE } from './tiles.js';

// Map dimensions (in tiles)
export const MAP_COLS = 80;
export const MAP_ROWS = 60;

// Player start position (in tiles)
export const PLAYER_START = { col: 10, row: 10 };

// Generate the city map
export function generateMap() {
    const map = Array.from({ length: MAP_ROWS }, () =>
        Array(MAP_COLS).fill(TILE.GRASS)
    );

    const T = TILE;

    // ── Helper functions ──
    function hRoad(row, c1, c2) {
        for (let c = c1; c <= c2; c++) map[row][c] = T.ROAD_H;
    }
    function vRoad(col, r1, r2) {
        for (let r = r1; r <= r2; r++) map[r][col] = T.ROAD_V;
    }
    function cross(row, col) {
        map[row][col] = T.ROAD_CROSS;
    }
    function fillRect(r1, c1, r2, c2, tile) {
        for (let r = r1; r <= r2; r++)
            for (let c = c1; c <= c2; c++)
                map[r][c] = tile;
    }
    function sidewalkBorder(r1, c1, r2, c2) {
        for (let c = c1; c <= c2; c++) {
            if (map[r1][c] === T.GRASS) map[r1][c] = T.SIDEWALK;
            if (map[r2][c] === T.GRASS) map[r2][c] = T.SIDEWALK;
        }
        for (let r = r1; r <= r2; r++) {
            if (map[r][c1] === T.GRASS) map[r][c1] = T.SIDEWALK;
            if (map[r][c2] === T.GRASS) map[r][c2] = T.SIDEWALK;
        }
    }
    // Place a multi-tile building: anchor at bottom-right, OCCUPIED elsewhere
    function placeBuilding(r1, c1, rows, cols, tile) {
        for (let r = r1; r < r1 + rows; r++)
            for (let c = c1; c < c1 + cols; c++)
                map[r][c] = T.OCCUPIED;
        map[r1 + rows - 1][c1 + cols - 1] = tile; // anchor
    }

    // ── Major horizontal roads ──
    hRoad(8, 0, MAP_COLS - 1);
    hRoad(9, 0, MAP_COLS - 1);
    hRoad(20, 0, MAP_COLS - 1);
    hRoad(21, 0, MAP_COLS - 1);
    hRoad(34, 0, MAP_COLS - 1);
    hRoad(35, 0, MAP_COLS - 1);
    hRoad(48, 0, MAP_COLS - 1);
    hRoad(49, 0, MAP_COLS - 1);

    // ── Major vertical roads ──
    vRoad(10, 0, MAP_ROWS - 1);
    vRoad(11, 0, MAP_ROWS - 1);
    vRoad(25, 0, MAP_ROWS - 1);
    vRoad(26, 0, MAP_ROWS - 1);
    vRoad(40, 0, MAP_ROWS - 1);
    vRoad(41, 0, MAP_ROWS - 1);
    vRoad(55, 0, MAP_ROWS - 1);
    vRoad(56, 0, MAP_ROWS - 1);
    vRoad(70, 0, MAP_ROWS - 1);
    vRoad(71, 0, MAP_ROWS - 1);

    // ── Intersections ──
    const hRoads = [8, 9, 20, 21, 34, 35, 48, 49];
    const vRoads = [10, 11, 25, 26, 40, 41, 55, 56, 70, 71];
    for (const r of hRoads) {
        for (const c of vRoads) {
            cross(r, c);
        }
    }

    // ── Sidewalks along roads ──
    for (const r of [7, 10, 19, 22, 33, 36, 47, 50]) {
        for (let c = 0; c < MAP_COLS; c++) {
            if (map[r][c] === T.GRASS) map[r][c] = T.SIDEWALK;
        }
    }
    for (const c of [9, 12, 24, 27, 39, 42, 54, 57, 69, 72]) {
        for (let r = 0; r < MAP_ROWS; r++) {
            if (map[r][c] === T.GRASS) map[r][c] = T.SIDEWALK;
        }
    }

    // ── City blocks with buildings ──
    // Block 1: residential (between roads row 8-20, col 10-25)
    fillRect(11, 13, 13, 17, T.BUILDING_RED);
    fillRect(11, 19, 13, 23, T.BUILDING_BLUE);
    fillRect(15, 13, 18, 16, T.BUILDING_RED);
    fillRect(15, 18, 18, 23, T.BUILDING_BROWN);

    // Block 2: commercial district
    fillRect(11, 28, 14, 32, T.BUILDING_OFFICE);
    fillRect(11, 34, 14, 38, T.BUILDING_GRAY);
    fillRect(16, 28, 19, 31, T.BUILDING_SHOP);
    fillRect(16, 33, 19, 38, T.BUILDING_BLUE);

    // Block 3: downtown
    fillRect(11, 43, 15, 48, T.BUILDING_OFFICE);
    fillRect(11, 50, 15, 53, T.BUILDING_TALL);
    fillRect(17, 43, 19, 47, T.BUILDING_SHOP);
    fillRect(17, 49, 19, 53, T.BUILDING_GRAY);

    // Block 4: park area
    fillRect(11, 58, 19, 68, T.PARK);
    fillRect(14, 61, 16, 65, T.WATER);
    // Trees around the park
    map[11][58] = T.TREE; map[11][62] = T.TREE; map[11][68] = T.TREE;
    map[19][58] = T.TREE; map[19][63] = T.TREE; map[19][68] = T.TREE;
    map[15][58] = T.TREE; map[15][68] = T.TREE;

    // Block 5: residential south
    fillRect(23, 13, 26, 17, T.BUILDING_BROWN);
    fillRect(23, 19, 26, 23, T.BUILDING_RED);
    fillRect(28, 13, 32, 16, T.BUILDING_BLUE);
    fillRect(28, 18, 32, 23, T.BUILDING_RED);

    // Block 6: commercial south
    fillRect(23, 28, 26, 33, T.BUILDING_SHOP);
    fillRect(23, 35, 26, 38, T.BUILDING_OFFICE);
    fillRect(28, 28, 33, 32, T.BUILDING_GRAY);
    fillRect(28, 34, 33, 38, T.BUILDING_OFFICE);

    // Block 7: plaza & shops with landmark
    fillRect(23, 43, 33, 53, T.PLAZA);
    fillRect(25, 45, 27, 48, T.BUILDING_SHOP);
    fillRect(25, 50, 27, 52, T.BUILDING_SHOP);
    // Landmark cathedral in center of plaza
    map[28][48] = T.LANDMARK;
    map[28][49] = T.LANDMARK;
    map[29][48] = T.LANDMARK;
    map[29][49] = T.LANDMARK;
    // Modern tower (file-based SVG, 2x2 multi-tile building) in the plaza
    placeBuilding(26, 49, 2, 2, T.BUILDING_MODERN);
    fillRect(30, 45, 32, 48, T.BUILDING_SHOP);
    fillRect(30, 50, 32, 52, T.BUILDING_SHOP);
    // Fountain area in center
    map[28][49] = T.WATER;
    map[28][48] = T.WATER;
    map[29][49] = T.WATER;
    map[29][48] = T.WATER;

    // Block 8: more park
    fillRect(23, 58, 33, 68, T.PARK);
    // Trees scattered
    for (let tr = 24; tr <= 32; tr += 2) {
        for (let tc = 59; tc <= 67; tc += 3) {
            map[tr][tc] = T.TREE;
        }
    }

    // ── Southern blocks ──
    // Block 9
    fillRect(37, 13, 40, 18, T.BUILDING_TALL);
    fillRect(37, 20, 40, 23, T.BUILDING_GRAY);
    fillRect(42, 13, 46, 17, T.BUILDING_RED);
    fillRect(42, 19, 46, 23, T.BUILDING_BROWN);

    // Block 10
    fillRect(37, 28, 41, 33, T.BUILDING_BLUE);
    fillRect(37, 35, 41, 38, T.BUILDING_SHOP);
    fillRect(43, 28, 47, 32, T.BUILDING_TALL);
    fillRect(43, 34, 47, 38, T.BUILDING_RED);

    // Block 11: waterfront
    fillRect(37, 43, 47, 53, T.PARK);
    fillRect(40, 44, 44, 52, T.WATER);
    map[39][45] = T.TREE; map[39][50] = T.TREE;
    map[45][44] = T.TREE; map[45][52] = T.TREE;
    // Fence around water
    for (let c = 44; c <= 52; c++) {
        map[39][c] = T.FENCE;
        map[45][c] = T.FENCE;
    }

    // Block 12: residential
    fillRect(37, 58, 40, 63, T.BUILDING_BROWN);
    fillRect(37, 65, 40, 68, T.BUILDING_BLUE);
    fillRect(42, 58, 47, 62, T.BUILDING_RED);
    fillRect(42, 64, 47, 68, T.BUILDING_GRAY);

    // ── Far right blocks ──
    fillRect(11, 73, 15, 78, T.BUILDING_GRAY);
    fillRect(17, 73, 19, 78, T.BUILDING_SHOP);
    fillRect(23, 73, 27, 78, T.BUILDING_TALL);
    fillRect(29, 73, 33, 78, T.BUILDING_BROWN);
    fillRect(37, 73, 41, 78, T.BUILDING_BLUE);
    fillRect(43, 73, 47, 78, T.BUILDING_RED);

    // ── Top area: some scattered structures ──
    fillRect(1, 13, 5, 17, T.BUILDING_RED);
    fillRect(1, 19, 5, 23, T.BUILDING_BLUE);
    fillRect(1, 28, 5, 33, T.BUILDING_OFFICE);
    fillRect(1, 35, 6, 38, T.BUILDING_SHOP);
    fillRect(1, 43, 6, 48, T.BUILDING_GRAY);
    fillRect(1, 50, 6, 53, T.BUILDING_BROWN);
    fillRect(1, 58, 6, 68, T.PARK);
    map[3][60] = T.TREE; map[3][63] = T.TREE; map[3][66] = T.TREE;
    map[5][59] = T.TREE; map[5][64] = T.TREE; map[5][67] = T.TREE;
    fillRect(1, 73, 6, 78, T.BUILDING_TALL);

    // ── Bottom row ──
    fillRect(51, 13, 56, 18, T.BUILDING_SHOP);
    fillRect(51, 20, 56, 23, T.BUILDING_GRAY);
    fillRect(51, 28, 56, 33, T.BUILDING_TALL);
    fillRect(51, 35, 56, 38, T.BUILDING_RED);
    fillRect(51, 43, 58, 53, T.PARK);
    fillRect(53, 45, 55, 50, T.WATER);
    fillRect(51, 58, 56, 63, T.BUILDING_BROWN);
    fillRect(51, 65, 56, 68, T.BUILDING_BLUE);
    fillRect(51, 73, 56, 78, T.BUILDING_RED);

    // ── Left column structures ──
    fillRect(1, 1, 6, 8, T.PARK);
    map[2][3] = T.TREE; map[2][6] = T.TREE;
    map[4][2] = T.TREE; map[4][5] = T.TREE; map[4][7] = T.TREE;
    fillRect(23, 1, 33, 8, T.PARK);
    fillRect(25, 2, 27, 4, T.WATER);
    map[24][2] = T.TREE; map[24][5] = T.TREE; map[24][7] = T.TREE;
    map[30][1] = T.TREE; map[30][4] = T.TREE; map[30][7] = T.TREE;
    fillRect(37, 1, 47, 8, T.BUILDING_GRAY);
    fillRect(38, 2, 40, 4, T.BUILDING_SHOP);
    fillRect(43, 2, 46, 7, T.BUILDING_TALL);
    fillRect(51, 1, 58, 8, T.BUILDING_BROWN);

    return map;
}
