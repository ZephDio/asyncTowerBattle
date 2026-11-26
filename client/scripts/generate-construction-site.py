#!/usr/bin/env python3
"""Generates the building sites under the shop offers (src/shared/traits/render/construction-site.ts).

Run from anywhere: python3 scripts/generate-construction-site.py

A plot of bare earth dug in the grass, marked out by a rope between wooden stakes, so an offer stands on a building
site whatever its footprint. One art pixel is as big as the grass's: CELL pixels per grid cell.

Outputs, in public/resources/hud/construction-site/:
- site.png: the plot cut in quarter cells, QUARTER pixels square, to lay over any set of cells. Each row is one corner
  of a cell (top left, top right, bottom left, bottom right) and each column one case of its two neighbor cells on
  that corner's sides and the diagonal one:
  0 neither side is in the plot (an outer corner), 1 only the horizontal neighbor (an edge across the top or bottom),
  2 only the vertical neighbor (an edge down a side), 3 both but not the diagonal (an inner corner), 4 all three.
  The earth's texture repeats every cell, so the quarters of neighbor cells join seamlessly.
- stake.png: the stake planted at each outer corner, its foot STAKE_FOOT pixels above its bottom.

The plot stays INSET pixels inside the cells' outer edges, so two plots side by side keep a strip of grass between them.
"""

from pathlib import Path

from voxel_sprite import OUTLINE, write_png

OUT = Path(__file__).resolve().parents[1] / "public" / "resources" / "hud" / "construction-site"

CELL = 48
QUARTER = CELL // 2
INSET = 3
ROPE_DEPTH = 4

GRASS_EDGE = (70, 160, 84, 255)
EARTH = [(92, 66, 70, 255), (118, 86, 74, 255), (146, 108, 82, 255), (170, 130, 94, 255), (196, 158, 112, 255)]
PEBBLE = [(112, 110, 122, 255), (160, 158, 162, 255), (204, 202, 194, 255)]
CHIP = (218, 181, 112, 255)
ROPE = (238, 222, 170, 255)
ROPE_SHADE = (180, 150, 104, 255)
CLEAR = (0, 0, 0, 0)
# Tower wood, dark to light.
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
FLAG = [(156, 52, 56, 255), (214, 84, 72, 255)]

# Neighbor cell offsets (x right, y down on screen) of each corner: horizontal side, vertical side, diagonal.
CORNERS = {
    "top-left": ((-1, 0), (0, -1), (-1, -1)),
    "top-right": ((1, 0), (0, -1), (1, -1)),
    "bottom-left": ((-1, 0), (0, 1), (-1, 1)),
    "bottom-right": ((1, 0), (0, 1), (1, 1)),
}
CASES = [(False, False, False), (True, False, False), (False, True, False), (True, True, False), (True, True, True)]


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def earth_tile():
    """One cell of trodden earth: chunky 3x2 clumps of the middle steps, a few pebbles and wood chips."""
    tile = [[EARTH[2]] * CELL for _ in range(CELL)]
    for y in range(CELL):
        for x in range(CELL):
            value = noise(x // 3, y // 2, 1)
            if value < 0.18:
                tile[y][x] = EARTH[1]
            elif value > 0.86:
                tile[y][x] = EARTH[3]
    for px, py in ((10, 14), (33, 9), (38, 35), (15, 37), (25, 24)):
        tile[py][px] = tile[py][px + 1] = PEBBLE[2]
        tile[py + 1][px] = tile[py + 1][px + 1] = PEBBLE[0]
        tile[py][px + 2] = PEBBLE[1]
    for px, py, length in ((28, 17, 3), (8, 28, 2), (40, 22, 3)):
        for dx in range(length):
            tile[py][px + dx] = CHIP
            tile[py + 1][px + dx] = EARTH[1]
    return tile


def quarter(corner, case, tile):
    """The quarter of a cell at `corner` when its neighbors in the plot are `case`."""
    inside = dict(zip(CORNERS[corner], case))
    outside = [offset for offset, present in inside.items() if not present]
    qx = QUARTER if corner.endswith("right") else 0
    qy = QUARTER if corner.startswith("bottom") else 0
    pixels = [[CLEAR] * QUARTER for _ in range(QUARTER)]
    for y in range(QUARTER):
        for x in range(QUARTER):
            px, py = qx + x, qy + y
            far = near = 1e9
            for ox, oy in outside:
                x0, y0 = ox * CELL, oy * CELL
                dx = max(x0 - px - 1, 0, px - (x0 + CELL))
                dy = max(y0 - py - 1, 0, py - (y0 + CELL))
                distance = max(dx, dy)
                # The back and left walls of the dug plot are seen, the front and right edges catch the light
                if oy < 0 or (ox < 0 and oy == 0):
                    far = min(far, distance)
                else:
                    near = min(near, distance)
            depth = min(far, near) - INSET
            if depth < -1:
                continue
            if depth == -1:
                color = GRASS_EDGE
            elif depth == ROPE_DEPTH:
                color = ROPE_SHADE if (px + py) % 5 == 0 else ROPE
            elif far <= near and depth < 2:
                color = EARTH[0] if depth == 0 else EARTH[1]
            elif near < far and depth == 0:
                color = EARTH[4]
            else:
                color = tile[py][px]
            pixels[y][x] = color
    return pixels


def stake():
    """A stake with a pointed top and a red ribbon, lit from the left, on a small shadow."""
    width, height = 8, 14
    pixels = [[CLEAR] * width for _ in range(height)]
    body = {(x, y) for y in range(3, 12) for x in range(3, 5)} | {(3, 2), (4, 2)}
    for x, y in body:
        pixels[y][x] = WOOD[3] if x == 3 else WOOD[2]
    pixels[2][4] = WOOD[3]
    for x, y in ((2, 4), (5, 4), (2, 5), (5, 5)):
        pixels[y][x] = FLAG[1] if x == 2 else FLAG[0]
    pixels[4][3], pixels[5][3] = FLAG[1], FLAG[1]
    pixels[4][4], pixels[5][4] = FLAG[0], FLAG[0]
    for x in range(2, 7):
        pixels[12][x] = (22, 28, 46, 80)
    solid = {(x, y) for y in range(height) for x in range(width) if pixels[y][x][3] == 255}
    for y in range(height):
        for x in range(width):
            if pixels[y][x][3] == 255:
                continue
            if any((x + dx, y + dy) in solid for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                pixels[y][x] = OUTLINE
    return pixels


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    tile = earth_tile()
    sheet = [[CLEAR] * (QUARTER * len(CASES)) for _ in range(QUARTER * len(CORNERS))]
    for row, corner in enumerate(CORNERS):
        for column, case in enumerate(CASES):
            for y, line in enumerate(quarter(corner, case, tile)):
                sheet[row * QUARTER + y][column * QUARTER : (column + 1) * QUARTER] = line
    write_png(OUT / "site.png", sheet)
    write_png(OUT / "stake.png", stake())
    print(f"wrote {OUT.relative_to(OUT.parents[3])}/site.png and stake.png")


if __name__ == "__main__":
    main()
