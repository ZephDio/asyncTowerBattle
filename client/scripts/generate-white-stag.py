#!/usr/bin/env python3
"""Generates the white stag unit pixel art.

Run from anywhere: python3 scripts/generate-white-stag.py

Outputs, in public/resources/units/:
- white-stag.png: the stag with both antlers, from full health down to 50%.
- white-stag-one-antler.png: the same stag once it has dropped its left antler, a stump left on its head.
- white-stag-antler.png: the dropped antler lying on the ground, drawn by the FallenAntler area effect.
- white-stag.sheet.png and white-stag-one-antler.sheet.png, with their json: the idle sheets of the two stags (see
  sprite_sheet.py).
Everything is cut from SPRITE, so the images stay in sync.

It follows the dragon unit: a sprite upscaled 4x, flat colors with one or two shades per part, light from the top
left, and a near-black outline drawn around the silhouette. The sprite is hand placed in SPRITE
below (one character per pixel), the outline is added automatically on the transparent pixels around it. The grid
is 23x23, bigger than the dragon's 16, to fit the antlers' crown above a long neck.

Each sheet's frame 1 is its still image. Frame 2 breathes out: the antlers, the head, the neck and the back drop one
sprite pixel (SQUEEZED_ROW, a plain body row above the belly, is the one squeezed out) while the legs stay planted.
"""

from pathlib import Path

from sprite_sheet import Frame, breath_out, outline, to_pixels, write_sheet
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
UNITS = ROOT / "public" / "resources" / "units"
SCALE = 4

PALETTE = {
    "#": (29, 29, 28, 255),  # outline, also the nose
    # White fur, from highlight to shade
    "W": (246, 246, 242, 255),
    "w": (208, 212, 226, 255),
    "g": (150, 156, 180, 255),
    # Inner ears
    "p": (232, 160, 160, 255),
    # Cream throat, muzzle and belly
    "C": (244, 228, 190, 255),
    "c": (214, 190, 148, 255),
    # Antlers, bone light and shade
    "A": (226, 210, 172, 255),
    "a": (170, 146, 112, 255),
    # Forest magic: the glowing antler tips, the towers' mint
    "M": (143, 226, 185, 255),
    # Hooves
    "O": (88, 78, 98, 255),
}

# Seen from the side like the fox, head turned to the camera so both antlers show. Each antler has three tines
# (outer, main and brow) on a curved beam, shaded underneath, with glowing tips. A long neck with a cream throat,
# a cream belly stripe, near legs in white with a bent hind leg, far legs as 1px lines in the shade step.
# The first and last rows and columns stay empty for the outline.
SPRITE = [
    ".......................",
    "......M..M........M..M.",
    "......A..A.M....M.A..A.",
    "......AA.A.A....A.A.AA.",
    ".......aAA.A....A.AAa..",
    ".........aAA....AAa....",
    "...........a....a......",
    "........wWpWWWWWWpWw...",
    ".........wpW#WW#Wpw....",
    "...........wWWWWw......",
    "............CCCc.......",
    "............c##c.......",
    "...........wWCCw.......",
    "..WW.......wWCCw.......",
    "..wWWWWWWWWWWWCw.......",
    "..gwWwWWWWWWWWCw.......",
    "...gwwWwwwwwwwCw.......",
    "...gwCCCCCCCwgw........",
    "....gW.g..g..Ww........",
    "...gW..g..g..Ww........",
    "...gW..g..g..wW........",
    "...OO..O..O..OO........",
    ".......................",
]
SQUEEZED_ROW = 15

# The left antler: rows 1 to 5 up to this column, plus the stem under it in row 6, kept as the stump.
LEFT_ANTLER_ROWS = range(1, 6)
LEFT_ANTLER_END = 12
STUMP_ROW = 6


def without_left_antler(sprite: Frame) -> Frame:
    return ["." * LEFT_ANTLER_END + row[LEFT_ANTLER_END:] if y in LEFT_ANTLER_ROWS else row for y, row in enumerate(sprite)]


def left_antler(sprite: Frame) -> Frame:
    """The antler with its stem, one empty column on each side and one empty row under it for the outline."""
    antler = [row[5 : LEFT_ANTLER_END + 1] for row in sprite[: STUMP_ROW + 1]]
    return antler + ["." * len(antler[0])]


def write(name: str, sprite: Frame) -> None:
    path = UNITS / name
    write_png(path, to_pixels(outline(sprite, "#"), PALETTE, scale=SCALE))
    print(f"wrote {path.relative_to(ROOT)}")


def write_idle_sheet(name: str, sprite: Frame) -> None:
    path = UNITS / name
    frames = [outline(sprite, "#"), outline(breath_out(sprite, SQUEEZED_ROW), "#")]
    write_sheet(path, [("idle", frames, 450)], PALETTE, scale=SCALE)
    print(f"wrote {path.relative_to(ROOT)} and its json")


def main() -> None:
    assert all(len(row) == len(SPRITE[0]) for row in SPRITE), "every row must have the same length"
    write("white-stag.png", SPRITE)
    write("white-stag-one-antler.png", without_left_antler(SPRITE))
    write("white-stag-antler.png", left_antler(SPRITE))
    write_idle_sheet("white-stag.sheet.png", SPRITE)
    write_idle_sheet("white-stag-one-antler.sheet.png", without_left_antler(SPRITE))


if __name__ == "__main__":
    main()
