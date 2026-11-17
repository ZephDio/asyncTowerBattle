#!/usr/bin/env python3
"""Generates the shop's start battle button pixel art.

Run from anywhere: python3 scripts/generate-start-button.py

Outputs public/resources/button/start.png.

A chunky pixel button like the purse: a small grid upscaled SCALE times, with a dark outline. A red face with a lit top
edge and a tan rim like the rarity odds panel sits on a darker lip, so the button looks raised. The "START" label is
drawn in the grid with bold 6x7 letters, outlined in ink over a dark drop shadow.
"""

from pathlib import Path

from sprite_sheet import outline, to_pixels
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "button" / "start.png"
SCALE = 4
GRID_WIDTH = 56
GRID_HEIGHT = 24

OUTLINE = (44, 22, 18, 255)
PALETTE = {
    # Red face, from highlight to the lip's shade
    "H": (250, 150, 112, 255),
    "L": (234, 92, 70, 255),
    "M": (204, 50, 44, 255),
    "S": (156, 32, 36, 255),
    "D": (106, 20, 30, 255),
    # Tan rim, lit and shaded
    "T": (232, 190, 120, 255),
    "t": (200, 149, 90, 255),
    # Label
    "W": (255, 244, 220, 255),
    "K": OUTLINE,
}

# The button, corners cut by CORNER cells; the face's bottom LIP rows are the raised button's front side
LEFT, RIGHT, TOP, BOTTOM = 1, GRID_WIDTH - 2, 1, GRID_HEIGHT - 2
CORNER = 3
LIP = 3

LETTERS = {
    "S": [".####.", "##..##", "##....", ".####.", "....##", "##..##", ".####."],
    "T": ["######", "######", "..##..", "..##..", "..##..", "..##..", "..##.."],
    "A": [".####.", "##..##", "##..##", "######", "##..##", "##..##", "##..##"],
    "R": ["#####.", "##..##", "##..##", "#####.", "##.##.", "##..##", "##..##"],
}
LABEL = "START"
LABEL_TOP = 6


def inside(x: int, y: int, inset: int = 0) -> bool:
    """Whether the cell is inside the button shrunk by inset, with its corners cut diagonally."""
    left, right, top, bottom = LEFT + inset, RIGHT - inset, TOP + inset, BOTTOM - inset
    if not (left <= x <= right and top <= y <= bottom):
        return False
    dx = max(left + CORNER - x, x - (right - CORNER), 0)
    dy = max(top + CORNER - y, y - (bottom - CORNER), 0)
    return dx + dy <= CORNER


def build_grid() -> list[str]:
    cells = [["."] * GRID_WIDTH for _ in range(GRID_HEIGHT)]
    face_bottom = BOTTOM - LIP
    for y in range(GRID_HEIGHT):
        for x in range(GRID_WIDTH):
            if not inside(x, y):
                continue
            if y > face_bottom:
                # The lip: the button's front side, darker toward the bottom
                cells[y][x] = "S" if y == face_bottom + 1 else "D"
            elif y == face_bottom:
                cells[y][x] = "K"
            elif not inside(x, y, 1) or y == face_bottom - 1:
                # The rim, lit on the top and left
                cells[y][x] = "T" if y < (TOP + face_bottom) / 2 and x < RIGHT - 2 else "t"
            elif y <= TOP + 2:
                cells[y][x] = "H" if LEFT + 4 <= x <= LEFT + 12 else "L"
            elif y >= face_bottom - 3:
                cells[y][x] = "S" if y == face_bottom - 2 else "M"
            else:
                cells[y][x] = "M"

    # The label, centered on the face, with an ink outline and a drop shadow one cell lower
    width = len(LABEL) * 6 + len(LABEL) - 1
    left = (GRID_WIDTH - width) // 2
    label = set()
    for index, letter in enumerate(LABEL):
        for row, line in enumerate(LETTERS[letter]):
            for column, char in enumerate(line):
                if char == "#":
                    label.add((left + index * 7 + column, LABEL_TOP + row))
    ring = {(x + dx, y + dy) for x, y in label for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))} - label
    for x, y in ring:
        if (x, y - 1) in label or (x, y - 1) in ring:
            cells[y + 1][x] = "D"
    for x, y in ring:
        cells[y][x] = "K"
    for x, y in label:
        cells[y][x] = "W"
    return ["".join(row) for row in cells]


def main() -> None:
    grid = outline(build_grid(), "K")
    write_png(OUTPUT, to_pixels(grid, PALETTE, SCALE))
    print("\n".join(grid))
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
