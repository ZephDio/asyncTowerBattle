#!/usr/bin/env python3
"""Generates the gold coin icon used for gold.

Run from anywhere: python3 scripts/generate-gold-coin.py

Outputs public/resources/icons/gold.png.

It follows the corn icon (see generate-corn.py): a 16x16 sprite upscaled 4x, flat colors with one or two shades per
part, light from the top left, and the icons' dark ink outline drawn around the silhouette. The sprite is hand placed
in SPRITE below (one character per pixel), the outline is added automatically on the transparent pixels around it.
"""

from pathlib import Path

from sprite_sheet import outline, to_pixels
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "icons" / "gold.png"
SCALE = 4

OUTLINE = (24, 20, 37, 255)
PALETTE = {
    # Gold, the old coin's yellows with the corn's orange shade and the pattern star's highlight
    "W": (255, 246, 170, 255),
    "G": (254, 231, 97, 255),
    "g": (254, 174, 52, 255),
    "o": (205, 112, 38, 255),
    "K": OUTLINE,
}

# A round coin seen face on: a raised rim lit on the top left and shaded on the bottom right, a recessed face with a
# shine, and an embossed disc in the middle. The first and last rows and columns stay empty for the outline.
SPRITE = [
    "................",
    "......GGGG......",
    "....GGGGGGGg....",
    "...GGoooooogg...",
    "..GGoWgggggggg..",
    "..GoWggGGggggo..",
    ".GGoggGWWogggoo.",
    ".GGogGWWWWogGoo.",
    ".GGogGWWWWogGoo.",
    ".GGoggoWWoggGoo.",
    "..GogggoogggGo..",
    "..gggggggggGoo..",
    "...ggggGGGGoo...",
    "....gooooooo....",
    "......oooo......",
    "................",
]


def main() -> None:
    assert all(len(row) == len(SPRITE) for row in SPRITE), "every row must be as long as the sprite is tall"
    write_png(OUTPUT, to_pixels(outline(SPRITE, "K"), PALETTE, scale=SCALE))
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
