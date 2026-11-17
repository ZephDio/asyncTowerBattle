"""Smoke test of the game MCP server: plays a shop round and a battle through its tools, saving screenshots.

nix-shell .claude/playwright.nix --run "python .claude/mcp/smoke.py OUT_DIR"
"""

import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import server  # noqa: E402


async def main(out: Path):
    out.mkdir(parents=True, exist_ok=True)

    def show(title, text):
        print(f"--- {title}\n{text}")

    async def shot(name, region="canvas"):
        image = await server.screenshot(region)
        (out / f"{name}.png").write_bytes(image.data)
        print(f"--- saved {out / name}.png")

    try:
        show("start", await server.start(seed=42))
        show("ascii", await server.ascii())
        await shot("shop")
        await shot("army", "army")
        state = json.loads(await server.state())
        offer = state["offers"][0]
        show("buy first offer into inventory", await server.drag(offer["id"], "retail", "inventory", 0, 0))
        show("give", await server.give("Blue Tower", 3, 5))
        show("ascii after", await server.ascii())
        show("start battle", await server.start_battle())
        await shot("battle-0", "battle")
        show("step", await server.step(64))
        await shot("battle-64", "battle")
        show("run", await server.run())
        await shot("summary")
        show("console", await server.console())
        show("eval", await server.eval_js("game.army.inventory.width"))
    finally:
        await server.session.close()


asyncio.run(main(Path(sys.argv[1])))
