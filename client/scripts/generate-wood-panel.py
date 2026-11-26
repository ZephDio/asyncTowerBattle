#!/usr/bin/env python3
"""Generates the wooden plank panel behind the shop (src/shared/traits/render/wood-panel.ts).

Run from anywhere: python3 scripts/generate-wood-panel.py

Outputs, in public/resources/hud/wood-panel/, the nine pieces of a panel the game stretches to any size in art pixels,
like the scroll (generate-scroll.py):
- top-left.png, top.png, top-right.png, left.png, right.png, bottom-left.png, bottom.png, bottom-right.png: the frame,
  BORDER pixels thick, ink outside, a bevel lit from the top left, a nail in each corner. Edges are 1 pixel on their
  long side and repeat.
- center.png: horizontal planks, PLANK rows tall each, with staggered seams and grain. It repeats both ways.

The game draws one plank per grid cell high (see wood-panel.ts), so the center tile is 2 planks tall.
"""

from pathlib import Path

from voxel_sprite import write_png

OUT = Path(__file__).resolve().parents[1] / "public" / "resources" / "hud" / "wood-panel"

BORDER = 5
PLANK = 8
TILE_WIDTH, TILE_HEIGHT = 32, 2 * PLANK
INK = (42, 26, 16, 255)
FACE = (88, 57, 39, 255)
FACE_LIGHT = (101, 67, 45, 255)
GRAIN = (72, 46, 31, 255)
SEAM = (50, 31, 20, 255)
TOP_EDGE = (110, 74, 46, 255)
FRAME_DARK = (122, 80, 48, 255)
FRAME = (138, 90, 52, 255)
FRAME_LIGHT = (176, 122, 72, 255)
NAIL = (222, 190, 120, 255)
CLEAR = (0, 0, 0, 0)

SIZE = 3 * BORDER


def new(width, height, color=CLEAR):
    return [[color] * width for _ in range(height)]


def painter(pixels):
    def rect(x, y, w, h, color):
        for yy in range(max(y, 0), min(y + h, len(pixels))):
            for xx in range(max(x, 0), min(x + w, len(pixels[0]))):
                pixels[yy][xx] = color

    return rect


def center_tile():
    pixels = new(TILE_WIDTH, TILE_HEIGHT, FACE)
    rect = painter(pixels)
    seams = (11, 27)
    for row in range(2):
        y = row * PLANK
        rect(0, y, TILE_WIDTH, 1, SEAM)
        rect(0, y + 1, TILE_WIDTH, 1, TOP_EDGE)
        rect(0, y + 2, TILE_WIDTH, 1, FACE_LIGHT)
        seam = seams[row]
        rect(seam, y, 1, PLANK, SEAM)
        rect(seam + 1, y + 1, 1, PLANK - 1, TOP_EDGE)
        grain_y = (3 + 2 * row, 5 + row)
        for index, gy in enumerate(grain_y):
            x = (seam + 5 + 9 * index) % TILE_WIDTH
            length = 7 + 3 * index
            for dx in range(length):
                pixels[y + gy][(x + dx) % TILE_WIDTH] = GRAIN
        knot_x = (seam + 16) % TILE_WIDTH
        rect(knot_x, y + 4, 2, 2, GRAIN)
        rect((knot_x + 1) % TILE_WIDTH, y + 5, 1, 1, SEAM)
    return pixels


def frame():
    """The whole frame, SIZE x SIZE art pixels: only its border is used, the inside is face."""
    pixels = new(SIZE, SIZE, FACE)
    rect = painter(pixels)
    rect(0, 0, SIZE, SIZE, INK)
    rect(1, 1, SIZE - 2, SIZE - 2, FRAME_DARK)
    rect(1, 1, SIZE - 2, 1, FRAME_LIGHT)
    rect(1, 1, 1, SIZE - 2, FRAME_LIGHT)
    rect(2, 2, SIZE - 4, SIZE - 4, FRAME)
    rect(BORDER - 1, BORDER - 1, SIZE - 2 * (BORDER - 1), SIZE - 2 * (BORDER - 1), INK)
    rect(BORDER, BORDER, SIZE - 2 * BORDER, SIZE - 2 * BORDER, FACE)
    return pixels


def corner_nail(pixels, x, y):
    rect = painter(pixels)
    rect(x, y, 2, 2, NAIL)
    rect(x + 1, y + 1, 1, 1, FRAME_DARK)


def crop(pixels, x, y, w, h):
    return [row[x : x + w] for row in pixels[y : y + h]]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    full = frame()
    inner = SIZE - BORDER
    for x, y in ((2, 2), (inner + 1, 2), (2, inner + 1), (inner + 1, inner + 1)):
        corner_nail(full, x, y)
    pieces = {
        "top-left": crop(full, 0, 0, BORDER, BORDER),
        "top": crop(full, BORDER, 0, 1, BORDER),
        "top-right": crop(full, inner, 0, BORDER, BORDER),
        "left": crop(full, 0, BORDER, BORDER, 1),
        "right": crop(full, inner, BORDER, BORDER, 1),
        "bottom-left": crop(full, 0, inner, BORDER, BORDER),
        "bottom": crop(full, BORDER, inner, 1, BORDER),
        "bottom-right": crop(full, inner, inner, BORDER, BORDER),
        "center": center_tile(),
    }
    for name, pixels in pieces.items():
        write_png(OUT / f"{name}.png", pixels)
        print(f"wrote {(OUT / f'{name}.png').relative_to(OUT.parents[3])}")


if __name__ == "__main__":
    main()
