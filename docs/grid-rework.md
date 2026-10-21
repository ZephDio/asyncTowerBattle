# Grid Rework Initiative

Branch: `gridrework` (started 2026-10-21)

## Why

The grid feels too small. Constructs are almost all 1×1, so shape plays no real role in the game. The goal is to make **construct shapes a core mechanic**. Placing an L-, T- or square-shaped construct on a bigger grid should be an interesting puzzle, and shapes should interact with synergies and the path.

## Phases

1. **Bigger default grid.** Increase the size of the army grid and make sure everything that depends on its size still works.
2. **Bigger, shaped constructs.** Move constructs from 1×1 to multi-cell shapes (square, L, T, I, etc.) and make shape a first-class part of their design.
3. **Configurable path.** Rework the path so it is more configurable: endpoints, layout and how the player edits it.

Do the phases in order. Each phase should leave the game playable.

---

## Current state (reference)

### Grid
- `ArmyGrid` (`src/engine/grid/grid.ts`) defaults to 13×6. Its screen position comes from `PercentToReal({ x: 35, y: 28 })`.
- `STANDARD_CELL_SIZE = 4.9` (`src/engine/grid/tgrid.ts`) is the cell size in grid space. `cellSize` is a separate screen scale, so `screenToGridPosition` and `gridToScreenPosition` scale by `cellSize / STANDARD_CELL_SIZE`.
- The grid grows during a run. `RoundsTracker` (`src/engine/rounds/tracker.ts`) calls `grid.roundOne/Two/Three`, which set the size by hand (8×6 in round 2, 11 wide in round 3) and add path tiles to extend the path.
- Grid sizes are hard-coded in many fixtures: `src/engine/army/army-fixtures.ts`, and each enemy round in `src/engine/match-maker/local-match-maker.ts` (7×5, 8×6, 11×6).
- `BattleGrid.fromArmyGrids` (`src/engine/grid/battle-grid.ts`) requires the allied and enemy grids to have **identical** width and height. It stacks them vertically, and `BattleGrid.flip` mirrors the enemy side.
- Fixed anchor cells: the castle sits at `(0, height-1)` (`getCastleCell`) and the enemy door at `(width-1, height-1)` (`getEnemyDoorCell`).
- `Battle.init` and `Game.handleSummaryQuit` animate the grid to hard-coded screen percentages.

### Construct shapes
- `GridShape` (`src/shared/traits/engine/core/grid-element.ts`) is a list of relative cells, rotated with `Physic.getProjectionCellsFromOrientation` (90° steps via `Math.round`). Its default is a single `(0,0)` cell.
- Only 3 constructs override it, all with 2 cells: `brewery` (vertical), `obelisk` (vertical) and `witch-house` (horizontal).
- The shape lives on the **recruit** (`override gridShape = ...`). `BattleTower` copies it from the recruit.
- Hitboxes and images are sized separately on the **blueprint** (e.g. `Rectangle({ width: 4, height: 6 })`, `TImageDrawable(..., size, ...)`). They are not derived from the shape.
- Placement validation is `grid.validateGridElementPlacement(element, cell, orientation)`. Hover projection is `hold.getProjectionCells`. Synergy patterns use `patternEffect.getRelativeCells(orientation)`.

### Path
- Path tiles are 1×1 `PathTile` recruits (basic, slowing, trap) in `src/engine/tile/`.
- `Army.path` (`src/engine/army/army.ts`) chains tiles from `getEnemyDoorCell()` to `castle.cell.down()` with `BattlePath.chainTiles` (`src/engine/path/battle/battle-path.ts`). This is a greedy walk over adjacent tiles, memoized by `@MemorizePath`, and it throws if the chain breaks.
- Path layouts are hard-coded cell lists in `src/engine/path/army/path-fixtures.ts` and in the `grid.roundX` methods.
- `BattlePath.toEnemy` flips cells. The battle path is `[enemyCastle, ...tiles, alliedCastle]`.

---

## Phase 1: Bigger default grid

Goal: one larger default grid size that drives everything else, with no size hard-coded across the codebase.

- [x] Choose the target default size and on-screen scale: 8×6 → 9×7 → 13×7, with every board drawn 30 units tall.
- [x] Put grid dimensions in a single source: `src/engine/grid/grid-sizes.ts` (`ARMY_GRID_SIZES`, `fitCellSize`). `ArmyGrid`, `ArmyFactory`, the match-maker boards, castle cells and environment ranges all read from it.
- [x] Keep per-round growth with the scaled sizes. `ArmyGrid.resize(size)` sets width, height and cell size together.
- [x] `BattleGrid` fits: allied + enemy height = 60 units, the same as round 1 before. The battle translate animation (`y: 25.5`) is now exact for every round.
- [x] Update the enemy boards: grid sizes, castle cells (`(0, height-1)`) and the `PathFactory` layouts. The existing tower, barrack and totem positions are unchanged, and none of them overlap the new paths.
- [ ] Check the shop layout in the browser: retail grid, inventory, HUD positions and description HUD. The round 3+ board is 55.7 wide (was 53.9).
- [ ] Check placement, hover, synergy highlights and drag and drop on the bigger grid in the browser.
- [ ] Clean up the stale, unused fixtures: `ArmyFixture.pacifist/allied/enemy`, `GridFixture` and `PathFixture` still use old sizes.

## Phase 2: Bigger, shaped constructs

Goal: constructs occupy multi-cell shapes, and shape is a design lever.

- [ ] Add a shape catalog (e.g. `GridShape.square(2)`, `GridShape.L()`, `GridShape.T()`, `I(n)` ...) so constructs don't spell out cell lists by hand.
- [ ] Decide where the shape belongs. It is on the recruit today, but the blueprint is the definition and the shop needs it, so the blueprint is probably the right place.
- [ ] Derive the image size and hitbox from the shape, or validate them against it, so the visuals match the occupied cells.
- [ ] Check rotation for non-symmetric shapes (L, T): the rotation pivot, `defaultVector` and `getDefaultTilePositionFromGridPosition`, and the drag-and-drop projection.
- [ ] Check the retail grid and inventory: can they hold or display multi-cell constructs?
- [ ] Battle side: targeting and range origin (shape center vs main cell), projectile spawn and `BattleGrid.flip` for multi-cell shapes on the enemy side.
- [ ] Synergy patterns: decide whether they are relative to the main cell or the whole shape's perimeter.
- [ ] Reassign a shape to each existing tower, totem, barrack and castle, and rebalance.

## Phase 3: Configurable path

Goal: the path is no longer a hard-coded cell list from fixed corners.

- [ ] Make the endpoints configurable (door and castle positions), not fixed corners.
- [ ] Replace the greedy `chainTiles` with a proper path validation/finding (BFS) that handles branches and gives clear error feedback.
- [ ] Decide how the player edits the path: buy and place tiles, draw it, or use pre-shaped path pieces.
- [ ] Define path layouts as data instead of the code in `path-fixtures.ts` and `roundX`.
- [ ] Decide how shaped constructs and the path interact: blocking, adjacency bonuses, etc.

---

## Open questions

- Must the allied and enemy grids keep the same size in battle, or can `BattleGrid` support asymmetric sizes?
- Should the shape be on the blueprint or the recruit?
- Do shaped constructs keep a "main cell" for targeting and synergies, or use the shape's center?
- Do we want new art for bigger constructs, or scale the existing sprites?

## Decisions log

- **2026-10-21**: The grid grows by about 20–25% per dimension. Round sizes go 7×5 / 8×6 / 11×6 → **8×6 / 9×7 / 13×7**. Per-round growth stays.
- **2026-10-21**: Boards keep the same on-screen footprint: `cellSize = 30 / height`, so grids are always 30 units tall on screen. Sprites scale with `cellSize / STANDARD_CELL_SIZE`, so constructs look smaller.

- **2026-10-21**: Each grid growth (rounds 2 and 3) adds 3 basic path tiles to the player's reserve (`RoundsTracker.giveGridGrowthPathTiles`). If the reserve is full, it adds only what fits.

## Progress log

- **2026-10-21**: Phase 1 code done. Typecheck passes. A throwaway Jest check confirmed, for rounds 1–6 and both factions: valid paths, no overlaps or out-of-bounds cells, and `BattleGrid.fuse` works. Next: test in the browser, then clean up the stale fixtures.

## Known issues found along the way

- `ArmyGrid.roundThree` calls `generateEnvironmentForRoundTwo` instead of `generateEnvironmentForRoundThree`, so round 3 places 1 rock in the round 2 areas instead of 2 trees and 1 rock in the new columns. This bug predates the rework and is left as is for now.
- Running Jest on files that import the engine needs browser globals (`Image`, `document`) stubbed, `.js` imports mapped, and the app's import order (import `control/input-to-intent-translator` first) to avoid circular-import TDZ errors.
