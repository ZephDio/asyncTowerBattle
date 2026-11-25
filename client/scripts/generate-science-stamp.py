#!/usr/bin/env python3
"""Generates the blank science stamp, the reference every science icon is derived from.

Run from anywhere: python3 scripts/generate-science-stamp.py

Outputs public/resources/icons/science-stamp.png.

A science is a token an army holds (see docs/game-design.md), drawn as a wax seal. This is the seal with no emblem:
a raised cyan rim, two pixels wide, around a recessed, empty face. A science icon is this stamp with a small emblem
pressed in the face (the 10x10 pixels inside the rim), in the lighter cyan. It follows the corn and gold coin icons (see
generate-corn.py): a 16x16 sprite upscaled 4x, flat colors with a couple of shades, light from the top left, and the
icons' dark ink outline drawn around the silhouette.
"""

from pathlib import Path

from sprite_sheet import outline, to_pixels
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "icons" / "science-stamp.png"
SCALE = 4

OUTLINE = (24, 20, 37, 255)
PALETTE = {
    # Raised wax, from the lit rim to the shaded one
    "W": (200, 250, 255, 255),
    "C": (79, 214, 232, 255),
    "c": (36, 148, 190, 255),
    "d": (22, 98, 146, 255),
    # Recessed face: its top left edge is in the rim's shadow, its bottom right edge catches the light
    "F": (38, 128, 176, 255),
    "s": (22, 98, 146, 255),
    "w": (130, 232, 244, 255),
    "K": OUTLINE,
}

# The rim is two pixels wide all around, lit on the top left and shaded on the bottom right. The first and last rows and
# columns stay empty for the outline.
SPRITE = [
    "................",
    ".....WWWWCC.....",
    "...WWCCCCCCCc...",
    "..WCCFFFFFFCCc..",
    "..WCFFFFFFFFCc..",
    ".WCFFFFFFFFFFCc.",
    ".WCFFFFFFFFFFCc.",
    ".WCFFFFFFFFFFcc.",
    ".WCFFFFFFFFFFcd.",
    ".CCFFFFFFFFFFcd.",
    ".CcFFFFFFFFFFcd.",
    "..CcFFFFFFFFcd..",
    "..CccFFFFFFccd..",
    "...Ccccccccdd...",
    ".....ccdddd.....",
    "................",
]


def main() -> None:
    assert all(len(row) == len(SPRITE) for row in SPRITE), "every row must be as long as the sprite is tall"
    write_png(OUTPUT, to_pixels(outline(SPRITE, "K"), PALETTE, scale=SCALE))
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
