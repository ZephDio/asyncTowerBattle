#!/usr/bin/env python3
"""Generates the heart container icon used for the castle's health.

Run from anywhere: python3 scripts/generate-heart-container.py

Outputs public/resources/icons/heart-container.png and public/resources/icons/heart-container-empty.png, the same container
with a dark hollow in place of the heart (EMPTY_PALETTE).

It follows the corn icon (see generate-corn.py): a 16x16 sprite upscaled 4x, flat colors with one or two shades per
part, light from the top left, and the icons' dark ink outline drawn around the silhouette. The sprite is hand placed
in SPRITE below (one character per pixel), the outline is added automatically on the transparent pixels around it.
"""

from pathlib import Path

from sprite_sheet import outline, to_pixels
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "icons" / "heart-container.png"
EMPTY_OUTPUT = ROOT / "public" / "resources" / "icons" / "heart-container-empty.png"
SCALE = 4

OUTLINE = (24, 20, 37, 255)
PALETTE = {
    # Gold rim, the gold coin's yellows
    "G": (254, 231, 97, 255),
    "g": (254, 174, 52, 255),
    # Heart, the old health icon's reds plus a glint
    "W": (255, 240, 240, 255),
    "P": (246, 117, 122, 255),
    "R": (255, 0, 68, 255),
    "r": (158, 40, 53, 255),
    "K": OUTLINE,
}
# The empty container keeps its rim, the heart turns into a dark violet hollow with a dim glint.
EMPTY_PALETTE = {
    **PALETTE,
    "W": (112, 98, 128, 255),
    "P": (84, 70, 102, 255),
    "R": (60, 48, 78, 255),
    "r": (42, 34, 56, 255),
}

# A red heart held in a gold rim, lit on its top and left sides, with a glint on the left lobe.
# The first and last rows and columns stay empty for the outline.
SPRITE = [
    "................",
    "................",
    "..GGGG....GGGG..",
    ".GPWRRG..GRRRrg.",
    ".GWPRRRGGRRRRrg.",
    ".GPRRRRRRRRRrrg.",
    ".GRRRRRRRRRRrrg.",
    ".gRRRRRRRRRrrrg.",
    "..gRRRRRRRRrrg..",
    "...grRRRRRrrg...",
    "....grRRRrrg....",
    ".....grrrrg.....",
    "......grrg......",
    ".......gg.......",
    "................",
    "................",
]


def main() -> None:
    assert all(len(row) == len(SPRITE) for row in SPRITE), "every row must be as long as the sprite is tall"
    sprite = outline(SPRITE, "K")
    write_png(OUTPUT, to_pixels(sprite, PALETTE, scale=SCALE))
    write_png(EMPTY_OUTPUT, to_pixels(sprite, EMPTY_PALETTE, scale=SCALE))
    print(f"wrote {OUTPUT.relative_to(ROOT)} and {EMPTY_OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
