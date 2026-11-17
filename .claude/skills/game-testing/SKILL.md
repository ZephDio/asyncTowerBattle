---
name: game-testing
description: Run, play and screenshot the game in a headless browser through the atb-game MCP server - start a seeded game, read the shop or battle state, place or buy pieces, fast-forward or step battles, and capture cropped screenshots. Use when asked to run, start, play, test or screenshot the game, to check a new or changed piece in a real shop or battle, to watch a fight's outcome, or to verify a visual change in the real app rather than in a sprite preview.
---

# Game testing

The `atb-game` MCP server (`.mcp.json`, `.claude/mcp/server.py`) keeps the game open in one headless Chromium page
and starts Vite on port 5173 if nothing answers there. Its tools call the debug bridge `client/src/debug/bridge.ts`, which
the game installs as `window.__atb` when opened with `?debug`. Clicks and drags are real mouse events at pixels the
bridge computes, so they go through `MouseEventHandler` and the input translators.

## Getting the tools

Claude Code loads MCP servers only at startup. When the `mcp__atb-game__*` tools are missing (the server was just
added or changed, or failed to start), use the fallback CLI. It runs the same server over MCP, one page for the whole
sequence:

```
nix-shell .claude/playwright.nix --run "python .claude/mcp/call.py start '{\"seed\": 7}' start_battle run \
    screenshot --out .claude/screenshots/end.png"
```

Each tool name is followed by optional JSON arguments. Text results are printed and images are written to `--out`,
with `-2`, `-3`... after the first. Read the PNG afterwards to see it. After editing `server.py`, the loaded tools
keep running the old code until a restart. The CLI always runs the new code.

## Opponent server

When the shop closes, the game fetches its opponent board from asyncTowerBattleServer at `http://localhost:6868`
(`RemoteMatchMaker`). If the server doesn't answer, the game quietly falls back to `LocalMatchMaker` and logs the
warning "Opponent server unavailable". A test that reaches a battle without the server is therefore not testing the
server's boards. Before such a test:

1. Run a healthcheck: `curl -sf localhost:6868/health`.
2. If it answers, the user is running the server: use that one and leave it running at the end.
3. If it doesn't, start the server for the test. Run this with Bash and `run_in_background: true`:
   `cd server && pnpm build && exec node dist/main.js` (from the repo root)
   Then poll `/health` until it answers (a few seconds).
4. At the end of the test, stop the server you started, and only that one. Kill the process listening on the port,
   then confirm the port is free:
   ```
   pid=$(ss -ltnpH 'sport = :6868' | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2); kill $pid
   ss -ltnH 'sport = :6868' | grep -q . && echo "STILL LISTENING" || echo "port 6868 free"
   ```
   Don't use `pkill -f "dist/main.js"`: the pattern also matches the shell running the pkill, which kills that shell
   and leaves the server running. The background task then reports exit code 144 (SIGTERM), which is expected.

To check that a battle really used the server, run `console` after the shop closes: there should be no "Opponent
server unavailable" warning.

## Tools

- `start(faction="Elf", dev=True, seed=None, menu=False)` reloads the page and starts a game in the shop.
  - `dev` gives 10025 gold and flat rarity odds. Pass `dev=False` for a real first round (105 gold).
  - `seed` seeds `Math.random`, so the same seed gives the same shop offers and environment. The seed is returned:
    reuse it to reproduce a run.
  - `menu=True` stays on the main menu. Then `click_hud SelectElfButton` / `SelectDwarfButton` and
    `StartGameButton`.
- Reading:
  - `state` gives the phase as JSON. In the shop: gold, `pathComplete`, offers, army pieces, path tiles and
    inventory. In a battle or summary: tick, castles, units (`pos` in cells, hp, statuses), constructs and
    verdict.
  - `ascii(grid)` draws a grid top row first, since y points up: `#` path, `^` environment, `C` castle, letters for
    pieces. It's cheaper than a screenshot for checking a layout.
  - `inspect(id)` returns description, live stats and plain fields.
  - `catalog` lists every shop piece, and `hud` lists the clickable HUD elements of the phase.
- Acting:
  - `drag(id, from_grid, to_grid, x, y)` buys (`retail` → `army` / `inventory`) or moves pieces. It lands the
    piece's anchor exactly on (x, y). It returns the state: check the drop was accepted.
  - `click_cell` / `hover_cell(grid, x, y)`. A right-click cycles a path junction. A hover shows the description
    and synergies, ready for a screenshot.
  - `click_hud(name)`, e.g. `StartBattleButton`, `RefreshBellHud`, `NextRoundHud`, `HideHud`.
  - `give(name, x, y)` places any catalog piece for free with its anchor at (x, y). Without a cell, and always for
    units, it goes to the inventory. Also `remove(id)`, `set_gold`, `set_life`.
- Battle time:
  - `start_battle` presses Start, waits for the opponent board to arrive and for the intro animation, and pauses
    at tick 0 by default.
  - `step(ticks)` runs 32 ticks per second of game time, synchronously.
  - `run` fast-forwards to the end in well under a second.
  - `pause(false)` resumes real time, together with `wait(ms)`.
- `screenshot(region)` takes `canvas` (default), `full`, or a grid of the phase: `army`, `inventory`, `retail` in
  the shop, `battle` in a battle or summary. Crop to a grid whenever the rest of the screen doesn't matter.
- `console` returns errors and warnings since the last call. Check it after anything that might throw.
- `eval(code)` runs JavaScript with `atb`, `game` and `wrap` in scope, for anything the other tools don't cover.

## Workflows

- **A new or changed piece in the shop**: `start` with a seed, then `give` the piece. Take `ascii` plus
  `screenshot army` to check its footprint and image. `hover_cell` on it, then `screenshot army`, shows the
  description and synergy stars.
- **A piece in battle**: `give` it, `start_battle`, `step` to the moment that matters (e.g. its first cast), take
  `screenshot battle` and `state` for hp and statuses. Then `run` for the outcome.
- **Before and after a balance change**: the same seed and board give the same battle. Compare `run`'s tick,
  verdict and castle hp before and after the change. For reference, an elf start with nothing bought (any seed)
  loses round 1 at tick 1082 with the allied castle at -1.36 / 20.
- **The real UI path**: buy with `drag` and start with `click_hud`, not `give`, when the input handling or the shop
  itself is what changed.

## Pitfalls

- **Ids are per page.** Ids such as `BlueTower#10` are handed out in the order objects are first seen and reset on
  `start`. Take them from the latest `state` or `ascii`.
- **Offers are random.** Only a seed makes them repeatable. Read their ids from `state.offers`, never assume a slot.
- **The summary hides the board.** The verdict banner covers the battlefield: `click_hud HideHud` before a
  `screenshot battle` of the final board.
- **Units can't go on the army grid.** `give` sends them to the inventory. To field one, `give` a barrack and
  `drag` the unit from `inventory` onto the barrack's cell on `army`. `eval atb.byId("<barrack id>").unitRecruit`
  confirms it, and the barrack then summons it in battle.
- **`step` needs a started battle.** It fails during the intro animation. `start_battle` already waits for that.
- **Save screenshots meant for the user** in `.claude/screenshots/`. Throwaway ones go in the scratchpad.

## Extending

Add a read or an action as a method on `DebugBridge` (return JSON-safe values; `describe` and `statsOf` serialize
entities), then a thin `@mcp.tool()` in `server.py` that calls it through `session.call`. Run `pnpm typecheck`,
then `python .claude/mcp/smoke.py OUT_DIR` in the Nix shell, which plays a round through the tools.
