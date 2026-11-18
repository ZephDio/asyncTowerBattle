"""Call the atb-game MCP server's tools in sequence, for sessions where its tools are not loaded (MCP servers load
when Claude Code starts). Goes through the real MCP protocol, one server and one page for the whole sequence.

nix-shell .claude/playwright.nix --run "python .claude/mcp/call.py start '{\"seed\": 1}' start_battle run \
    screenshot '{\"region\": \"battle\"}' --out .claude/screenshots/end.png"

Arguments are tool names, each optionally followed by its JSON arguments. Image results are written to --out (with
a -2, -3... suffix after the first one); text results are printed.
"""

import argparse
import asyncio
import base64
import json
import os
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

ROOT = Path(__file__).resolve().parents[2]


def parse_calls(items: list[str]):
    calls = []
    for item in items:
        if item.lstrip().startswith("{"):
            if not calls:
                raise SystemExit(f"JSON arguments {item} come before any tool name")
            calls[-1][1].update(json.loads(item))
        else:
            calls.append((item, {}))
    return calls


async def main(calls, out: Path):
    params = StdioServerParameters(
        command="nix-shell",
        args=["-I", "nixpkgs=flake:nixpkgs", str(ROOT / ".claude/playwright.nix"), "--run", "exec python .claude/mcp/server.py"],
        cwd=str(ROOT),
        # The whole environment, so ATB_PORT and ATB_SERVER_URL reach the server.
        env=dict(os.environ),
    )
    images = 0
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            for name, args in calls:
                result = await session.call_tool(name, args)
                for content in result.content:
                    if content.type == "image":
                        images += 1
                        path = out if images == 1 else out.with_stem(f"{out.stem}-{images}")
                        path.parent.mkdir(parents=True, exist_ok=True)
                        path.write_bytes(base64.b64decode(content.data))
                        print(f"[{name}] saved {path}")
                    else:
                        print(f"[{name}] {content.text}")
                if result.is_error:
                    raise SystemExit(f"{name} failed")


parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
parser.add_argument("calls", nargs="+", help="tool names, each followed by optional JSON arguments")
parser.add_argument("--out", default="screenshot.png", type=Path, help="where image results go")
args = parser.parse_args()
asyncio.run(main(parse_calls(args.calls), args.out))
