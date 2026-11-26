#!/usr/bin/env python3
"""Generates the brewmaster (a tipsy gnome) unit pixel art and its idle sprite sheet.

Run from anywhere: python3 scripts/generate-brewmaster.py

Outputs public/resources/units/brewmaster/brewmaster.png, and public/resources/units/brewmaster/brewmaster.sheet.png with its json (see
sprite_sheet.py).

It follows the dragon unit: a 16x16 front-facing sprite upscaled 4x, flat colors with one or two shades per part,
light from the top left, and a near-black outline drawn around the silhouette. The sprite is hand placed in SPRITE
below (one character per pixel), the outline is added automatically on the transparent pixels around it.

The sheet's frame 1 is brewmaster.png. Frame 2 breathes out: the cap, the face, the beard and the raised bottle drop
one sprite pixel (SQUEEZED_ROW, a plain trouser row under the belt, is the one squeezed out) while the boots stay
planted.
"""

from pathlib import Path

from sprite_sheet import breath_out, outline, to_pixels, write_sheet
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "brewmaster" / "brewmaster.png"
SHEET = ROOT / "public" / "resources" / "units" / "brewmaster" / "brewmaster.sheet.png"
SCALE = 4

PALETTE = {
    "#": (29, 29, 28, 255),  # outline, also the eyes
    # Cap, from highlight to shade
    "R": (238, 96, 64, 255),
    "r": (184, 52, 42, 255),
    # Skin and the red drinker's nose
    "S": (255, 205, 166, 255),
    "N": (232, 116, 100, 255),
    # Beard
    "W": (240, 240, 232, 255),
    # Shirt
    "B": (83, 161, 214, 255),
    "b": (51, 112, 168, 255),
    # Belt
    "L": (137, 94, 62, 255),
    # Trousers
    "G": (126, 190, 66, 255),
    "g": (74, 136, 54, 255),
    # Boots
    "O": (88, 78, 98, 255),
    # Bottle: the dragon's amber, and a cream label
    "Y": (241, 147, 25, 255),
    "y": (186, 57, 0, 255),
    "c": (255, 236, 200, 255),
}

# A pointy cap, a winking face over a big beard, a bottle raised in the right hand, short legs and boots.
# The first and last rows and columns stay empty for the outline.
SPRITE = [
    "................",
    ".......RR.......",
    "..y...RRRr......",
    ".YY..RRRRRr.....",
    ".cY.rrrrrrrrr...",
    ".cY..S##SS#S....",
    ".YY.WSSNNNSSW...",
    ".SS.WWWNNNWWW...",
    ".SBBWWWWWWWWWBb.",
    "..bBBWWWWWWWBBb.",
    "..bBBBWWWWWBBbS.",
    "...LLLLLLLLLL...",
    "...GGGGGGGGgg...",
    "...GGGg..GGgg...",
    "..OOOO...OOOO...",
    "................",
]
SQUEEZED_ROW = 12


def main() -> None:
    assert all(len(row) == len(SPRITE) for row in SPRITE), "every row must be as long as the sprite is tall"
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
