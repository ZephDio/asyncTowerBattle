#!/usr/bin/env python3
"""Generates the scroll of the piece descriptor (src/shared/traits/render/huds/descriptor-scroll.ts).

Run from anywhere: python3 scripts/generate-descriptor-scroll.py

Like the tooltip scroll (generate-scroll.py), but its two rolls carry text: the title in the top one, the tags in the
bottom one, so a roll can be any height from ROLL_MIN rows. Outputs, in public/resources/hud/descriptor-scroll/<rarity>/:
- roll-left.png, roll.png, roll-right.png: a roll, ROLL_TOP + 1 + ROLL_BOTTOM rows tall. The game draws the first
  ROLL_TOP rows and the last ROLL_BOTTOM rows as they are and repeats the one row between them to reach the height it
  needs. `roll.png` is 1 pixel wide and repeats. The ends are ROLL_END wide.
- handle-left.png, handle-right.png: the dark wood rods sticking out of the rolls' ends, HANDLE_WIDTH wide, drawn behind the
  rolls at their middle and outside the scroll's columns.
- edge-left.png, edge-right.png: the ink border of the sheet and its shaded side, 1 row tall, repeated down the sheet.
- center.png: the straw of the sheet with its fibers, a tile that repeats both ways.
- shade.png: the two rows of shade under the top roll, 1 pixel wide, stretched across the sheet.
- shadow.png: the two rows the bottom roll throws, 1 pixel wide, stretched under it.

The sheet is SHEET_INSET pixels in from each end of a roll, and passes under both rolls.
"""

from pathlib import Path

from voxel_sprite import write_png

OUT = Path(__file__).resolve().parents[1] / "public" / "resources" / "hud" / "descriptor-scroll"

ROLL_END = 10
ROLL_TOP = 6
ROLL_BOTTOM = 4
ROLL_MIN = ROLL_TOP + 1 + ROLL_BOTTOM
HANDLE_WIDTH = 14
HANDLE_HEIGHT = 8
SHEET_INSET = 3
SHEET_BORDER = 2
SHADE = 2

INK = (22, 28, 46, 255)
MAUVE = (138, 103, 99, 255)
STRAW_SHADE = (175, 140, 121, 255)
STRAW = (227, 193, 140, 255)
CREAM = (245, 239, 169, 255)
FIBER = (214, 176, 128, 255)
SHADOW = (22, 28, 46, 79)
CLEAR = (0, 0, 0, 0)

TILE_WIDTH, TILE_HEIGHT = 32, 16

WOOD_DARK = (58, 36, 24, 255)
WOOD = (92, 58, 36, 255)
WOOD_LIGHT = (128, 84, 50, 255)
BRASS = (222, 190, 120, 255)
BRASS_DARK = (160, 122, 62, 255)

PALETTES = {
    "common": {},
}


def new(width, height, color=CLEAR):
    return [[color] * width for _ in range(height)]


def painter(pixels):
    def rect(x, y, w, h, color):
        for yy in range(max(y, 0), min(y + h, len(pixels))):
            for xx in range(max(x, 0), min(x + w, len(pixels[0]))):
                pixels[yy][xx] = color

    return rect


def roll_rows():
    """The color of each row of the cylinder between its two ink rows, and the ink rows around it."""
    return [INK, INK, CREAM, CREAM, STRAW, STRAW, STRAW, STRAW_SHADE, MAUVE, INK, INK]


def roll_strip(width, ends, palette):
    """A roll `width` wide, ROLL_MIN rows tall. `ends` are the knobs: (left, right)."""
    rows = roll_rows()
    pixels = new(width, len(rows))
    rect = painter(pixels)
    for y, color in enumerate(rows):
        rect(0, y, width, 1, color)
    return pixels


def knob(side, palette):
    """The end of a roll: a curled cap of parchment with a nail."""
    pixels = new(ROLL_END, ROLL_MIN)
    rect = painter(pixels)
    w, h = ROLL_END, ROLL_MIN
    rect(1, 0, w - 2, h, INK)
    rect(0, 1, w, h - 2, INK)
    rect(2, 2, w - 4, h - 4, STRAW_SHADE)
    rect(2, 2, w - 5, h - 5, CREAM)
    rect(4, 4, w - 7, h - 7, STRAW)
    rect(4, 4, 2, 2, INK)
    if side == "right":
        pixels = [row[::-1] for row in pixels]
    return pixels


def handle(side):
    """The dark wood rod the parchment is rolled on, sticking out of a roll's end: a brass tip on its outer end."""
    pixels = new(HANDLE_WIDTH, HANDLE_HEIGHT)
    rect = painter(pixels)
    w, h = HANDLE_WIDTH, HANDLE_HEIGHT
    rect(0, 0, w, h, INK)
    rect(0, 1, w - 1, 1, WOOD_LIGHT)
    rect(0, 2, w - 1, 3, WOOD)
    rect(0, 5, w - 1, 2, WOOD_DARK)
    for x in (w - 8, w - 11):
        rect(x, 1, 1, h - 2, WOOD_DARK)
    rect(w - 4, 1, 3, h - 2, BRASS_DARK)
    rect(w - 4, 1, 3, 3, BRASS)
    if side == "left":
        pixels = [row[::-1] for row in pixels]
    return pixels


def edge(side):
    width = SHEET_INSET + SHEET_BORDER + 2
    pixels = new(width, 1)
    rect = painter(pixels)
    if side == "left":
        rect(SHEET_INSET, 0, SHEET_BORDER, 1, INK)
        rect(SHEET_INSET + SHEET_BORDER, 0, 2, 1, STRAW)
    else:
        rect(0, 0, 2, 1, STRAW_SHADE)
        rect(2, 0, SHEET_BORDER, 1, INK)
    return pixels


def center_tile():
    pixels = new(TILE_WIDTH, TILE_HEIGHT, STRAW)
    rect = painter(pixels)
    for y in range(1, TILE_HEIGHT, 4):
        for x in range(2 + (y * 7) % 9, TILE_WIDTH - 8, 13 + (y % 5)):
            rect(x, y, 3 + (x * y) % 4, 1, FIBER)
    return pixels


def main():
    for rarity, palette in PALETTES.items():
        out = OUT / rarity
        out.mkdir(parents=True, exist_ok=True)
        pieces = {
            "roll-left": knob("left", palette),
            "roll": roll_strip(1, None, palette),
            "roll-right": knob("right", palette),
            "handle-left": handle("left"),
            "handle-right": handle("right"),
            "edge-left": edge("left"),
            "edge-right": edge("right"),
            "center": center_tile(),
            "shade": new(1, SHADE, STRAW_SHADE),
            "shadow": new(1, SHADE, SHADOW),
        }
        for name, pixels in pieces.items():
            write_png(out / f"{name}.png", pixels)
            print(f"wrote {(out / f'{name}.png').relative_to(OUT.parents[3])}")


if __name__ == "__main__":
    main()
