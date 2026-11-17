#!/usr/bin/env python3
"""Generates the Go-Goat (a two headed mountain goat) unit pixel art and its idle sprite sheet.

Run from anywhere: python3 scripts/generate-go-goat.py

Outputs public/resources/units/go-goat.png, and public/resources/units/go-goat.sheet.png with its json (see
sprite_sheet.py).

It follows the dragon unit: a sprite upscaled 4x, flat colors with one or two shades per part, light from the top
left, and a near-black outline drawn around the silhouette. The sprite is hand placed in SPRITE below (one character
per pixel), the outline is added automatically on the transparent pixels around it. The grid is 23x22, bigger than
the dragon's 16, to fit two horned heads side by side above the body.

The sheet's frame 1 is go-goat.png. Frame 2 breathes out: the heads, the necks and the back drop one sprite pixel
(SQUEEZED_ROW, a plain body row above the belly, is the one squeezed out) while the legs stay planted.
"""

from pathlib import Path

from sprite_sheet import breath_out, outline, to_pixels, write_sheet
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "go-goat.png"
SHEET = ROOT / "public" / "resources" / "units" / "go-goat.sheet.png"
SCALE = 4

PALETTE = {
    "#": (29, 29, 28, 255),  # outline, also the nostrils
    # Shaggy grey-brown fur, from highlight to shade
    "F": (176, 158, 136, 255),
    "f": (132, 114, 96, 255),
    "d": (92, 78, 68, 255),
    # Cream muzzle, beards and belly
    "C": (240, 226, 196, 255),
    "c": (204, 184, 148, 255),
    # Curled horns, bone light and shade
    "A": (226, 210, 172, 255),
    "a": (170, 146, 112, 255),
    # Monster eyes: the dragon's amber
    "Y": (241, 147, 25, 255),
    # Hooves
    "O": (88, 78, 98, 255),
}

# Seen from the side like the white stag, two necks rising from the front of the body, both heads turned to the
# camera. Each head carries two horns sweeping up and out, side ears, amber eyes and a cream beard. Near legs in the
# fur color, the hind one bent at the hock, far legs as 1px lines in the shade step.
# The first and last rows and columns stay empty for the outline.
SPRITE = [
    ".............A.....A...",
    "...A.....A...aA...Aa...",
    "...aA...Aa....aA.Aa....",
    "....aA.Aa...dfFFFFFfd..",
    "..dfFFFFFfd...FYFYf....",
    "....FYFYf.....fFFFf....",
    "....fFFFf......CCc.....",
    ".....CCc.......#C#.....",
    ".....#C#.......cCc.....",
    ".....cCc.......fFf.....",
    "......fFf......fFf.....",
    "..FF...fFf...fFFf......",
    "..fFFFFfFFFFFFFFf......",
    "..dfFFFFFFFFFFFFf......",
    "..dfFFFFFFFFFFFFf......",
    "...dfffFffffffFf.......",
    "...dfCCCCCCCCcdf.......",
    "....dF.d..d..Ff........",
    "...dF..d..d..Ff........",
    "...dF..d..d..fF........",
    "...OO..O..O..OO........",
    ".......................",
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
