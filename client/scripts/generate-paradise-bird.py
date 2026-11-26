#!/usr/bin/env python3
"""Generates the paradise bird (a bird person with colorful feathers) unit pixel art and its idle sprite sheet.

Run from anywhere: python3 scripts/generate-paradise-bird.py

Outputs public/resources/units/paradise-bird/paradise-bird.png, and public/resources/units/paradise-bird/paradise-bird.sheet.png with its json
(see sprite_sheet.py).

It follows the dragon unit: a sprite upscaled 4x, flat colors with one or two shades per part, light from the top
left, and a near-black outline drawn around the silhouette. The sprite is hand placed in SPRITE below (one character
per pixel), the outline is added automatically on the transparent pixels around it. The grid is 20x19, a bit bigger
than the dragon's 16, to fit the crest and the spread wings.

The sheet's frame 1 is paradise-bird.png. Frame 2 breathes out: the crest, the head, the wings and the body drop one
sprite pixel (SQUEEZED_ROW, the thighs under the feather skirt, is the one squeezed out) while the feet stay planted.
"""

from pathlib import Path

from sprite_sheet import breath_out, outline, to_pixels, write_sheet
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "paradise-bird" / "paradise-bird.png"
SHEET = ROOT / "public" / "resources" / "units" / "paradise-bird" / "paradise-bird.sheet.png"
SCALE = 4

PALETTE = {
    "#": (29, 29, 28, 255),  # outline, also the eyes
    # Skin
    "S": (255, 205, 166, 255),
    # Beak and bird legs: the dragon's amber
    "A": (241, 147, 25, 255),
    "a": (186, 57, 0, 255),
    # Feathers, each with its shade for the right side
    "M": (226, 68, 140, 255),
    "m": (160, 40, 100, 255),
    "Y": (250, 206, 60, 255),
    "T": (52, 190, 180, 255),
    "t": (30, 130, 140, 255),
    "B": (70, 120, 220, 255),
    "b": (44, 76, 160, 255),
    "G": (126, 190, 66, 255),
    "g": (74, 136, 54, 255),
}

# Facing the camera like the brewmaster: a fanned crest of yellow, teal and magenta plumes, a human face framed by
# magenta feathers with a small beak, wings for arms drooping like sleeves in blue, teal and yellow bands with magenta
# tips, a green tunic with a yellow bib, a magenta feather skirt and thin amber bird legs.
# The first and last rows and columns stay empty for the outline.
SPRITE = [
    "....................",
    "....YY.TTMMTt.YY....",
    ".....YYTMMMMtYY.....",
    "......YTMMMMtY......",
    "......MMMMMMmm......",
    ".....MSSSSSSSSm.....",
    ".....MS#SSSS#Sm.....",
    ".....MSSSAASSSm.....",
    "......SSSaaSSS......",
    "....BBBGGGGGgbbb....",
    "...BBBTGYYYYgtbbb...",
    "..BBTTTGYYYYgtttbb..",
    "..BTTYYGGYYGgYYttb..",
    "..TYY.MGGGGGgm.YYt..",
    "..YM..MMMMMMmm..mY..",
    "......MA....am......",
    ".......A....a.......",
    "......AA....aa......",
    "....................",
]
SQUEEZED_ROW = 15


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
