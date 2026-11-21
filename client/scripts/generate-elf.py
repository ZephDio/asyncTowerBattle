#!/usr/bin/env python3
"""Generates the elf (a blond chibi archer with big pointed ears) unit pixel art and its idle sprite sheet.

Run from anywhere: python3 scripts/generate-elf.py

Outputs public/resources/units/elf.png, and public/resources/units/elf.sheet.png with its json (see sprite_sheet.py).

It follows the dragon, brewmaster and go-goat units: a front-facing sprite upscaled 4x, flat colors with one or two
shades per part, light from the top left, and a near-black outline drawn around the silhouette. The sprite is hand
placed in SPRITE below (one character per pixel), the outline is added automatically on the transparent pixels around
it. The grid is 18x18: a big head with side braids, pointed ears, pale glowing eyes, a leaf collar, a green tunic with
a bow strap, and brown trousers and boots.

The sheet's frame 1 is elf.png. Frame 2 breathes out: the head and the tunic drop one sprite pixel (SQUEEZED_ROW, a
plain tunic row, is the one squeezed out) while the legs stay planted.
"""

from pathlib import Path

from sprite_sheet import breath_out, outline, to_pixels, write_sheet
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "elf.png"
SHEET = ROOT / "public" / "resources" / "units" / "elf.sheet.png"
SCALE = 4

PALETTE = {
    "#": (29, 29, 28, 255),  # outline, also the eyes' rim
    # Blond hair, from highlight to shade
    "H": (252, 228, 120, 255),
    "h": (226, 184, 72, 255),
    # Skin and its shade
    "S": (255, 205, 166, 255),
    "s": (232, 164, 128, 255),
    # Glowing pale eyes
    "W": (238, 246, 250, 255),
    # Tunic and leaf collar
    "G": (126, 190, 66, 255),
    "g": (74, 136, 54, 255),
    # Bow strap and trousers
    "L": (137, 94, 62, 255),
    "l": (96, 64, 44, 255),
    # Boots
    "O": (88, 78, 98, 255),
}

# Front facing. Hair covers the head with a side parting and two braids hanging at the sides, long ears point out and
# up, the eyes are pale with a dark top rim. The first and last rows and columns stay empty for the outline.
SPRITE = [
    "..................",
    ".....HHHHHHHH.....",
    "....HHHHHHHHHh....",
    ".S.HHHHHHHHHHHh.S.",
    ".SSHHHHHhHHHHHhSS.",
    ".SsHHHSHHHHSHHhsS.",
    "..SHSSSSSSSSSShS..",
    "...HS#WSSSSW#Sh...",
    "...HSWWSSSSWWSh...",
    "...HSSSSssSSSSh...",
    "...hh.SSSSSS.hh...",
    "...hh.gGgGgg.hh...",
    "...hhGGGGGGGGhh...",
    "....GGLGGGGGGg....",
    "....GGGLGGGGgg....",
    "....SGGGLGGGgS....",
    "......LLLLLLLL....",
    "......lll..lll....",
    "......OOO..OOO....",
    "..................",
]
SQUEEZED_ROW = 14


def main() -> None:
    width = len(SPRITE[0])
    assert all(len(row) == width for row in SPRITE), "every row must be as wide as the first"
    rest = outline(SPRITE, "#")
    write_png(OUTPUT, to_pixels(rest, PALETTE, scale=SCALE))
    write_sheet(
        SHEET,
        [("idle", [rest, outline(breath_out(SPRITE, SQUEEZED_ROW), "#")], 450)],
        PALETTE,
        scale=SCALE,
    )
    print(f"wrote {OUTPUT.relative_to(ROOT)}, {SHEET.relative_to(ROOT)} and its json")


if __name__ == "__main__":
    main()
