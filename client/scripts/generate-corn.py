#!/usr/bin/env python3
"""Generates the corn icon used for food.

Run from anywhere: python3 scripts/generate-corn.py

Outputs public/resources/icons/corn.png.

It follows the unit style (see generate-ent.py) and the gold and health icons: a 16x16 sprite upscaled 4x, flat
colors with one or two shades per part, light from the top left, and the icons' dark ink outline drawn around the
silhouette. The sprite is hand placed in SPRITE below (one character per pixel), the outline is added automatically
on the transparent pixels around it.
"""

from pathlib import Path

from sprite_sheet import outline, to_pixels
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "icons" / "corn.png"
SCALE = 4

OUTLINE = (24, 20, 37, 255)
PALETTE = {
    # Kernels, the gold coin's yellows plus a shade
    "Y": (254, 231, 97, 255),
    "y": (254, 174, 52, 255),
    "o": (205, 112, 38, 255),
    # Silk
    "s": (240, 214, 150, 255),
    # Husk leaves, from highlight to shade
    "H": (156, 219, 67, 255),
    "L": (89, 193, 53, 255),
    "M": (20, 160, 46, 255),
    "D": (26, 122, 62, 255),
    "K": OUTLINE,
}

# An ear of corn leaning right, its tip and silk at the top right, wrapped at the bottom left in husk leaves that
# peel open on both sides. The first and last rows and columns stay empty for the outline.
SPRITE = [
    "................",
    "............ss..",
    "..........Yyos..",
    ".........YyYyo..",
    "........YyYyYo..",
    ".......YyYyYoo..",
    "......YyYyYoo...",
    "..H..YyYyYoo....",
    "..HL.YYyYoo.LH..",
    "..LMLYyYyYoLML..",
    "...LMLYyYoLMD...",
    "...LMMLoLMMD....",
    "....DMMLMMD.....",
    "....DDMMMD......",
    "...DD.DD........",
    "................",
]


def main() -> None:
    assert all(len(row) == len(SPRITE) for row in SPRITE), "every row must be as long as the sprite is tall"
    write_png(OUTPUT, to_pixels(outline(SPRITE, "K"), PALETTE, scale=SCALE))
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
