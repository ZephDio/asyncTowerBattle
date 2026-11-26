#!/usr/bin/env python3
"""Generates the parchment scroll of the hover tooltips (src/shared/hud-element/battle/army-resume/hud-tooltip.ts).

Run from anywhere: python3 scripts/generate-scroll.py

Outputs, in public/resources/hud/scroll/, the nine pieces of a scroll the game stretches to any size in art pixels:
- top-left.png, top.png, top-right.png: the upper roll, a parchment cylinder ending in a curl on each side, and the
  first rows of the sheet under it. `top.png` is 1 pixel wide and repeats.
- left.png, right.png: the ink edge of the sheet and its shaded border. 1 pixel tall, they repeat.
- center.png: the straw of the sheet with its fibers, a tile that repeats both ways.
- bottom-left.png, bottom.png, bottom-right.png: the last rows of the sheet, the lower roll and the shadow under it.

The roll is ROLL pixels tall and the corner pieces are ROLL pixels wide, so a scroll is at least 2 * ROLL columns wide
and 2 * (ROLL + 2) + 4 rows tall. One art pixel is drawn about 0.16 screen units wide (see HudTooltip.drawScroll).
"""

from pathlib import Path

from voxel_sprite import write_png

OUT = Path(__file__).resolve().parents[1] / "public" / "resources" / "hud" / "scroll"

ROLL = 10
EDGE = 2
INK = (22, 28, 46, 255)
MAUVE = (138, 103, 99, 255)
STRAW_SHADE = (175, 140, 121, 255)
STRAW = (227, 193, 140, 255)
CREAM = (245, 239, 169, 255)
FIBER = (214, 176, 128, 255)
SHADOW = (22, 28, 46, 79)
CLEAR = (0, 0, 0, 0)

COLUMNS = 3 * ROLL
ROWS = 3 * (ROLL + EDGE)
TILE_WIDTH, TILE_HEIGHT = 32, 16


def new(width, height):
    return [[CLEAR] * width for _ in range(height)]


def painter(pixels):
    def rect(x, y, w, h, color):
        for yy in range(max(y, 0), min(y + h, len(pixels))):
            for xx in range(max(x, 0), min(x + w, len(pixels[0]))):
                pixels[yy][xx] = color

    return rect


def scroll():
    """The scroll as HudTooltip used to draw it, without its fibers, COLUMNS x ROWS art pixels plus the shadow."""
    pixels = new(COLUMNS, ROWS + EDGE)
    rect = painter(pixels)

    def block(x, y, w, h):
        rect(x + 1, y, w - 2, h, INK)
        rect(x, y + 1, w, h - 2, INK)

    rect(2, ROWS, COLUMNS - 4, 2, SHADOW)
    sheet_left = 3
    sheet_width = COLUMNS - 2 * sheet_left
    rect(sheet_left, ROLL - 3, sheet_width, ROWS - 2 * ROLL + 6, INK)
    rect(sheet_left + 2, ROLL - 3, sheet_width - 4, ROWS - 2 * ROLL + 6, STRAW)
    rect(sheet_left + 2, ROLL, sheet_width - 4, 2, STRAW_SHADE)
    rect(sheet_left + 2, ROWS - ROLL - 2, sheet_width - 4, 2, STRAW_SHADE)
    rect(sheet_left + sheet_width - 4, ROLL, 2, ROWS - 2 * ROLL, STRAW_SHADE)

    cylinder = [CREAM, CREAM, STRAW, STRAW, STRAW_SHADE, MAUVE]
    for y in (0, ROWS - ROLL):
        block(0, y, COLUMNS, ROLL)
        for row, shade in enumerate(cylinder):
            rect(2, y + 2 + row, COLUMNS - 4, 1, shade)
        for x in (0, COLUMNS - ROLL):
            block(x, y, ROLL, ROLL)
            rect(x + 2, y + 2, ROLL - 4, ROLL - 4, STRAW_SHADE)
            rect(x + 2, y + 2, ROLL - 5, ROLL - 5, CREAM)
            rect(x + 4, y + 4, ROLL - 7, ROLL - 7, STRAW)
            rect(x + 4, y + 4, 2, 2, INK)
    return pixels


def center_tile():
    pixels = [[STRAW] * TILE_WIDTH for _ in range(TILE_HEIGHT)]
    rect = painter(pixels)
    for y in range(1, TILE_HEIGHT, 4):
        for x in range(2 + (y * 7) % 9, TILE_WIDTH - 8, 13 + (y % 5)):
            rect(x, y, 3 + (x * y) % 4, 1, FIBER)
    return pixels


def crop(pixels, x, y, w, h):
    return [row[x : x + w] for row in pixels[y : y + h]]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    full = scroll()
    top, bottom = ROLL + EDGE, ROLL + EDGE
    middle_x, right_x = ROLL, COLUMNS - ROLL
    middle_y, bottom_y = top, ROWS - bottom
    pieces = {
        "top-left": crop(full, 0, 0, ROLL, top),
        "top": crop(full, middle_x, 0, 1, top),
        "top-right": crop(full, right_x, 0, ROLL, top),
        "left": crop(full, 0, middle_y, ROLL, 1),
        "right": crop(full, right_x, middle_y, ROLL, 1),
        "bottom-left": crop(full, 0, bottom_y, ROLL, bottom + EDGE),
        "bottom": crop(full, middle_x, bottom_y, 1, bottom + EDGE),
        "bottom-right": crop(full, right_x, bottom_y, ROLL, bottom + EDGE),
        "center": center_tile(),
    }
    for name, pixels in pieces.items():
        write_png(OUT / f"{name}.png", pixels)
        print(f"wrote {(OUT / f'{name}.png').relative_to(OUT.parents[3])}")


if __name__ == "__main__":
    main()
