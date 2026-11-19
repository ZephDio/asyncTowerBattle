# AGENTS.md

Shared project guidance for all coding agents working in this repository.

Skills and supporting tools live in `.agents/`. See `.agents/README.md` for agent setup and MCP configuration.

## Layout

This is a pnpm workspace with two packages that share their tooling config at the root:
- `client/`: the browser game (Vite, plain TypeScript on a canvas inside a React and Tailwind page shell). The local `@ddd-ts/traits` package is `client/traits`.
- `server/`: asyncTowerBattleServer, a NestJS app on port 6868 that trades boards for opponent boards and holds the player accounts (Google or email and password sign-in, sessions). It stores them in Postgres (docker compose, Prisma migrations). See `server/README.md`.

Shared at the root: `tsconfig.base.json` (both `tsconfig.json` files extend it), `biome.json`, `devenv.nix`, `pnpm-workspace.yaml`, the lockfile, and the TypeScript, Jest and SWC dev dependencies in `package.json`. Package-specific settings stay in each package: module system (the client is bundled by Vite, the server is Node ESM), `jest.config.json`, `nest-cli.json`.

## Commands

The package manager is pnpm. A devenv/direnv shell provides Node 22 and pnpm; `devenv up` runs both the Vite client and the server as processes. Run commands from the root unless noted.

- `pnpm start`: start the Vite client and the server together. `pnpm start:client` and `pnpm start:server` start one. `pnpm start:infra` starts the server's Postgres in the project's Docker daemon and applies its migrations; the devenv shell starts that daemon on entering the project (`stop-docker` stops it). `pnpm start:client:dev` starts the client and opens it on `/?dev`. The client serves `client/index.html`, which loads the React app `client/src/main.tsx`.
- `pnpm typecheck`: run `tsc --noEmit` in both packages. The VS Code task runs the client's with `--watch`. The shared tsconfig is strict, including `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` and `noImplicitOverride`.
- `pnpm format`: run the Biome formatter over `client/src` and `server/src`. It uses tabs, a 120-column line width and double quotes.
- `pnpm test` runs both packages' tests. For a single file, run Jest from the package: `cd client && pnpm exec jest src/shared/hitboxes.spec.ts`. Jest uses `@swc/jest`, roots at each package's `src` and matches `*.spec.ts`. There are very few client tests.
- `pnpm test:integration` runs the server's `*.int-spec.ts` tests against the `atb_test` database (`TEST_DATABASE_URL`) in the running Postgres, which it migrates first. `pnpm test` leaves them out.
- `pnpm build` builds the server into `server/dist` and the client into `client/dist`. `pnpm build:docker` builds the `docker-compose.yml` images from the `Dockerfile` in the project's Docker daemon.
- `docker-compose.yml` at the root runs the whole app (Postgres, the server, and the built client in nginx, which proxies `/api` to the server) for a Portainer stack deployed from the repository; the `Dockerfile` builds both images. It needs `JWT_SECRET`, see the file's header. Vite listens on every interface so players on the local network can join a dev game.
- Running the game: the `atb-game` MCP server (`.mcp.json`, `.agents/mcp/server.py`) keeps the game open in headless Chromium from `.agents/playwright.nix` and starts Vite in `client/` if nothing answers on port 5173. Its tools:
  - `start` begins a seeded game.
  - `state`, `ascii` and `inspect` read the game as JSON or text.
  - `screenshot` captures the page, optionally cropped to a grid.
  - `drag`, `click_cell` and `click_hud` send real mouse events.
  - `give` and `set_gold` set the game up directly.
  - `start_battle` (paused), `step` and `run` control battle ticks.
  - `eval` runs JavaScript in the page.

  The game-testing skill covers using them, including the `.agents/mcp/call.py` fallback for sessions where the tools aren't loaded. The tools call the debug bridge `client/src/debug/bridge.ts`, which the game installs as `window.__atb` when opened with `?debug`. Add new reads or actions there. `python .agents/mcp/smoke.py OUT_DIR` in that Nix shell plays a round through the tools. For one-off screenshots without the server, use `nix-shell .agents/playwright.nix --run "python .agents/scripts/screenshot.py --help"`.

## Client architecture

Paths below are relative to `client/`. This is an async auto-battler played in the browser. The player builds an army on a grid during a shop phase. The army then fights an AI-supplied opponent army in an automatic battle. The code has no framework: plain TypeScript classes render to a 2D canvas.

### Page shell
- `src/main.tsx` mounts the React app in `src/app/`, styled with Tailwind (`src/index.css`, `vite.config.mts`). `App` lays out `GameCanvas` and the `SideMenu` drawer, which floats over the game so opening it never moves the canvas. `GameCanvas` renders the game's container and `<canvas>` and calls `startGame` once. The game itself stays plain TypeScript; React only owns the page around the canvas.
- Before playing, `LoginScreen` asks the player to log in or register with their email and password or with Google (`google-button.tsx`, Google Identity Services), or to play as a guest. `src/auth/` talks to the server's `/auth` routes and keeps the session tokens in localStorage; on load `App` resumes a stored session with its refresh token. Games opened with `?debug` never show the login screen: they resume a stored session, which the game tools' `start(player=...)` puts there, and play as a guest without one. The game itself does not know about the player yet. Only a logged-in player outside dev mode stores boards on the server and consumes opponents; guest and `?dev` games read opponents for free.
- `MouseEventHandler` listens for presses on the game container only, so clicks on the page shell never reach the game, and for moves and releases on the whole window. Canvas page coordinates come from `CanvasRenderer.pageOrigin()`.

### Top-level loop
- `startGame` in `src/index.ts` wires up `GameWrapper`, `CanvasRenderer`, `InputToIntent` and `MouseEventHandler`.
- `GameWrapper` (`src/engine/wrap.ts`) switches between `MainMenu` and `Game`.
- `Game` (`src/engine/game.ts`) runs the phase cycle `ShopPhase` → `Battle` → `BattleSummary` → shop again. Only one phase field is non-null at a time. The player has 5 lives and loses one per defeat. Opponents come from `RemoteMatchMaker`, which POSTs the player's serialized board and win/loss record to the server (`server/`) and gets an opponent board back. When the server is unreachable it falls back to `LocalMatchMaker`, which keeps hard-coded enemy armies per round in `src/engine/match-maker/`.
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
- `src/engine/target-zone/` and the `TTargeting` trait: towers find enemies in a set of cells relative to their anchor (`TargetZone`), not within a distance. The default is the 8 cells around the tower. The shop shows each target cell as a bow, red when it holds a path tile and grey otherwise (`ArmyGrid.addTargetTiles`).
- Economy: gold (`src/engine/gold`) is spent in the shop and food (`src/engine/food`) is consumed by casts during battle.
- HUD elements are in `src/shared/hud-element/` and the screen-percentage helpers (`PercentToReal`, etc.) are in `canvas-renderer.ts`.
- Icons: the pixel icons live in `public/resources/icons/`, drawn by `scripts/generate-corn.py`, `generate-gold-coin.py`, `generate-heart-container.py`, `generate-buff-icons.py` (16x16) and `generate-pattern-stars.py` (the 24x24 synergy stars). The same icons replace emoji in canvas text: `scripts/generate-icon-font.py` builds `public/font/icons.ttf` (a color font) and `icons.css`, which adds it to the `text` and `title` families for those emoji only. Write descriptions with 🪙 (gold), 🌽 (food), ❤ / 🖤 (castle health, full and empty), 🥾 (unit speed), 💚 (unit health), 🗡️ (unit castle damage, the bomb), ⚔️ (tower projectile damage), 💠 (tower cast speed), ▣ (a synergy cell, the yellow star) and ☆ (the grey, unmet synergy star). After changing an icon or the emoji map, run `pnpm generate:icon-font` in `client/`.
