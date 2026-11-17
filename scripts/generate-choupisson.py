#!/usr/bin/env python3
"""Generates the choupisson (hedgehog) unit pixel art and its idle sprite sheet.

Run from anywhere: python3 scripts/generate-choupisson.py

Outputs public/resources/units/choupisson.png, and public/resources/units/choupisson.sheet.png with its json (see
sprite_sheet.py).

It follows the dragon unit: a 16x16 front-facing sprite upscaled 4x, flat colors with one or two shades per part,
light from the top left, and a near-black outline drawn around the silhouette. The sprite is hand placed in SPRITE
below (one character per pixel), the outline is added automatically on the transparent pixels around it.

The sheet's frame 1 is choupisson.png. Frame 2 breathes out: the quills and the face drop one sprite pixel
(SQUEEZED_ROW, a plain belly row under the face, is the one squeezed out) while the feet stay planted.
"""

from pathlib import Path

from sprite_sheet import breath_out, outline, to_pixels, write_sheet
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "choupisson.png"
SHEET = ROOT / "public" / "resources" / "units" / "choupisson.sheet.png"
SCALE = 4

PALETTE = {
    "#": (29, 29, 28, 255),  # outline, also the eyes and the nose
    # Quills, from highlight to shade
    "h": (196, 152, 104, 255),
    "m": (139, 98, 66, 255),
    "d": (92, 62, 48, 255),
    # Face and belly, light and shade
    "F": (255, 224, 189, 255),
    "f": (226, 178, 136, 255),
    # Blushing cheeks
    "p": (236, 128, 120, 255),
}

# A spiky dome of quills around a round face, small feet under the belly.
# The first and last rows and columns stay empty for the outline.
SPRITE = [
    "................",
    "................",
    "....h.h.m.m.....",
    "...mhmhmmdmdm...",
    "..hmhmhmmdmdmd..",
    ".hhmhmhmmdmdmdd.",
    "..hmhmFFFFmdmd..",
    ".hhmhFFFFFFdmdd.",
    "..hmF#FFFF#Fmd..",
    ".hhmF#FFFF#Fmdd.",
    "..hmpFF##FFpmd..",
    ".hhmFFFFFFFFmdd.",
    "..hmfFFFFFFfmd..",
    "...mffffffffd...",
    "....ff....ff....",
    "................",
]
SQUEEZED_ROW = 11


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
