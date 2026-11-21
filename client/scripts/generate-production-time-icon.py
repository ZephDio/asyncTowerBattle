#!/usr/bin/env python3
"""Generates the production time icon: a stopwatch.

Run from anywhere: python3 scripts/generate-production-time-icon.py

Outputs public/resources/icons/production-time.png, the time a barrack takes to ready a unit for battle (the ⏱ of the
icon font, see generate-icon-font.py).

It follows the other stat icons (see generate-buff-icons.py): a 16x16 sprite upscaled 4x, flat colors with one or two
shades per part, light from the top left, and the icons' dark ink outline drawn around the silhouette. The sprite is
hand placed below (one character per pixel), the outline is added automatically.
"""

from pathlib import Path

from sprite_sheet import outline, to_pixels
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "icons" / "production-time.png"
SCALE = 4
INK = (24, 20, 37, 255)

PALETTE = {
    # Steel case, from highlight to shade: the cannonballs' iron
    "a": (196, 206, 222, 255),
    "b": (124, 136, 160, 255),
    "c": (78, 86, 110, 255),
    # Face, its ticks and hands, and the amber wedge of elapsed time
    "W": (250, 250, 240, 255),
    "w": (170, 178, 196, 255),
    "k": (24, 20, 37, 255),
    "y": (241, 147, 25, 255),
    "K": INK,
}

def build_sprite() -> list[str]:
    """A round stopwatch: a steel case (lit top left) with a crown and a side button, a white face with four ticks,
    an amber wedge of elapsed time and two hands."""
    cx, cy, radius = 7.5, 8.5, 6.2
    case = {(x, y) for y in range(16) for x in range(16) if (x - cx) ** 2 + (y - cy) ** 2 <= radius**2}
    face = {(x, y) for x, y in case if all((x + dx, y + dy) in case for dx in (-1, 0, 1) for dy in (-1, 0, 1))}
    grid = [["."] * 16 for _ in range(16)]
    for x, y in case:
        light = (x - cx) + (y - cy)
        grid[y][x] = "a" if light < -4 else ("c" if light > 4 else "b")
    for x, y in face:
        grid[y][x] = "W"
    for x, y in [(7, 2), (8, 2)]:  # the crown's stem
        grid[y][x] = "b"
    for x in range(6, 10):  # the crown
        grid[1][x] = "c"
    for x, y in [(12, 3), (13, 3), (13, 4)]:  # the side button
        grid[y][x] = "b"
    for x, y in [(7, 5), (7, 12), (4, 9), (11, 9)]:  # ticks
        grid[y][x] = "w"
    for x, y in [(8, 6), (9, 6), (8, 7), (9, 7), (9, 8)]:  # elapsed time
        grid[y][x] = "y"
    for x, y in [(7, 6), (7, 7), (7, 8), (7, 9), (8, 9), (9, 9)]:  # hands
        grid[y][x] = "k"
    return ["".join(row) for row in grid]


SPRITE = build_sprite()


def main() -> None:
    assert all(len(row) == len(SPRITE) for row in SPRITE), "every row must be as long as the sprite is tall"
    write_png(OUTPUT, to_pixels(outline(SPRITE, "K"), PALETTE, scale=SCALE))
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
