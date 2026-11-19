# Rotation removal: process

Spec: `docs/rotation-remove.md`.

Goal: pieces have one fixed shape, the player can no longer rotate a held piece, the opponent board stays a point
mirror of its builder's board (top right becomes bottom left), and every piece is drawn from a single image, the front
view, which is what the player sees today. On the opponent board, the footprint, the pattern and the image are all
mirrored together through the building's orientation.

## How orientation works today

- `Orientable` (`client/src/shared/traits/engine/core/orientable.ts`) stores an angle. Its default is `3π/2` ("down", which
  shows the front view). `GridElement` requires it, so every recruit, battle construct and castle carries one.
- Right-click while holding calls `TTokenDrag.rotate()` (`token-drag.ts:57`), which turns the held token by −π/2. On
  release, `moveRecruit(hooks, position, orientation, grid)` copies that angle onto the recruit.
- The angle rotates three things through `Physic.getProjectionCellsFromOrientation`:
  - the footprint: `GridShape.getVectorialCells / getOccupiedCellsFrom / getCenterPosition /
    getDefaultTilePositionFromGridPosition`, used by `TGrid`, `Inventory`, the token drags and the shop translator;
  - the synergy pattern: `PatternEffect.getRelativeCells(orientation)` and `TSynergy.getRelativeSynergyCell`;
  - the image: `TImageDrawable` picks one of four views through `toDirection`, swaps width and height for side
    views, and rotates single-image pieces (mine, obelisk) by the angle.
- Enemy side: `toEnemy` flips the anchor cell with `BattleGrid.flip` (a point reflection) and passes
  `recruit.orientation + π` (castle dwarf: `− π`). A π rotation is the same as negating every offset.
- `BattleGrid.getRelativeNeighborsInArmy/InBattle` also negate the offsets for the enemy side. Battle pieces that pass
  their own battle orientation (already +π) get flipped twice, so their pattern is not mirrored: windmill, brewery,
  red obelisk, witch house. Anvil and goblin portal pass `recruit.orientation` and are mirrored correctly.
- Orientation that is not board rotation and stays as it is: projectile flight angle (`Orientable` on the six
  `battle-*.ts` projectiles, `path-finder.ts`, `Physic` movement), path tile connections (`TPathShape`,
  `pathShapeVariant`, `PathNetwork`, right-click junction cycling with `cyclePathAt`) and
  `BattleGrid.getRelativeDirection` used by units.

## Target model

- A piece's `gridShape.cells` and `patternEffect.relativeCells` are written in the front-facing frame: today's default
  orientation `3π/2`, which the front-view art matches. The cells in the code today are written for orientation 0, so
  they are rewritten once, turned by `3π/2` (`(x, y) → (y, −x)`). This keeps today's gameplay. Recruits (shop, army
  grid, inventory, held token) always use the cells as written.
- The angle is replaced by a board orientation with two values:

  ```ts
  export type BoardOrientation = "normal" | "mirrored";
  ```

  `GridElement` carries `orientation: BoardOrientation = "normal"`. Only enemy battle pieces are built `"mirrored"`.
- The building's orientation is the only place the mirror happens:
  - footprint: `gridShape.getOccupiedCellsFrom(cell, orientation)` negates the cells when mirrored;
  - pattern: `patternEffect.getRelativeCells(orientation)` negates the cells when mirrored;
  - image: drawn rotated by π when mirrored, around the footprint's centre, so the art follows the footprint,
    including an L-shaped monument;
  - `BattleGrid.getRelativeNeighborsInArmy/InBattle` stop negating for the enemy, which fixes the double flip.
- Example: the allied brewery checks its sides and the cells below it. The enemy brewery checks its sides and the cells
  above it.
- The projectile angle keeps using the current `Orientable` trait, which is no longer used by grid elements.

## Piece composition

Every piece is rewritten to what the player sees today (cells turned by `3π/2`), except the obelisk, which becomes
vertical.

| Piece | Footprint | Pattern | Art (`<piece>.png`) |
| --- | --- | --- | --- |
| Brewery | horizontal, `(0,0) (-1,0)` (was `(0,-1)`) | `(1,0) (0,-1) (-1,-1) (-2,0)`: both ends and below | front view, horizontal (750×450) |
| Witch house | vertical, `(0,0) (0,1)` (was `(-1,0)`) | `(1,0) (-1,0) (0,-1)`: both sides and below | front view, vertical (380×780) |
| Red obelisk | vertical, `(0,0) (0,1)`, kept as written (horizontal today) | kept as written: both sides and above | `obelisk.png`, no longer rotated |
| Mine | 1 cell | `(1,0)` (was `(0,1)`): the cell on the right | `mine.png` |
| Anvil | 1 cell | `(0,-1) (0,1)` (was `(±1,0)`): above and below | front view |
| Windmill, goblin portal | 1 cell | symmetric, no change | front view |

The red obelisk's footprint and pattern stay as written, so they turn together compared to today (horizontal, with the
pattern above, below and at the right end). The obelisk image is square (1600×1600), stretched to a 4×10 size, and was
drawn rotated. Check that it looks right drawn upright.

## Steps

Each step should end with `pnpm typecheck` and `pnpm exec jest` green, and be one commit.

### 1. Remove the rotate input

- `client/src/control/translators/shop-input-translator.ts:181`: delete the "holding → rotate" branch of
  `handleMouseRightClick`. Right-click while holding does nothing; right-click on a placed path tile still cycles it.
- `client/src/engine/shop/holder/token-drag/token-drag.ts`: delete `rotate()`.
- From here every piece keeps the default orientation, so the game already plays with fixed shapes.

### 2. Introduce `BoardOrientation` on grid elements

- New `client/src/shared/traits/engine/core/board-orientation.ts`: the `BoardOrientation` type and a `TBoardOriented` trait
  (`orientation: BoardOrientation = "normal"`, plus `get mirrored()`). It replaces `Orientable` in `GridElement`.
- `GridShape` (`grid-element.ts`): `getVectorialCells(orientation)`, `getOccupiedCellsFrom(cell, orientation)`,
  `getCenterPosition(cell, orientation)` take a `BoardOrientation` and negate the cells when mirrored.
  `getDefaultTilePositionFromGridPosition(position)` loses its angle (= `position − defaultVector`), because it is
  only used on recruits.
- `PatternEffect.getRelativeCells(orientation: BoardOrientation)`, and the same for `TSynergy.getRelativeSynergyCell`.
- `Physic`: delete `getProjectionCellsFromOrientation` and `getPositionFromPositionAndVectorAndOrientation`.
- `TGrid` (`tgrid.ts`): `validateGridElementPlacement(element, cell)` checks the shape as written; `setElement`,
  `deleteElement` and `translate` use `element.orientation`.
- `Inventory.getNextValidPosition` (`unit-inventory.ts:25`) uses the shape as written.
- `shop-input-translator.ts:93,106,110,132`: no angle; hover shows the shape and pattern as written.
- In this step every element is `"normal"`, so the enemy side is still mirrored by the `+π` code until step 4. Keep
  both working by making the enemy battle constructors take `"mirrored"` here already (see step 4), or do steps 2
  to 4 as one commit.

### 3. Remove the angle from the recruit and shop layer

- `TRecruit.moveRecruit(hooks, gridPosition, grid?)` (`recruit.ts`) and every implementation: `barrack.ts`,
  `tower.ts`, `totem.ts`, `tile.ts`, `trap.ts`, `unit.ts`. Delete their `setOrientation` calls.
- `TTokenDrag`: drop `Orientable` and the `orientation` prop; `getProjectionCells` without the angle.
- `buyable-token-drag.ts`, `army-recruit-token-drag.ts`: stop passing `orientation`.
- `Holder.orientation` (`holder.ts:32`): delete.

### 4. Battle layer: mirror through the building's orientation

- `toAllied` builds `"normal"`, `toEnemy` builds `"mirrored"` (anchor still flipped with `BattleGrid.flip`):
  - towers: `blue-tower`, `frost-tower`, `windmill-turret`, `zapping-tower`, `witch-house`;
  - totems: `anvil`, `backery`, `brewery`, `crops-field`, `gobelin-portal`, `mine`, `obelisk`, `powder-magazine`,
    `windmill`;
  - barracks: `basic-barrack`, `veterant-barrack`, `wave-barrack`;
  - castles: `dwarf-castle`, `elf-castle`.
- Battle constructors take `orientation: BoardOrientation` instead of the angle (`override _orientation`,
  `orientation` prop, `setOrientation`): all `battle-*` files under `tower/battle`, `totem/battle`, `barrack/battle`,
  plus `battle-dwarf-castle.ts`, `battle-elf-castle.ts`, and the `BattleTower` props (`battle-tower.ts:31`). Remove
  `Orientable` from `BattleTower`, `BattleTotem`, `BattleBarrack` and the castle trait (`castle/battle/index.ts`).
- Pattern lookups use the battle piece's own orientation: `battle-windmill.ts:36`, `battle-brewery.ts:42`,
  `battle-red-obelisk.ts:44`, `battle-witch-house.ts:40`, and switch `battle-anvil.ts:31` and
  `battle-gobelin-portal.ts:26` from `recruit.orientation` to `this.orientation`.
- `BattleGrid.getRelativeNeighborsInArmy/InBattle` (`battle-grid.ts:73,87`): remove the `isEnemy` negation, then the
  `isEnemy` parameter and the per-side wrappers in `getAlliedHooks/getEnemyHooks` if nothing else needs them.
- Battle positions: `battle-totem.ts:17`, `brewery.ts`, `obelisk.ts`, `witch-house.ts` pass the orientation to
  `getCenterPosition`.
- Add `client/src/shared/traits/engine/core/grid-shape.spec.ts`: a mirrored 2-cell footprint occupies the flipped cells, and
  a mirrored pattern with a top-right cell targets the bottom-left neighbour, both through `BattleGrid`.

### 5. Piece composition

- Apply the "Piece composition" table:
  - footprints: `brewery.ts`, `witch-house.ts`;
  - patterns: `brewery-blueprint.ts`, `witch-house-blueprint.ts`, `mine-blueprint.ts`, `anvil-blueprint.ts`.
- Re-read the red obelisk description and adjust it if it names a direction.
- This step must land together with step 2. Once the default angle is gone, the old cells are read unturned.

### 6. Clean `Orientable`

- `orientable.ts` keeps only the angle for projectiles; delete `Direction`, `toDirection`, `direction` and
  `orientable.spec.ts`.
- `grep -rn "orientation\|Orientable" src` should only hit projectiles, `path-finder.ts`, `physic.ts` movement and
  the new `BoardOrientation` code.

### 7. Single-image rendering

- `image-drawable.ts`: delete `HTMLImageElementAsset`, `VIEW_BY_DIRECTION`, `getView`, `getProportion`.
  `TImageDrawable(image: HTMLImageElement, size, priority)`. `draw` uses `drawable.size` and rotates by π when the
  element is `TBoardOriented` and mirrored, by the angle when it is `Orientable` (projectiles), and not otherwise.
  Keep the `TImageVariant` branch for path tiles.
- The image of a multi-cell piece must be centred on its footprint (`getCenterPosition`) so the π rotation lands on
  the mirrored cells. Check the draw position of the brewery, witch house and obelisk on both sides.
- `unit-preview.ts:20`: use `recruit.drawable.image`.
- Resources: `createViews(folder)` becomes a single `createImage(`${folder}.png`)` (or one path per piece) in
  `tower.resources.ts`, `barrack.resources.ts` and `totem.resources.ts`. Drop `HTMLImageElementAsset` from
  `ShapedResource` / `Resource`.
- Castles (`castle.resources.ts`) keep their front view, which was already their only real view.
- The sizes in the resources were written for the front view, so they stay as they are.
- Run the game and check the shop, the inventory, the held token and both battle halves.

### 8. Assets

- For every piece with four views, copy `front-view.png` to `<piece>.png` next to its folder, e.g.
  `client/public/resources/towers/blue.png`, `client/public/resources/house/red.png`, `client/public/resources/totem/anvil.png`. Keep the
  folders and the other views.
- `mine.png` and `obelisk.png` stay as they are.

### 9. Opponent armies

- `client/src/engine/match-maker/local-match-maker.ts`: the cells are rewritten to keep today's gameplay, so only the
  obelisk can change. Check that any hard-coded obelisk still fits the grid now that it is vertical, and that the
  round 6 witch house is unchanged.

### 10. Docs and tooling

- `AGENTS.md`: replace "The enemy version is flipped with `BattleGrid.flip` and rotated by π" with the board
  orientation description, and drop the four-orientation wording.
- `.agents/skills/pixel-art-assets`: it produces four orientation views and wires them into the resources; change it
  to a single front-view `<piece>.png`.

### 11. Final check

- `pnpm typecheck`, `pnpm exec jest`, `pnpm format`.
- Manual: buy and place the brewery, obelisk and witch house, drag them inside the grid and to the inventory, hover
  them to see their synergy cells, right-click while holding (nothing happens), right-click a path junction (cycles).
  Start a battle and check that the enemy pieces are drawn rotated by π on their mirrored cells, and that the enemy
  brewery checks its sides and above.

## Decisions

1. The front view (today's default facing) is the single view. Cells are rewritten to keep today's gameplay.
2. Brewery is horizontal, witch house and obelisk are vertical (only the obelisk changes compared to today).
3. Unused views are kept; the front view is copied as `<piece>.png`.
4. Castles keep their front view.
5. Patterns are mirrored on the enemy side, driven by the building's orientation.
6. Enemy art is rotated by π with its footprint, which also works for an L-shaped monument.

7. The vertical obelisk checks both sides and above, as written.
8. The old `client/public/resources/totem/brewery.png` was removed, so `brewery.png` is free for the front view.
