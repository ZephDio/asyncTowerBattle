#!/usr/bin/env python3
"""Generates the dwarf (a stocky helmeted dwarf with a big orange beard) unit pixel art and its idle sprite sheet.

Run from anywhere: python3 scripts/generate-dwarf.py

Outputs public/resources/units/dwarf.png, and public/resources/units/dwarf.sheet.png with its json (see sprite_sheet.py).

It follows the dragon, brewmaster and go-goat units: a front-facing sprite upscaled 4x, flat colors with one or two
shades per part, light from the top left, and a near-black outline drawn around the silhouette. The sprite is hand
placed in SPRITE below (one character per pixel), the outline is added automatically on the transparent pixels around
it. The grid is 18x17: a steel helmet, a big orange beard, a blue-grey tunic with a belt, and brown trousers and boots.

The sheet's frame 1 is dwarf.png. Frame 2 breathes out: the head and the tunic drop one sprite pixel (SQUEEZED_ROW, a
plain tunic row, is the one squeezed out) while the legs stay planted.
"""

from pathlib import Path

from sprite_sheet import breath_out, outline, to_pixels, write_sheet
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "dwarf.png"
SHEET = ROOT / "public" / "resources" / "units" / "dwarf.sheet.png"
SCALE = 4

PALETTE = {
    "#": (29, 29, 28, 255),  # outline, also the eyes
    # Steel helmet, from highlight to shade, and its dark nose guard
    "H": (140, 152, 172, 255),
    "h": (96, 108, 128, 255),
    "k": (70, 78, 96, 255),
    "r": (206, 212, 220, 255),
    # Pale brim
    "B": (214, 196, 170, 255),
    # Skin and the round nose
    "S": (255, 205, 166, 255),
    "N": (236, 150, 130, 255),
    # Orange beard, from highlight to shade
    "O": (244, 124, 36, 255),
    "o": (200, 84, 24, 255),
    # Arms
    "A": (128, 104, 96, 255),
    # Tunic
    "T": (92, 108, 132, 255),
    "t": (64, 78, 102, 255),
    # Belt and its buckle
    "L": (137, 94, 62, 255),
    "Y": (241, 147, 25, 255),
    # Trousers and boots
    "l": (84, 64, 52, 255),
    "K": (58, 44, 38, 255),
}

# Front facing and stocky. A steel helmet with a nose guard and rivets, a pale brim over small dark eyes, a round nose
# and a big orange beard hiding the chest, thin arms hanging along the body, a belt, and short legs. The first and last rows
# and columns stay empty for the outline.
SPRITE = [
    "..................",
    ".....HHHHHHHH.....",
    "....HHHHHHHHHh....",
    "...HHHHHkkHHHHh...",
    "...HHHHHkrHHHHh...",
    "..BBBBBBkkBBBBBB..",
    "...SS#SSkkSS#SS...",
    "...OOOONNOOOOoo...",
    "...OOOOoOOoOOoo...",
    "....AOOOOOOOOA....",
    "....AOOoOOoOOA....",
    "....ATOOOOooTA....",
    "....STTOOooTtS....",
    "....LLLLYYLLLL....",
    "....llll..llll....",
    "....KKKK..KKKK....",
    "..................",
]
SQUEEZED_ROW = 12


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
