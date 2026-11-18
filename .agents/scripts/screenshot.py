"""Open the game in headless Chromium, optionally click through it, and save screenshots.

Run inside the Nix shell:
    nix-shell .agents/playwright.nix --run "python .agents/scripts/screenshot.py -o shot.png"

If no Vite server answers on --url, one is started with `pnpm start` and stopped at the end.

Actions (--do, repeatable, run in order):
    click:X,Y       click at canvas-page pixel X,Y
    wait:MS         wait MS milliseconds
    shot:PATH       save a screenshot to PATH
    drag:X1,Y1,X2,Y2  press at X1,Y1, move to X2,Y2 and release
A final screenshot is always written to -o.
"""

import argparse
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]


def server_up(url: str) -> bool:
	try:
		urllib.request.urlopen(url, timeout=1)
		return True
	except Exception:
		return False


def start_server(url: str) -> subprocess.Popen:
	proc = subprocess.Popen(
		["pnpm", "exec", "vite", "--strictPort", "--port", url.split(":")[-1].split("/")[0]],
		cwd=ROOT / "client",
		stdout=subprocess.DEVNULL,
		stderr=subprocess.DEVNULL,
		start_new_session=True,
	)
	for _ in range(60):
		if server_up(url):
			return proc
		time.sleep(0.5)
	proc.terminate()
	sys.exit(f"Vite did not start on {url}")


def run_action(page, action: str) -> None:
	kind, _, arg = action.partition(":")
	if kind == "click":
		x, y = (float(v) for v in arg.split(","))
		page.mouse.click(x, y)
	elif kind == "drag":
		x1, y1, x2, y2 = (float(v) for v in arg.split(","))
		page.mouse.move(x1, y1)
		page.mouse.down()
		page.mouse.move(x2, y2, steps=10)
		page.mouse.up()
	elif kind == "wait":
		page.wait_for_timeout(int(arg))
	elif kind == "shot":
		page.screenshot(path=arg)
		print(f"saved {arg}")
	else:
		sys.exit(f"unknown action {action}")


def main() -> None:
	parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
	parser.add_argument("--url", default="http://localhost:5173/", help="server root (default %(default)s)")
	parser.add_argument("--query", default="", help="query string, e.g. 'dev' for the dev start mode")
	parser.add_argument("--size", default="1600x900", help="viewport WxH (default %(default)s)")
	parser.add_argument("--wait", type=int, default=1500, help="ms to wait after load (default %(default)s)")
	parser.add_argument("--do", action="append", default=[], help="action, see above")
	parser.add_argument("-o", "--out", default="screenshot.png")
	args = parser.parse_args()

	server = None if server_up(args.url) else start_server(args.url)
	width, height = (int(v) for v in args.size.split("x"))
	try:
		with sync_playwright() as p:
			browser = p.chromium.launch()
			page = browser.new_page(viewport={"width": width, "height": height})
			page.on("console", lambda m: m.type in ("error", "warning") and print(f"[console.{m.type}] {m.text}"))
			page.on("pageerror", lambda e: print(f"[pageerror] {e}"))
			page.goto(args.url + (f"?{args.query}" if args.query else ""))
			page.wait_for_timeout(args.wait)
			for action in args.do:
				run_action(page, action)
			page.screenshot(path=args.out)
			print(f"saved {args.out}")
			browser.close()
	finally:
		if server:
			os.killpg(server.pid, 15)


if __name__ == "__main__":
	main()
