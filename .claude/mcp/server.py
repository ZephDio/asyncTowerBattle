"""MCP server that runs the game in one long-lived headless Chromium page.

It talks to the debug bridge the game installs as `window.__atb` when opened with `?debug` (client/src/debug/bridge.ts).
Reading goes through the bridge; clicks and drags are real mouse events at page pixels the bridge computes, so they
go through MouseEventHandler and the input translators like a player's would.

Run through the Nix shell, see .mcp.json. Vite is started on port 5173 when nothing answers there.
"""

import json
import os
import random
import signal
import subprocess
import urllib.request
from contextlib import asynccontextmanager
from pathlib import Path

from mcp.server.mcpserver import Image, MCPServer
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[2]
PORT = int(os.environ.get("ATB_PORT", "5173"))
URL = f"http://localhost:{PORT}/"

# Replaces Math.random with a seeded generator before the game loads, for reproducible shops and environments.
SEED_SCRIPT = """
(() => {
  let s = %d >>> 0;
  Math.random = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();
"""

# JSON with cycles cut and depth limited, for eval results on game objects.
SAFE_JSON = """
(value, depth) => {
  const seen = new WeakSet();
  const walk = (v, d) => {
    if (v === null || typeof v !== "object") return typeof v === "function" ? `[function ${v.name}]` : v;
    if (seen.has(v)) return `[cycle ${v.constructor?.name ?? ""}]`;
    if (d > depth) return `[${v.constructor?.name ?? "object"}]`;
    seen.add(v);
    if (v instanceof Map) return { __map: [...v.entries()].slice(0, 50).map(([k, x]) => [walk(k, d + 1), walk(x, d + 1)]) };
    if (v instanceof Set) v = [...v];
    if (Array.isArray(v)) return v.slice(0, 100).map((x) => walk(x, d + 1));
    const out = { __class: v.constructor?.name };
    for (const key of Object.keys(v)) out[key] = walk(v[key], d + 1);
    return out;
  };
  return walk(value, 0);
}
"""


class Session:
    def __init__(self):
        self.playwright = None
        self.browser = None
        self.page = None
        self.vite = None
        self.console: list[str] = []

    async def ensure_browser(self):
        if self.browser:
            return
        if not server_up():
            self.vite = subprocess.Popen(
                ["pnpm", "exec", "vite", "--strictPort", "--port", str(PORT)],
                cwd=ROOT / "client",
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch()

    async def open(self, query: str, seed: int | None, width: int, height: int):
        await self.ensure_browser()
        await wait_for_server()
        if self.page:
            await self.page.close()
        page = await self.browser.new_page(viewport={"width": width, "height": height})
        if seed is not None:
            await page.add_init_script(SEED_SCRIPT % seed)
        page.on("console", lambda m: self.log(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: self.log(f"[pageerror] {e}"))
        await page.goto(URL + "?" + query)
        await page.wait_for_function("() => window.__atb !== undefined")
        # Let images and fonts load before the first screenshot.
        await page.wait_for_load_state("networkidle")
        self.page = page

    def log(self, line: str):
        self.console.append(line)
        del self.console[:-500]

    async def call(self, method: str, *args):
        if not self.page:
            raise RuntimeError("No game page: call start first")
        return await self.page.evaluate(
            "([method, args]) => window.__atb[method](...args)", [method, list(args)]
        )

    async def close(self):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        if self.vite:
            os.killpg(self.vite.pid, signal.SIGTERM)


def server_up() -> bool:
    try:
        urllib.request.urlopen(URL, timeout=1)
        return True
    except Exception:
        return False


async def wait_for_server():
    import asyncio

    for _ in range(120):
        if server_up():
            return
        await asyncio.sleep(0.25)
    raise RuntimeError(f"Vite did not answer on {URL}")


session = Session()


@asynccontextmanager
async def lifespan(_server):
    try:
        yield None
    finally:
        await session.close()


mcp = MCPServer(
    "atb-game",
    instructions=(
        "Drives the async tower battle game in a headless Chromium page. Call `start` first. Grid cells have y "
        "pointing up: y + 1 is the cell above on screen. Ids returned by `state` and `ascii` are stable for the page's "
        "life and are what `inspect`, `drag` and `remove` take. Prefer `state`/`ascii` to check layout and reach for "
        "`screenshot` (cropped to a region) for visuals."
    ),
    lifespan=lifespan,
)


def dump(value) -> str:
    return json.dumps(value, separators=(",", ":"))


# --- Session ---------------------------------------------------------------------------------------------------------


@mcp.tool()
async def start(
    faction: str = "Elf",
    dev: bool = True,
    seed: int | None = None,
    menu: bool = False,
    width: int = 1600,
    height: int = 900,
) -> str:
    """(Re)load the game page and start a new game.

    faction: "Elf" or "Dwarf". dev: open with `?dev` (lots of gold, flat rarity odds). seed: seed Math.random so the
    shop offers and environment are reproducible (battles are already deterministic). menu: stay on the main menu.
    """
    seed = seed if seed is not None else random.randrange(2**31)
    await session.open("debug" + ("&dev" if dev else ""), seed, width, height)
    result = await session.call("state") if menu else await session.call("startGame", faction)
    return dump({"seed": seed, **result})


@mcp.tool()
async def screenshot(region: str = "canvas", padding: int = 8) -> Image:
    """Screenshot the page. region: "full", "canvas", or a grid of the current phase: "army", "inventory", "retail"
    in the shop, "battle" in a battle or its summary. padding: extra pixels around a grid region."""
    page = session.page
    if not page:
        raise RuntimeError("No game page: call start first")
    # Two frames so the renderer has drawn the latest state.
    await page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
    clip = None
    if region != "full":
        regions = await session.call("regions")
        if region not in regions:
            raise ValueError(f"Region {region} not available now, choose from {sorted(regions)} or full")
        rect = regions[region]
        pad = 0 if region == "canvas" else padding
        clip = {
            "x": max(0, rect["x"] - pad),
            "y": max(0, rect["y"] - pad),
            "width": rect["width"] + 2 * pad,
            "height": rect["height"] + 2 * pad,
        }
    return Image(data=await page.screenshot(clip=clip), format="png")


@mcp.tool()
async def console(clear: bool = True) -> str:
    """Console errors, warnings and uncaught page errors since the last call (or since start)."""
    lines = list(session.console)
    if clear:
        session.console.clear()
    return "\n".join(lines) or "(no console errors)"


@mcp.tool(name="eval")
async def eval_js(code: str, depth: int = 2) -> str:
    """Run JavaScript in the page. `atb` is the debug bridge, `game` the Game (or null), `wrap` the GameWrapper.
    A single expression is returned as is; code with `return` runs as a function body. The result is serialized with
    cycles cut and objects deeper than `depth` replaced by their class name. Await is allowed."""
    body = code if "return" in code else f"return ({code});"
    return dump(
        await session.page.evaluate(
            f"""async ([depth]) => {{
                const atb = window.__atb, game = atb.game, wrap = atb.wrap;
                const value = await (async () => {{ {body} }})();
                return ({SAFE_JSON})(value, depth);
            }}""",
            [depth],
        )
    )


# --- Reading ---------------------------------------------------------------------------------------------------------


@mcp.tool()
async def state() -> str:
    """The current phase as JSON. Shop: round, life, gold, path completeness, offers, army pieces, path tile cells,
    inventory. Battle and summary: tick, both sides' castle, units (position in cells, hp, statuses) and constructs."""
    return dump(await session.call("state"))


@mcp.tool()
async def ascii(grid: str = "army") -> str:
    """A grid as text with a legend, top row first (y points up). grid: "army", "inventory", "retail" or "battle".
    `#` path tile, `^` environment, `C` castle, `.` empty, letters are pieces."""
    result = await session.call("ascii", grid)
    legend = "\n".join(f"{letter}: {name}" for letter, name in result["legend"].items())
    return result["map"] + ("\n\n" + legend if legend else "")


@mcp.tool()
async def inspect(id: str) -> str:
    """Everything about one element by id: description, tags, rarity, live stats and plain fields."""
    return dump(await session.call("inspect", id))


@mcp.tool()
async def catalog() -> str:
    """Every piece the shop can offer, with rarity and price. Names work with `give`."""
    return dump(await session.call("catalog"))


@mcp.tool()
async def hud() -> str:
    """HUD elements of the current phase with their page pixel centre, for `click_hud`."""
    return dump(await session.call("hudElements"))


# --- Real input ------------------------------------------------------------------------------------------------------


async def page_point(grid: str, x: int, y: int):
    return await session.page.evaluate(
        "([grid, x, y]) => { const atb = window.__atb; return atb.cellCenterPage(atb.grid(grid), {x, y, type: 'cell'}); }",
        [grid, x, y],
    )


@mcp.tool()
async def click(x: float, y: float, button: str = "left") -> str:
    """Click at page pixel x, y. button: "left" or "right"."""
    await session.page.mouse.click(x, y, button=button)
    return "ok"


@mcp.tool()
async def click_cell(grid: str, x: int, y: int, button: str = "left") -> str:
    """Click the centre of cell (x, y) of a grid ("army", "inventory", "retail", "battle"). Right-click on a path
    tile cycles its junction."""
    point = await page_point(grid, x, y)
    await session.page.mouse.click(point["x"], point["y"], button=button)
    return dump(point)


@mcp.tool()
async def hover_cell(grid: str, x: int, y: int) -> str:
    """Move the mouse over a cell, e.g. to show a piece's description and synergies before a screenshot."""
    point = await page_point(grid, x, y)
    await session.page.mouse.move(point["x"], point["y"], steps=4)
    return dump(point)


@mcp.tool()
async def click_hud(name: str) -> str:
    """Click a HUD element by class name, e.g. StartBattleButton, RefreshBellHud, NextRoundHud, HideHud,
    StartGameButton, SelectDwarfButton. See `hud`."""
    elements = await session.call("hudElements")
    match = next((e for e in elements if e["name"].lower() == name.lower()), None)
    if not match:
        raise ValueError(f"No HUD element {name} now, choose from {[e['name'] for e in elements]}")
    await session.page.mouse.click(match["x"], match["y"])
    await session.page.wait_for_timeout(50)
    return dump(await session.call("state"))


@mcp.tool()
async def drag(id: str, from_grid: str, to_grid: str, x: int, y: int) -> str:
    """Drag a piece with real mouse events so that its anchor cell lands on (x, y) of `to_grid`.

    Buying is dragging an offer from "retail" to "army" or "inventory". Moving is dragging from "army" or
    "inventory". Returns the shop state afterwards, check it to see whether the drop was accepted."""
    mouse = session.page.mouse
    start_point = await session.call("pressPoint", from_grid, id)
    end_point = await session.call("dropPoint", to_grid, id, {"x": x, "y": y, "type": "cell"})
    await mouse.move(start_point["x"], start_point["y"])
    await mouse.down()
    await mouse.move(end_point["x"], end_point["y"], steps=12)
    await mouse.up()
    await session.page.wait_for_timeout(50)
    return dump(await session.call("state"))


# --- Shortcuts -------------------------------------------------------------------------------------------------------


@mcp.tool()
async def give(name: str, x: int | None = None, y: int | None = None) -> str:
    """Put a new piece (name or class name from `catalog`) on the army grid with its anchor at (x, y), or in the
    inventory when no cell is given. Units always go to the inventory. Skips the shop and gold."""
    cell = {"x": x, "y": y, "type": "cell"} if x is not None and y is not None else None
    return dump(await session.call("give", name, cell))


@mcp.tool()
async def remove(id: str) -> str:
    """Remove a piece from the army grid or inventory."""
    return dump(await session.call("remove", id))


@mcp.tool()
async def set_gold(amount: int) -> str:
    """Set the player's gold."""
    return dump(await session.call("setGold", amount))


@mcp.tool()
async def set_life(life: int) -> str:
    """Set the player's remaining lives."""
    return dump(await session.call("setLife", life))


# --- Battle time -----------------------------------------------------------------------------------------------------


async def wait_battle_started(timeout_ms: int = 5000):
    await session.page.wait_for_function(
        "() => { const b = window.__atb.game?.battle; return !b || b.started; }", timeout=timeout_ms
    )


@mcp.tool()
async def start_battle(paused: bool = True) -> str:
    """Click the start button, wait for the battle intro to finish and, by default, pause it at tick 0 so `step` and
    `run` control time. Fails with the state when the shop refuses (e.g. no complete path)."""
    await click_hud("StartBattleButton")
    # The shop stays open while the game fetches the opponent board; pause the battle as soon as it exists.
    await session.page.wait_for_function(
        """(p) => {
            const game = window.__atb.game;
            if (game.searchingOpponent) return false;
            if (game.battle) game.battle.paused = p;
            return true;
        }""",
        arg=paused,
        timeout=10000,
    )
    if await session.call("phase") != "battle":
        return "Shop did not exit:\n" + dump(await session.call("state"))
    await wait_battle_started()
    return dump(await session.call("battleClock"))


@mcp.tool()
async def step(ticks: int = 32) -> str:
    """Advance the paused battle by `ticks` ticks (32 per second) synchronously, stopping if it ends."""
    await wait_battle_started()
    return dump(await session.call("step", ticks))


@mcp.tool()
async def run(max_ticks: int = 32 * 300) -> str:
    """Fast-forward the battle until it ends (or `max_ticks`), then return the final state."""
    await wait_battle_started()
    clock = await session.call("step", max_ticks)
    return dump({"clock": clock, "state": await session.call("state")})


@mcp.tool()
async def pause(paused: bool = True) -> str:
    """Pause or resume the battle's real-time tick loop."""
    return dump(await session.call("pause", paused))


@mcp.tool()
async def wait(ms: int = 500) -> str:
    """Wait in real time, e.g. for animations or an unpaused battle."""
    await session.page.wait_for_timeout(ms)
    return "ok"


if __name__ == "__main__":
    mcp.run("stdio")
