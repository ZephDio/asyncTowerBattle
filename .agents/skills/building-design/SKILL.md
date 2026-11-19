---
name: building-design
description: Read and write the ASCII notation for a building's footprint and star synergy cells (o, s, x grids such as "soos / xssx"), and turn it into GridShape and PatternEffect cells. Use when the user sketches a building's shape or synergy pattern in ASCII, asks to design, add or reshape a building (tower, totem, barrack...), or asks what shape an existing piece has.
---

# Building design notation

The user draws a building's layout as a small ASCII grid. Each character is one grid cell:

| Char | Meaning | Code |
| --- | --- | --- |
| `o` | An active cell of the building: part of its footprint | `GridShape` cells (the recruit's `gridShape`) |
| `s` | A star synergy cell: a cell that the building's pattern checks | `PatternEffect` relative cells (the blueprint's `patternEffect`) |
| `x` | Nothing: filler that keeps the columns aligned | not in the code |

Example, the cowboy brewery:

```
soos
xssx
```

## Reading a drawing

- The drawing is the **player's view**, the piece as written in code. The opponent's copy is its point mirror,
  which `BoardOrientation.Mirrored` produces. Never draw or code it separately.
- **Rows go down the screen, and game coordinates are y-up**: the top row has the highest y and each row
  below is y - 1. Columns go left to right with x + 1. See the y-up note in `AGENTS.md`.
- The drawing doesn't mark the anchor `(0, 0)`. Pick one of the `o` cells as the anchor, usually the main
  building cell (the tower, the part that acts), and write every other cell relative to it:
  `x = column - anchorColumn`, `y = anchorRow - row`.
- A row may be shorter than others; treat missing characters as `x`.

Worked example, the brewery with the anchor on the right `o` (row 0, column 2):

| Char | Row, column | Cell |
| --- | --- | --- |
| `o` | 0, 2 | `(0, 0)` anchor |
| `o` | 0, 1 | `(-1, 0)` |
| `s` | 0, 0 | `(-2, 0)` |
| `s` | 0, 3 | `(1, 0)` |
| `s` | 1, 1 | `(-1, -1)` |
| `s` | 1, 2 | `(0, -1)` |

which is the code in `brewery.ts` and `brewery-blueprint.ts`:

```ts
override gridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: -1, y: 0 })]);

patternEffect = new PatternEffect(
	[new Cell({ x: 1, y: 0 }), new Cell({ x: 0, y: -1 }), new Cell({ x: -1, y: -1 }), new Cell({ x: -2, y: 0 })],
	this.patternCondition.bind(this),
);
```

The drill tower, an L with one star left of the shed, anchored on the tower cell (row 0, column 2):

```
soo
xxo
```

```ts
override gridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: -1, y: 0 }), new Cell({ x: 0, y: -1 })]);

override patternEffect = new PatternEffect([new Cell({ x: -2, y: 0 })], this.patternCondition.bind(this));
```

## Writing a drawing

To show an existing piece in this notation, read its recruit's `gridShape` and its blueprint's `patternEffect`.
Take the bounding box of all the cells, put the highest y on the top row, and fill `o`, `s` and `x`.
Always draw the drawing back from the code after an implementation and show it to the user to confirm.
Also check it in the game with the game-testing skill:
1. `give` the piece and read `ascii army`: the occupied cells must match the `o` cells.
2. `hover_cell` on it and take `screenshot army` to see the image over its footprint and the star cells.

## Implementing a drawn building

- `o` cells go in the recruit's `override gridShape: GridShape` (see `witch-house.ts`, `brewery.ts`,
  `drill-tower.ts`). A single `o` needs no override.
- `s` cells go in the blueprint's `patternEffect = new PatternEffect(cells, condition)`, with the `TSynergy`
  trait on the blueprint and `HTSynergy` on the recruit. The drawing gives only the cells. Ask the user for the
  condition (what must stand on a star cell) if they haven't said.
- The hitbox in the blueprint is relative to the anchor cell's center: give one `STANDARD_CELL_SIZE` square per
  `o` cell at `(x * STANDARD_CELL_SIZE, y * STANDARD_CELL_SIZE)` (see `drill-tower-blueprint.ts`).
- A multi-cell piece takes its battle position from `this.gridShape.getCenterPosition(cell, orientation)` in
  `toAllied`, `toEnemy` and `get position()`. That is the center of the footprint's bounding box, where the
  image is drawn.
- The sprite covers the bounding box of the `o` cells, one image quadrant per cell, and `x` cells inside it stay
  transparent. The `pixel-art-assets` skill covers drawing it.
- Then follow the "Adding a new piece" checklist in `AGENTS.md` (union type, fixtures, resources, retail pool).

## Placeholder sprite

When the user designs a new monument (totem, tower, barrack...) and gives no art ("no resources for now"), don't
borrow another piece's image. Use a flat pink square (`#ff69b4`, 64x64 PNG) at `client/public/resources/<kind>/<piece>.png`
and a `<Kind>Resources` entry sized to the footprint (see `TotemResources.bosquet`). Say it is a placeholder; the
`pixel-art-assets` skill replaces it later.
