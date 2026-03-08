# Copilot Instructions — Map Wanderer

## Project overview

Isometric city exploration game built with **Vite 7** and **vanilla JavaScript** (ES modules, no framework). Rendering is done entirely on a single `<canvas>` using the 2D context API. All tile graphics are generated procedurally at startup; character sprites are SVG sprite sheets loaded from `public/assets/characters/`.

## Tech stack

- **Runtime**: Browser, vanilla JS (ES modules), Canvas 2D API
- **Bundler**: Vite (`npm run dev` / `npm run build`)
- **Assets**: Procedural tile textures + SVG sprite sheets (128 × 192 px, 4 × 4 grid of 32 × 48 cells)
- **No dependencies** beyond Vite as a dev dependency

## Architecture

| Module | Responsibility |
|--------|---------------|
| `src/tiles.js` | Tile enum (`TILE`), collision set (`SOLID_TILES`), height map (`TILE_HEIGHT`), footprint map (`TILE_FOOTPRINT`), isometric math (`toScreen`, `toMap`) |
| `src/assets.js` | Procedural tile texture generation (`generateTileTextures`), SVG sprite loading (`generatePlayerSprites`), `loadSvgTile` helper |
| `src/map.js` | 80 × 60 tile grid, `generateMap()` with helper closures (`hRoad`, `vRoad`, `placeBuilding`, `fillRect`) |
| `src/player.js` | `Player` class — movement, collision, sprite animation, rendering |
| `src/camera.js` | `Camera` class — smooth follow in isometric space |
| `src/main.js` | Boot sequence, game loop (`requestAnimationFrame`), character selection UI, HUD, minimap |

### Coordinate systems

Three coordinate spaces are used throughout:

1. **Map** — `(col, row)` integers into the tile grid
2. **World / isometric screen** — `(sx, sy)` pixel positions after `toScreen(col, row)`
3. **Viewport** — `(px, py)` after camera offset

Always convert with `toScreen()` / `toMap()` from `src/tiles.js`. Never hand-roll the isometric transform.

### Rendering pipeline

Two-pass rendering: ground tiles first, then elevated objects + player depth-sorted by row. The game loop uses delta-time for animation (`animTimer`).

## Code style

- **4-space indentation**
- **Semicolons** always
- **Single quotes** for JS strings; double quotes for HTML attributes
- **camelCase** for variables and functions (`animSpeed`, `generateMap`)
- **UPPER_CASE** for constants (`TILE_W`, `MAP_COLS`, `SOLID_TILES`)
- **PascalCase** for classes (`Player`, `Camera`)
- Short measurement abbreviations are idiomatic: `HW` (half-width), `HH` (half-height), `dx`/`dy`, `sx`/`sy`, `cx`/`cy`
- Section comments use em-dash delimiters: `// ── Section Name ──`
- ES module imports are always specific: `import { TILE, TILE_W } from './tiles.js'`

## Key conventions

- **No external image files for tiles** — all tiles are drawn procedurally onto offscreen canvases via `makeTileCanvas(h, drawFn)`.
- **SVG sprite sheets** for characters follow a strict 128 × 192 px layout (see `docs/character-sprite-guide.md`).
- **Building SVGs** follow isometric face geometry conventions (see `docs/building-asset-guide.md`).
- **Adding a new tile type** requires changes in 4 places: `TILE` enum + `SOLID_TILES` + `TILE_HEIGHT` in `tiles.js`, texture in `assets.js`, placement in `map.js`, minimap colour in `main.js`.
- **Adding a new character** only requires the SVG file + one entry in the `CHARACTERS` array in `main.js`.
- **Multi-tile buildings** use `placeBuilding()` which fills with `TILE.OCCUPIED` and anchors at the bottom-right corner.
- **Input**: keyboard state object `keys = {}` supports both Arrow and WASD bindings.

## Do

- Keep modules focused — tiles logic in `tiles.js`, rendering in `assets.js`, layout in `map.js`.
- Use the existing `toScreen()` / `toMap()` helpers for coordinate conversion.
- Use offscreen canvases and `makeTileCanvas()` for new procedural tiles.
- Use `loadSvgTile()` for file-based building SVGs.
- Match existing naming patterns when adding new tile types (e.g., `BUILDING_*`, `ROAD_*`).
- Keep canvas rendering code direct — `ctx.fillStyle`, `ctx.beginPath()`, `ctx.fill()`.

## Don't

- Don't add runtime dependencies — this is a zero-dependency vanilla JS project.
- Don't introduce a framework or component system.
- Don't use external image formats (PNG/JPG) for tiles — generate them procedurally or use SVG.
- Don't bypass the `SOLID_TILES` set for collision — always register solid tiles there.
- Don't hardcode isometric transform math — use `toScreen()` / `toMap()`.
