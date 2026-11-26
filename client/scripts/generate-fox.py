#!/usr/bin/env python3
"""Generates the fox unit pixel art and its idle sprite sheet.

Run from anywhere: python3 scripts/generate-fox.py

Outputs public/resources/units/fox/fox.png, and public/resources/units/fox/fox.sheet.png with its json (see sprite_sheet.py).

REST is the original 16x13 fox, one character per pixel, outline included. It used to ship at 1x and looked blurry
once stretched on the board, so it is now upscaled 4x with nearest neighbor like the dragon: every original pixel
becomes a 4x4 block, nothing is redrawn.

The sheet's frame 1 is fox.png. Frame 2 breathes out: every row above the belly drops one sprite pixel (row 8, a
plain body row, is the one squeezed out) so the head and back bob down while the legs stay planted.
"""

from pathlib import Path

from sprite_sheet import breath_out, to_pixels, write_sheet
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "fox" / "fox.png"
SHEET = ROOT / "public" / "resources" / "units" / "fox" / "fox.sheet.png"
SCALE = 4

PALETTE = {
    "a": (29, 29, 28, 255),  # outline
    "b": (227, 230, 255, 255),
    "c": (179, 185, 209, 255),
    "d": (255, 255, 255, 255),
    "e": (234, 234, 232, 255),
    "f": (206, 202, 201, 255),
    "g": (95, 95, 110, 255),
    "h": (171, 175, 185, 255),
    "i": (123, 131, 130, 255),
}

REST = [
    ".........a...a..",
    "........abaaaba.",
    "........acdddca.",
    "........aeedeea.",
    ".......affaeaffa",
    "...aaaaagbfefba.",
    "..addddddgbaba..",
    ".adeffffffggga..",
    "adgfhfffhffffa..",
    "adgfiiiihfccfa..",
    "adghghgaghggha..",
    ".aahgha.ahaaha..",
    "...afafa.afaafa.",
]
SQUEEZED_ROW = 8


def main() -> None:
    write_png(OUTPUT, to_pixels(REST, PALETTE, scale=SCALE))
    write_sheet(SHEET, [("idle", [REST, breath_out(REST, SQUEEZED_ROW)], 450)], PALETTE, scale=SCALE)
    print(f"wrote {OUTPUT.relative_to(ROOT)}, {SHEET.relative_to(ROOT)} and its json")


if __name__ == "__main__":
    main()
