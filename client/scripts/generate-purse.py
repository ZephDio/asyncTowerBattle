#!/usr/bin/env python3
"""Generates the gold purse pixel art, the shop HUD that shows the player's gold.

Run from anywhere: python3 scripts/generate-purse.py

Outputs public/resources/economy/purse.png.

A chunky money bag like the units: a small sprite grid upscaled SCALE times, flat colors with a few shades, light from
the top left and a dark outline around the silhouette. The grid is built from shapes rather than hand placed: a round
body, a narrow neck under a flared fabric top, and a red tie whose tail hangs over the body's right shoulder. The body
is left plain: GoldHud writes the gold amount on it, so keep BODY_CENTER and BODY_RADII in sync with gold-hud.ts.
"""

from pathlib import Path

from sprite_sheet import outline, to_pixels
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "economy" / "purse.png"
SCALE = 4
GRID_WIDTH = 28
GRID_HEIGHT = 28

OUTLINE = (44, 22, 18, 255)
PALETTE = {
    # Leather, from highlight to shade
    "H": (246, 206, 112, 255),
    "L": (226, 160, 58, 255),
    "M": (196, 126, 34, 255),
    "S": (152, 90, 24, 255),
    "D": (106, 58, 20, 255),
    # Tie
    "R": (206, 36, 32, 255),
    "r": (140, 18, 22, 255),
    "K": OUTLINE,
}

# Body: a squarish ellipse (superellipse exponent) in grid cells
BODY_CENTER = (14, 17.5)
BODY_RADII = (12.4, 9)
BODY_EXPONENT = 2.4
# Neck between the body and the flared top, then the flare, as (row, first column, last column)
NECK = [(7, 11, 16), (8, 11, 16)]
FLARE = [(2, 9, 18), (3, 8, 19), (4, 9, 18), (5, 10, 17)]
# Ruffles poking up from the flare's top edge
RUFFLES = [9, 10, 13, 14, 17, 18]
TIE_ROWS = (6, 7)
TIE_COLUMNS = (10, 17)
# The tie's tail, two cells thick, from the knot down to the right past the body edge
TAIL = [(18, 6), (19, 7), (20, 7), (21, 8), (22, 9), (23, 10), (23, 11)]


def body_shade(x: int, y: int) -> str | None:
    nx = (x + 0.5 - BODY_CENTER[0]) / BODY_RADII[0]
    ny = (y + 0.5 - BODY_CENTER[1]) / BODY_RADII[1]
    r = abs(nx) ** BODY_EXPONENT + abs(ny) ** BODY_EXPONENT
    if r > 1:
        return None
    # A soft highlight on the top left, then bands from the lit left to the shaded right and bottom
    if (nx + 0.5) ** 2 + (ny + 0.45) ** 2 < 0.05:
        return "H"
    light = -(0.8 * nx + 0.5 * ny)
    step = "L" if light > 0.35 else "M" if light > -0.3 else "S"
    if r > 0.78 and step != "L":
        step = {"M": "S", "S": "D"}[step]
    return step


def fabric_shade(x: int, first: int, last: int) -> str:
    t = (x - first) / max(1, last - first)
    return "L" if t < 0.3 else "M" if t < 0.7 else "S"


def build_grid() -> list[str]:
    cells = [["."] * GRID_WIDTH for _ in range(GRID_HEIGHT)]
    for y in range(GRID_HEIGHT):
        for x in range(GRID_WIDTH):
            shade = body_shade(x, y)
            if shade:
                cells[y][x] = shade
    for row, first, last in NECK + FLARE:
        for x in range(first, last + 1):
            cells[row][x] = fabric_shade(x, first, last)
    for x in RUFFLES:
        cells[1][x] = fabric_shade(x, 9, 18)
    # Folds in the flare: short dark creases under the gaps between the ruffles, and the opening's rim on top
    for row, column in ((3, 11), (4, 11), (3, 15), (4, 15), (3, 16)):
        cells[row][column] = "S" if column < 14 else "D"
    for x in range(11, 17):
        cells[2][x] = "D"
    for row in TIE_ROWS:
        first, last = TIE_COLUMNS
        for x in range(first, last + 1):
            cells[row][x] = "R" if x < last - 1 else "r"
    for x, y in TAIL:
        cells[y][x] = "R"
        cells[y + 1][x] = "r"
        # A dark seam under the tail so it lifts off the leather
        if cells[y + 2][x] not in ".Rr":
            cells[y + 2][x] = "K"
    # A crease under the tie where the leather gathers into the neck
    for x in range(10, 18):
        if cells[9][x] != ".":
            cells[9][x] = "S" if x % 3 else "D"
    return ["".join(row) for row in cells]


def main() -> None:
    grid = outline(build_grid(), "K")
    write_png(OUTPUT, to_pixels(grid, PALETTE, SCALE))
    print("\n".join(grid))
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
