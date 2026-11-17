# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

The package manager is pnpm. A devenv/direnv shell provides Node 22 and pnpm; `devenv up` runs the Vite server as a process.

- `pnpm start`: start the Vite dev server. It serves `index.html`, which loads `src/index.ts` and draws to a `<canvas>`.
- `pnpm typecheck`: run `tsc --noEmit`. The VS Code task runs it with `--watch`. The tsconfig is strict, including `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` and `noImplicitOverride`.
- `pnpm format`: run the Biome formatter over `src`. It uses tabs, a 120-column line width and double quotes.
- Running the game: the `atb-game` MCP server (`.mcp.json`, `.claude/mcp/server.py`) keeps the game open in headless Chromium from `.claude/playwright.nix` and starts Vite if nothing answers on port 5173. Its tools:
  - `start` begins a seeded game.
  - `state`, `ascii` and `inspect` read the game as JSON or text.
  - `screenshot` captures the page, optionally cropped to a grid.
  - `drag`, `click_cell` and `click_hud` send real mouse events.
  - `give` and `set_gold` set the game up directly.
  - `start_battle` (paused), `step` and `run` control battle ticks.
  - `eval` runs JavaScript in the page.

  The game-testing skill covers using them, including the `.claude/mcp/call.py` fallback for sessions where the tools aren't loaded. The tools call the debug bridge `src/debug/bridge.ts`, which the game installs as `window.__atb` when opened with `?debug`. Add new reads or actions there. `python .claude/mcp/smoke.py OUT_DIR` in that Nix shell plays a round through the tools. For one-off screenshots without the server, use `nix-shell .claude/playwright.nix --run "python .claude/scripts/screenshot.py --help"`.
- `pnpm exec jest` runs the tests and `pnpm exec jest src/shared/hitboxes.spec.ts` runs a single file. There is no test script in `package.json`. Jest uses `@swc/jest`, roots at `src` and matches `*.spec.ts`. There are very few tests.

## Architecture

This is an async auto-battler played in the browser. The player builds an army on a grid during a shop phase. The army then fights an AI-supplied opponent army in an automatic battle. The code has no framework: plain TypeScript classes render to a 2D canvas.

### Top-level loop
- `src/index.ts` wires up `GameWrapper`, `CanvasRenderer`, `InputToIntent` and `MouseEventHandler`.
- `GameWrapper` (`src/engine/wrap.ts`) switches between `MainMenu` and `Game`.
- `Game` (`src/engine/game.ts`) runs the phase cycle `ShopPhase` → `Battle` → `BattleSummary` → shop again. Only one phase field is non-null at a time. The player has 5 lives and loses one per defeat. Opponents come from `LocalMatchMaker`, which keeps hard-coded enemy armies per round in `src/engine/match-maker/`.
- `Battle` ticks the `Battlefield` with `setTimeout` at 32 ticks per second. Battle randomness must go through `BattleRandomSeed` so battles stay deterministic. `src/shared/seconds.ts` converts between seconds, frames and cast speed.
- Rendering is pull-based. `CanvasRenderer` calls `gameWrap.getRenderState()` every frame. The active phase returns a `RenderableState`, which is a list of grids with their drawables plus free renderables. Drawables are sorted by `drawPriority` and then by y position.
- Game coordinates are y-up: in `Cell` and `GridPosition`, y + 1 is the cell above on screen (`Cell.up()`), so "below" means negative y in grid shapes, pattern cells and hitbox offsets. The game keeps its own position frame and `TDrawable.getCanvasPosition` (`src/shared/traits/render/drawable.ts`) converts it to y-down canvas coordinates only when drawing.
- Input goes from `MouseEventHandler` to `InputToIntent`, which uses `instanceof` to find the active phase and picks a per-phase translator in `src/control/translators/`. A translator hit-tests the screen position and calls methods on the phase object directly.

### Traits system (most important concept)
Almost every entity is built from mixins using the local `@ddd-ts/traits` package (`traits/traits.ts`, linked as `file:./traits`).
- `Trait(base => class ...)` defines a mixin. `Subtrait([deps...], base => class ...)` defines a mixin that requires other traits.
- `class X extends Derive(TraitA, TraitB(args), ...)` composes traits. Constructor props are the intersection of every trait's props.
- `implementsTrait(obj, T)` is the runtime check and `ImplementsTrait<typeof T>` is the instance type. `Any*` aliases such as `AnyBattleTower` are defined this way.
- Naming: a `T*` trait carries its own data, and some are factories that take config, e.g. `TImageDrawable(img, size, priority)` or `TBaseStats({...})`. An `HT*` trait ("holder") delegates to another object passed as a prop, such as `hitboxHolder`, `imageDrawable`, `statsHolder` or `descriptor`. This lets a recruit or battle entity reuse its blueprint's hitbox, image and stats.
- Engine traits live in `src/shared/traits/engine/`: core collision and grid traits, casting, recruiting, status, synergy and tags for alignment, biome, building and species. Render traits live in `src/shared/traits/render/`.

### Three-layer entity model
Each game piece type (units, towers, totems, barracks, castle, tiles, projectiles) has parallel folders, usually `blueprint/`, `recruit/` and `battle/`, each with an `implementation/` subfolder:
1. **Blueprint**: the shop and catalog definition. It holds price (`TShopBlueprint`), rarity (`TRarity`), hitbox, image, description, `TBaseStats` and the `type` tag. `toRecruit(cell)` creates the recruit.
2. **Recruit**: the owned piece placed on the player's `ArmyGrid` or `Inventory`. It holds a cell and handles drag and drop through `moveRecruit`. Pieces cannot be rotated: a recruit always uses its `gridShape` cells and `patternEffect` cells as written, facing the player. `toAllied(grid, hooks)` and `toEnemy(grid, hooks)` create the battle entity. Every grid element carries a `BoardOrientation` enum (`Normal` or `Mirrored`, `src/shared/traits/engine/core/board-orientation.ts`). The enemy version has its anchor cell flipped with `BattleGrid.flip` and is built `BoardOrientation.Mirrored`, which negates its footprint and pattern and draws its single front-view image rotated by π. The opponent board is a point mirror of the board its builder made: a top right effect becomes bottom left.
3. **Battle**: the live combat entity. It is built from `HaveStats` and `Caster` and implements `tick()` and `onCastResolve()`.

Adding a new piece usually means one file in each layer's `implementation/`, plus updates to the layer's union type (`Any*`), its fixtures and builders (`*-fixtures.ts`), and its image entries in `src/renderer/resources/*.resources.ts`. Images are served from `public/resources/`; each piece has a single front-view image, `<piece>.png`.

### Cross-object communication: hooks
Entities never hold references to the army or battlefield. Instead they receive hook objects, which are bags of callbacks: `BattleArmyHooks` (`src/engine/army/battle/battle-army.ts`) provides target search, `addProjectile`, allied and enemy food, gold and buff hooks, and grid hooks. The shop uses `TokenHooks` and `shopPhaseHooks`. Wire new interactions through these hooks.

### Other subsystems
- `src/engine/stats/`: `Stats` covers health, attack, speed, cast and attack speed, food cost, range, conditions and boons. Statuses (frozen, rooted, stunned, stone shield, etc.) are in `status/`. `BaseStats` holds the blueprint values.
- `src/engine/grid/`: `ArmyGrid` (shop), `BattleGrid`, `RetailGrid` (shop offers) and `Inventory`. They share the `TGrid` trait and handle element placement and validation.
- `src/engine/pattern-effect/` and the `TSynergy` trait: adjacency and pattern synergies between pieces on the grid.
- Economy: gold (`src/engine/gold`) is spent in the shop and food (`src/engine/food`) is consumed by casts during battle.
- HUD elements are in `src/shared/hud-element/` and the screen-percentage helpers (`PercentToReal`, etc.) are in `canvas-renderer.ts`.
