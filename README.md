# Map Wanderer

An isometric city exploration game built with Vite and vanilla JavaScript. Walk around a GTA-style scrolling city with buildings, parks, water, and landmarks.

## Getting Started

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

Arrow keys or WASD to move. Choose your character on the start screen (6 characters available: Classic Man, Classic Woman, Explorer, Artist, Gentleman, Chic).

## Project Structure

| File | Purpose |
|------|---------|
| `src/tiles.js` | Tile type constants, collision set, isometric math |
| `src/assets.js` | Generates all tile textures and player sprites |
| `src/map.js` | 80×60 tile grid city layout |
| `src/player.js` | Player movement, collision, rendering |
| `src/camera.js` | Camera following in isometric space |
| `src/main.js` | Game loop, character selection, HUD, minimap |

---

## Creating SVG Character Sprites

Character sprites are stored in `public/assets/characters/` and loaded at runtime via `generatePlayerSprites(id)`. Each file is a **single SVG sprite sheet** — 128 × 192 px, 4 columns (walk frames) × 4 rows (directions), 32 × 48 px per cell.

See **[docs/character-sprite-guide.md](docs/character-sprite-guide.md)** for the full reference: sprite sheet layout, body part coordinates, walk cycle, directional variants, SVG structure template, skin colour table, GenAI prompt, and integration steps.

### Quick integration

1. Save your SVG to `public/assets/characters/my-character.svg`.
2. Add an entry to the `CHARACTERS` array in `src/main.js`:
   ```js
   { id: 'my-character', label: 'My Name', style: 'Style' },
   ```
   The `id` must match the filename (without `.svg`). The selection screen scales automatically.

---

## Creating SVG Building Assets

Buildings are isometric SVG tiles. The game uses a **2:1 isometric projection** (TILE_W=64, TILE_H=32).

See **[docs/building-asset-guide.md](docs/building-asset-guide.md)** for the full reference: canvas sizing, isometric face geometry, style guidelines, return format, and a ready-to-use GenAI prompt.

### Quick integration

#### 1. Register the tile type — `src/tiles.js`
```js
BUILDING_MYTYPE: 24,          // add to TILE enum
TILE.BUILDING_MYTYPE,         // add to SOLID_TILES
[TILE.BUILDING_MYTYPE]: 80,   // add to TILE_HEIGHT
```

#### 2. Load the SVG — `src/assets.js` inside `generateTileTextures()`
```js
textures[TILE.BUILDING_MYTYPE] = await loadSvgTile(
    '/assets/buildings/my-building.svg',
    100,               // offsetY = h + topPadding
    36,                // extraW (0 if SVG width == TILE_W)
    { cols: 2, rows: 2 } // omit for 1×1
);
```

#### 3. Place on the map — `src/map.js`
```js
placeBuilding(26, 49, 2, 2, T.BUILDING_MYTYPE); // multi-tile
fillRect(11, 28, 14, 32, T.BUILDING_MYTYPE);    // 1×1
```

#### 4. Add minimap colour — `src/main.js` in `buildMiniMap()`
```js
24: '#yourColor',
```

### Multi-tile buildings

`placeBuilding(row, col, rows, cols, tile)` fills the footprint with `TILE.OCCUPIED` and places the anchor at the bottom-right corner. Register the footprint in `TILE_FOOTPRINT` in `src/tiles.js`:
```js
export const TILE_FOOTPRINT = {
    [TILE.BUILDING_MODERN]: { cols: 2, rows: 2 },
};
```
