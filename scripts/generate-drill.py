#!/usr/bin/env python3
"""Generates the drill projectile shot by the drill tower.

Run from anywhere: python3 scripts/generate-drill.py

Outputs public/resources/projectiles/drill.png. It is the drill bit of the drill tower, the same voxels and the
same shading taken from generate-drill-tower.py, detached from the tower: the brass collar, the spiral cone and
a short stub of the shaft. The tower draws it pointing at the bottom of the screen; projectiles face their flight
angle with 0 pointing right, so the image is turned a quarter turn counterclockwise to point right. The game turns
it back when the drill flies down the board, which keeps the light on the top left like on the tower.
"""

import importlib.util
from pathlib import Path

from voxel_sprite import VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "projectiles" / "drill.png"
PADDING = 1
# How much of the shaft stays behind the collar
SHAFT_STUB = 5

spec = importlib.util.spec_from_file_location("drill_tower", Path(__file__).with_name("generate-drill-tower.py"))
assert spec and spec.loader
tower = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tower)


def build_model() -> VoxelGrid:
    grid = VoxelGrid(tower.HALF_X, tower.HALF_Y)
    for y in range(tower.SHAFT_FRONT, tower.SHAFT_FRONT + SHAFT_STUB):
        tower.disc(grid, y, tower.SHAFT_RADIUS, tower.SHAFT_LABEL)
    for y in range(*tower.COLLAR):
        tower.disc(grid, y, tower.COLLAR_RADIUS, tower.BAND_LABEL)
    for y in range(tower.DRILL_TIP, tower.COLLAR[0]):
        t = (y - tower.DRILL_TIP) / (tower.COLLAR[0] - tower.DRILL_TIP)
        tower.disc(grid, y, max(0.8, tower.DRILL_RADIUS * t), tower.DRILL_LABEL)
    return grid


def crop(pixels: list[list[tuple[int, int, int, int]]]) -> list[list[tuple[int, int, int, int]]]:
    rows = [y for y, row in enumerate(pixels) if any(p[3] for p in row)]
    cols = [x for x in range(len(pixels[0])) if any(row[x][3] for row in pixels)]
    y0, y1 = max(0, rows[0] - PADDING), min(len(pixels), rows[-1] + 1 + PADDING)
    x0, x1 = max(0, cols[0] - PADDING), min(len(pixels[0]), cols[-1] + 1 + PADDING)
    return [row[x0:x1] for row in pixels[y0:y1]]


def turn_counterclockwise(pixels: list[list[tuple[int, int, int, int]]]) -> list[list[tuple[int, int, int, int]]]:
    """The bottom edge becomes the right edge, so the tip pointing down now points right."""
    height, width = len(pixels), len(pixels[0])
    return [[pixels[y][width - 1 - x] for y in range(height)] for x in range(width)]


def main() -> None:
    # No shadow: the drill flies above the board, shadow_radii keeps it out of the image
    sprite = render(build_model(), 0, tower.WIDTH, tower.HEIGHT, tower.ORIGIN_Y, tower.shade, (0.01, 0.01))
    outline(sprite, tower.crack, depth_gap=6, depth_width=1)
    pixels = turn_counterclockwise(crop(sprite.pixels))
    write_png(OUTPUT, pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)} ({len(pixels[0])}x{len(pixels)})")


if __name__ == "__main__":
    main()
