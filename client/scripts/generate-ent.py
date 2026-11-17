#!/usr/bin/env python3
"""Generates the ent (tree folk) unit pixel art.

Run from anywhere: python3 scripts/generate-ent.py

Outputs public/resources/units/ent.png, and public/resources/units/ent.sheet.png with its json (see sprite_sheet.py).

It follows the dragon unit: a 16x16 front-facing sprite upscaled 4x, flat colors with one or two shades per part,
light from the top left, and a near-black outline drawn around the silhouette. The sprite is hand placed in
SPRITE below (one character per pixel), the outline is added automatically on the transparent pixels around it.

The sheet's frame 1 is ent.png. Frame 2 breathes out: the crown, the face and the branch arms drop one sprite pixel
(SQUEEZED_ROW, a plain trunk row under the mouth, is the one squeezed out) while the root legs stay planted.
"""

from pathlib import Path

from sprite_sheet import breath_out, outline, to_pixels, write_sheet
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "ent.png"
SHEET = ROOT / "public" / "resources" / "units" / "ent.sheet.png"
SCALE = 4

OUTLINE = (29, 29, 28, 255)
PALETTE = {
    # Leaves, from highlight to shade
    "H": (164, 214, 110, 255),
    "L": (98, 178, 80, 255),
    "M": (52, 130, 72, 255),
    "D": (33, 82, 57, 255),
    # Bark, from light to dark
    "l": (181, 138, 90, 255),
    "m": (137, 94, 62, 255),
    "b": (92, 60, 44, 255),
    # Glowing eyes, the dragon's amber
    "E": (241, 147, 25, 255),
    "K": OUTLINE,
}

# A leafy crown, a bark body with a face, branch arms ending in leaf tufts, and root legs.
# The first and last rows and columns stay empty for the outline.
SPRITE = [
    "................",
    "....DLHHLLMD....",
    "...DLHHLLMMMD...",
    "..DLHHLMMMLMMD..",
    "..LMMMMDMMMDMD..",
    "..DMMDDMMDDMDD..",
    ".HL.DbmllmbD.LH.",
    ".LM.bbmlmmbb.ML.",
    ".MDbmEmlmmEmbDM.",
    "..bbmmlmmmmmbb..",
    "....bmlKKKmb....",
    "....bmlmmmmb....",
    "....bmlmmmmb....",
    "....bml..mmb....",
    "...bbm....mbb...",
    "................",
]
SQUEEZED_ROW = 11


def main() -> None:
    assert all(len(row) == len(SPRITE) for row in SPRITE), "every row must be as long as the sprite is tall"
    rest = outline(SPRITE, "K")
    write_png(OUTPUT, to_pixels(rest, PALETTE, scale=SCALE))
    write_sheet(
        SHEET,
        [("idle", [rest, outline(breath_out(SPRITE, SQUEEZED_ROW), "K")], 450)],
        PALETTE,
        scale=SCALE,
    )
    print(f"wrote {OUTPUT.relative_to(ROOT)}, {SHEET.relative_to(ROOT)} and its json")


if __name__ == "__main__":
    main()
