# Map Wanderer

An isometric city exploration game built with Vite and vanilla JavaScript. Walk around a GTA-style scrolling city with buildings, parks, water, and landmarks.

## Getting Started

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

Arrow keys or WASD to move. Choose your character (man or woman) on the start screen.

## Project Structure

| File | Purpose |
|------|---------|
| `src/tiles.js` | Tile type constants, collision set, isometric math |
| `src/assets.js` | Generates all tile textures and player sprites |
| `src/map.js` | 80×60 tile grid city layout |
| `src/player.js` | Player movement, collision, rendering |
| `src/camera.js` | Camera following in isometric space |
| `src/main.js` | Game loop, character selection, HUD, minimap |

## Creating SVG Building Assets

Buildings are rendered as isometric tiles. The game uses a **2:1 isometric projection** with these core dimensions:

| Property | Value | Notes |
|----------|-------|-------|
| `TILE_W` | 64 px | Diamond width |
| `TILE_H` | 32 px | Diamond height |
| Half-width (`HW`) | 32 px | Used for face geometry |
| Half-height (`HH`) | 16 px | Used for face geometry |

### SVG canvas size

For a building of height `h` pixels:

- **Width**: `TILE_W + extraW` — use `extraW` (e.g. 30–40) if the building has details (domes, antennas) that extend beyond the standard diamond footprint. Otherwise use `TILE_W` (64).
- **Height**: `TILE_H + h + topPadding` — add top padding (e.g. 30–40) for rooftop elements that project above the main box.

The center point `cx = canvasWidth / 2`, and the ground diamond center sits at `cy = canvasHeight - HH`.

### Isometric face geometry

Every building needs three faces defined as SVG `<polygon>` elements:

```
Left face:   cx-HW,cy  →  cx,cy+HH  →  cx,cy+HH-h  →  cx-HW,cy-h
Right face:  cx+HW,cy  →  cx,cy+HH  →  cx,cy+HH-h  →  cx+HW,cy-h
Top face:    cx,cy-HH-h  →  cx+HW,cy-h  →  cx,cy+HH-h  →  cx-HW,cy-h
```

Where `HW=32`, `HH=16`, and `h` is the building height in pixels.

### Style guidelines

- Use **linear gradients** on the faces for a 3D look (lighter on left, darker on right).
- The **top face** should be distinct (rooftop color, helipad, AC units, etc.).
- Add **windows** as small `<rect>` elements along the steel-frame grid lines.
- Add **reflections** using semi-transparent overlays (`rgba` fills with low opacity).
- Keep stroke widths thin (0.3–1.2 px) — these are small tiles.
- The SVG background must be **transparent** (no background rect).

### Return format

The function should return: `{ canvas, offsetY, extraW }`

- `canvas` — an offscreen `<canvas>` with the rasterized SVG drawn on it.
- `offsetY` — `h + topPadding` (how far above the ground diamond the top of the canvas sits).
- `extraW` — how much wider than `TILE_W` the canvas is (0 if standard width).

### Sample GenAI prompt for creating a building SVG

> Create an inline SVG string for an isometric building tile for a 2D game.
>
> **Projection**: 2:1 isometric. Diamond base is 64 px wide × 32 px tall. Half-width (HW) = 32, half-height (HH) = 16.
>
> **Canvas**: width = 94 px (64 + 30 extraW), height = 172 px (32 + 110 height + 30 top padding). Center X (cx) = 47, ground diamond center Y (cy) = 156.
>
> **Three faces as `<polygon>` elements**:
> - Left face: points="15,156 47,172 47,62 15,46" with a blue glass gradient
> - Right face: points="79,156 47,172 47,62 79,46" with a darker blue glass gradient
> - Top face: points="47,30 79,46 47,62 15,46" with a light gray gradient
>
> **Style**: Modern glass office tower. Add steel-frame grid lines (thin strokes), glass panel reflections (semi-transparent rects), rooftop structures (small rects for AC units), and a glass entrance at the bottom of the left face. Use SVG `<defs>` for `<linearGradient>` elements. All backgrounds must be transparent. Keep it clean and detailed but within a small pixel space.

## Adding a New Building to the Game

There are two approaches: **inline** (SVG generated in code) or **file-based** (SVG file in the assets directory).

### Option A: File-based SVG (recommended)

This loads an SVG from `public/assets/buildings/`. The directory layout:

```
public/
  assets/
    buildings/
      modern-tower.svg    ← sample building
      my-building.svg     ← add your files here
```

#### 1. Create the SVG file

Save your SVG to `public/assets/buildings/my-building.svg`. See the **SVG spec** section above for dimensions and geometry. A working example is included at `public/assets/buildings/modern-tower.svg`.

#### 2. Register the tile type

In `src/tiles.js`:

```js
// Add to the TILE enum (use the next available ID)
BUILDING_MYTYPE: 23,

// Add to SOLID_TILES if it blocks the player
TILE.BUILDING_MYTYPE,

// Add to TILE_HEIGHT (pixels above ground)
[TILE.BUILDING_MYTYPE]: 80,
```

#### 3. Load the SVG in the texture generator

In `src/assets.js`, inside `generateTileTextures()`, before the return:

```js
textures[TILE.BUILDING_MYTYPE] = await loadSvgTile(
    '/assets/buildings/my-building.svg',
    100, // offsetY = height + top padding in the SVG
    36   // extraW (0 if SVG width == TILE_W)
);
```

The `loadSvgTile(url, offsetY, extraW)` function handles fetching, rasterizing to canvas, and returning the `{ canvas, offsetY, extraW }` object.

#### 4. Place it on the map

In `src/map.js`:

```js
// fillRect(startRow, startCol, endRow, endCol, tileType)
fillRect(11, 28, 14, 32, T.BUILDING_MYTYPE);
```

#### 5. Add a minimap color

In `src/main.js`, add to `tileColors` in `buildMiniMap()`:

```js
23: '#yourColor',
```

### Option B: Inline SVG (generated in code)

In `src/assets.js`, add a function that builds an SVG template string, converts it to a blob URL, loads it into an Image, draws it onto a canvas, and returns `{ canvas, offsetY, extraW }`. See `makeOfficeTile()` for a full example. Then register and place the tile the same way as Option A (steps 2, 4, 5).

```js
const myH = TILE_HEIGHT[TILE.BUILDING_MYTYPE];
textures[TILE.BUILDING_MYTYPE] = await makeMyBuildingTile(myH);
```

---

The two-pass renderer automatically handles depth sorting and elevated tile rendering for any tile with a non-zero `offsetY`.
