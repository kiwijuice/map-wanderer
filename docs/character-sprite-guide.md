# Creating SVG Character Sprites

Character sprites are stored in `public/assets/characters/` and loaded at runtime via `generatePlayerSprites(id)`. Each file is a **single SVG sprite sheet** encoding all animation frames.

## Sprite sheet layout

The SVG canvas is exactly **128 × 192 px** with `viewBox="0 0 128 192"`. It is divided into a **4 × 4 grid** of 32 × 48 px cells:

```
         frame 0    frame 1    frame 2    frame 3
         (stand)    (step A)   (stand)    (step B)
         ─────────────────────────────────────────
dir 0    (0,0)      (32,0)     (64,0)     (96,0)      ← facing down-right
dir 1    (0,48)     (32,48)    (64,48)    (96,48)     ← facing down-left
dir 2    (0,96)     (32,96)    (64,96)    (96,96)     ← facing up-left  (back)
dir 3    (0,144)    (32,144)   (64,144)   (96,144)    ← facing up-right (back)
```

Each **cell** is 32 px wide × 48 px tall. The character occupies that cell locally with the origin at the cell's top-left corner. All coordinates below are **relative to each cell's (0, 0)**.

## Anatomy of a single cell (32 × 48 px)

```
 0 ┌────────────────────────────────┐
   │      ╭──────────╮             │ ← hair / hat top
 4 │   ╔══╡  head    ╞══╗          │
   │   ║  │  8–9 r   │  ║  ← hair │
10 │   ║  ╰──────────╯  ║          │ ← top hair / eyebrows  (y ≈ 10)
   │       face area               │
14 │       eyes          (y ≈ 13)  │
17 │       mouth         (y ≈ 17)  │
19 │   ╔══════════════╗            │ ← shoulders (y ≈ 19–20)
   │   ║   torso      ║            │
   ║ arm ║           ║ arm ║       │
26 │   ╠══════════════╣            │ ← waist / belt (y ≈ 25–27)
   │   ║ skirt/pants  ║            │
32 │   ╚══════════════╝            │ ← end of torso/skirt (y ≈ 32–34)
   │      legs                     │
38 │      thighs       (y ≈ 34–38) │
   │      feet/shoes  (y ≈ 39–43)  │
48 └────────────────────────────────┘
```

| Body part | Center X | Y range | Typical size |
|-----------|----------|---------|--------------|
| Head (ellipse) | 16 | 5 – 22 | rx 7–9, ry 8–10 |
| Hair | 16 | 3 – 12 | covers top of head |
| Eyes | dir 0: approx 15 & 21 / dir 1: approx 11 & 17 | 12–15 | rx 1–2.5, ry 1–2.5 |
| Torso | 9–23 | 20–32 | 14 px wide |
| Arms (2 sides) | 5–8 left / 23–26 right | 21–31 | 3.5–4.5 px wide |
| Legs (2) | 11–14 left / 17–20 right | 32–40 | 3–4 px wide |
| Shoes/feet | 10–15 left / 16–21 right | 39–44 | 4–5 px wide |

## Shadow

Every cell should include a ground shadow. Place it **inside a shared `<g id="sh">` in `<defs>`** and reuse with `<use href="#sh"/>`:

```xml
<g id="sh">
  <ellipse cx="16" cy="44" rx="10" ry="4" fill="rgba(0,0,0,.2)"/>
</g>
```

## Walk cycle (legs only)

The 4 frames simulate a two-beat walk cycle using a simple `legOffset`:

| Frame | legOffset | bobY | Description |
|-------|-----------|------|-------------|
| 0 | 0 | 0 | standing, neutral |
| 1 | +3 | −1 | right leg forward |
| 2 | 0 | 0 | standing, neutral |
| 3 | −3 | −1 | left leg forward |

Apply `legOffset` to the **height** of the legs (add to one, subtract from the other). Apply `bobY` as a vertical shift to the **entire upper body and head**.

```
Left leg height:  8 + legOffset   → left shoe y: 39 + legOffset + bobY
Right leg height: 8 − legOffset   → right shoe y: 39 − legOffset + bobY
```

## Directional variants

| Dir | Description | Visible face | Arms shown | Eyes |
|-----|-------------|--------------|------------|------|
| 0 | Down-right (front) | Full front | Both | Shifted right (x ≈ 15, 21) |
| 1 | Down-left (front) | Full front | Both | Shifted left (x ≈ 11, 17) |
| 2 | Up-left (back) | Back only | One (inner) | Hidden |
| 3 | Up-right (back) | Back only | One (inner) | Hidden |

For back views (dir 2 / 3), draw the full back of the head and hair cascading down. Cover the face entirely. Show only one arm (inner side of the turn).

## SVG structure (recommended pattern)

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="192" viewBox="0 0 128 192">
<defs>
  <!-- Gradients for clothes -->
  <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#COLOR_LIGHT"/>
    <stop offset="100%" stop-color="#COLOR_DARK"/>
  </linearGradient>

  <!-- Reusable shadow -->
  <g id="sh"><ellipse cx="16" cy="44" rx="10" ry="4" fill="rgba(0,0,0,.2)"/></g>

  <!-- Upper body per direction (front face details differ, back hides face) -->
  <g id="u0"> <!-- dir 0: down-right — eyes right, both arms --> </g>
  <g id="u1"> <!-- dir 1: down-left — eyes left, both arms  --> </g>
  <g id="u2"> <!-- dir 2: up-left   — full back hair, one arm (left)  --> </g>
  <g id="u3"> <!-- dir 3: up-right  — full back hair, one arm (right) --> </g>

  <!-- Leg sets (shared across all 4 directions) -->
  <g id="ln"> <!-- neutral: legs even  --> </g>
  <g id="lr"> <!-- stride right: left leg +3, right leg −3 --> </g>
  <g id="ll"> <!-- stride left:  left leg −3, right leg +3 --> </g>
</defs>

<!-- Dir 0 frames (y offset = 0) -->
<g transform="translate(0,0)">  <use href="#sh"/><use href="#u0"/><use href="#ln"/></g>
<g transform="translate(32,0)"> <use href="#sh"/><g transform="translate(0,-1)"><use href="#u0"/><use href="#lr"/></g></g>
<g transform="translate(64,0)"> <use href="#sh"/><use href="#u0"/><use href="#ln"/></g>
<g transform="translate(96,0)"> <use href="#sh"/><g transform="translate(0,-1)"><use href="#u0"/><use href="#ll"/></g></g>

<!-- Dir 1 frames (y offset = 48) -->
<g transform="translate(0,48)">  <use href="#sh"/><use href="#u1"/><use href="#ln"/></g>
<!-- ... repeat for (32,48), (64,48), (96,48) -->

<!-- Dir 2 frames (y offset = 96) -->
<!-- ... repeat same pattern for each dir row -->

<!-- Dir 3 frames (y offset = 144) -->
<!-- ... -->
</svg>
```

## Skin colour & white skin

For white/fair skin use these values:

| Part | Fill |
|------|------|
| Face & body skin | `#fae3d0` or `#fce4d4` |
| Darker shadow (jaw, inner arm) | `#e8c8b0` |
| Blush/cheeks | `#f8c0b0` at 20–35% opacity |

## Sample GenAI prompt for a character SVG

> Create an SVG sprite sheet for a 2D isometric game character.
>
> **Canvas**: 128 × 192 px, `viewBox="0 0 128 192"`, transparent background.
>
> **Layout**: 4 columns × 4 rows of 32 × 48 px cells. Each column is a walk frame (0 = stand, 1 = step A, 2 = stand, 3 = step B). Each row is a viewing direction:
> - Row 0 (y=0):   facing down-right (dir 0) — front, eyes shifted right
> - Row 1 (y=48):  facing down-left  (dir 1) — front, eyes shifted left
> - Row 2 (y=96):  facing up-left    (dir 2) — back view, full back hair, one arm
> - Row 3 (y=144): facing up-right   (dir 3) — back view, full back hair, one arm
>
> **Character**: [describe your character here — gender, outfit, hair color, style]
>
> **Skin tone**: fair/white skin (`#fae3d0`).
>
> **Body proportions per 32 × 48 cell** (all coordinates local to the cell):
> - Head: ellipse cx=16, cy=13–14, rx=7–9, ry=8–10
> - Torso/outfit: x=9 to x=23, y=20 to y=32
> - Arms: left x=5–8, right x=23–26, y=21–31
> - Legs: left x=11–14, right x=17–20, y=32–40
> - Shoes: left x=10–15, right x=16–21, y=39–43
>
> **Walk cycle**: frames 1 and 3 shift the whole upper body 1 px up (bobY=−1). Left leg height = 8 + legOffset, right = 8 − legOffset, where legOffset = +3 for frame 1 and −3 for frame 3.
>
> **Structure**: Use `<defs>` to define `<linearGradient>` elements for clothing and 4 `<g id="u0/u1/u2/u3">` upper-body variants (front faces differ by eye position; back faces show full back-of-head hair only). Define 3 leg sets `<g id="ln/lr/ll">` for neutral, stride-right, stride-left. Compose every frame using `<g transform="translate(col*32, row*48)"><use href="#sh"/><use href="#uN"/><use href="#l*"/></g>`.
>
> **Style**: [soft cartoon / elegant minimal / realistic pixel / etc.]

## Adding a new character to the game

1. **Save** the SVG to `public/assets/characters/my-character.svg`.

2. **Register** it in the `CHARACTERS` array in `src/main.js`:
   ```js
   { id: 'my-character', label: 'My Name', style: 'Style' },
   ```
   The `id` must exactly match the filename (without `.svg`). No other code changes are required — the boot sequence and selection screen scale automatically.
