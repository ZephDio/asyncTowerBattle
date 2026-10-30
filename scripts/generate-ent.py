#!/usr/bin/env python3
"""Generates the ent (tree folk) unit pixel art.

Run from anywhere: python3 scripts/generate-ent.py

Outputs public/resources/units/ent.png.

It follows the dragon unit: a 16x16 front-facing sprite upscaled 4x, flat colors with one or two shades per part,
light from the top left, and a near-black outline drawn around the silhouette. The sprite is hand placed in
SPRITE below (one character per pixel), the outline is added automatically on the transparent pixels around it.
"""

from pathlib import Path

from voxel_sprite import TRANSPARENT, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "ent.png"
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


def main() -> None:
    size = len(SPRITE)
    assert all(len(row) == size for row in SPRITE), "every row must be as long as the sprite is tall"
    pixels = [[PALETTE[c] if c != "." else TRANSPARENT for c in row] for row in SPRITE]
    for y in range(size):
        for x in range(size):
            if SPRITE[y][x] != ".":
                continue
            neighbors = [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
            if any(0 <= nx < size and 0 <= ny < size and SPRITE[ny][nx] != "." for nx, ny in neighbors):
                pixels[y][x] = OUTLINE
    scaled = [[pixel for pixel in row for _ in range(SCALE)] for row in pixels for _ in range(SCALE)]
    write_png(OUTPUT, scaled)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
