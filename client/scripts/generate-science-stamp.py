#!/usr/bin/env python3
"""Generates the blank science stamp, the reference every science icon is derived from.

Run from anywhere: python3 scripts/generate-science-stamp.py

Outputs, in public/resources/icons/:
- science-stamp.png: the blank cyan stamp.
- science-elf.png: the same stamp in green with a minimalist elf head pressed in its face.
- science-dwarf.png: the same stamp in copper with a minimalist helmeted, bearded dwarf head pressed in its face.

A science is a token an army holds (see docs/game-design.md), drawn as a wax seal. This is the seal with no emblem:
a raised cyan rim, two pixels wide, around a recessed, empty face. A science icon is this stamp with a small emblem
pressed in the face (the 10x10 pixels inside the rim), in the stamp's lightest shade, 10x7 at most. It follows the corn and gold coin icons (see
generate-corn.py): a 16x16 sprite upscaled 4x, flat colors with a couple of shades, light from the top left, and the
icons' dark ink outline drawn around the silhouette.
"""

from pathlib import Path

from sprite_sheet import outline, to_pixels
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public" / "resources" / "icons"
SCALE = 4

OUTLINE = (24, 20, 37, 255)
CYAN = {
    # Raised wax, from the lit rim to the shaded one
    "W": (200, 250, 255, 255),
    "C": (79, 214, 232, 255),
    "c": (36, 148, 190, 255),
    "d": (22, 98, 146, 255),
    # Recessed face: its top left edge is in the rim's shadow, its bottom right edge catches the light
    "F": (38, 128, 176, 255),
    "s": (22, 98, 146, 255),
    "w": (130, 232, 244, 255),
    "E": (200, 250, 255, 255),
    "K": OUTLINE,
}

# Each science tints the stamp: the same shades of its own hue.
GREEN = {
    **CYAN,
    "W": (214, 255, 190, 255),
    "C": (120, 214, 84, 255),
    "c": (58, 150, 62, 255),
    "d": (30, 98, 56, 255),
    "F": (36, 112, 58, 255),
    "s": (30, 98, 56, 255),
    "w": (170, 238, 130, 255),
    "E": (206, 250, 160, 255),
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


DWARF = {
    **CYAN,
    "W": (255, 226, 170, 255),
    "C": (226, 142, 62, 255),
    "c": (166, 88, 46, 255),
    "d": (104, 56, 40, 255),
    "F": (98, 54, 42, 255),
    "s": (104, 56, 40, 255),
    "w": (240, 182, 104, 255),
    "E": (255, 222, 176, 255),
    "h": (186, 196, 214, 255),
    "b": (248, 190, 96, 255),
}

# A minimalist elf head: pointed ears reaching up on both sides of a face with two eyes (F, the face showing through).
# The emblem is placed by its top left pixel in the sprite.
ELF_HEAD = [
    "...EEEE...",
    "E..EEEE..E",
    "EEEEEEEEEE",
    "..EFEEFE..",
    "...EEEE...",
    "....EE....",
]
ELF_HEAD_AT = (3, 5)

# A minimalist dwarf head: a steel helmet, a light face with two eyes and a wide, golden beard.
DWARF_HEAD = [
    "...hhhh...",
    "..hhhhhh..",
    ".hhhhhhhh.",
    "..EFEEFE..",
    ".bbEEEEbb.",
    ".bbbbbbbb.",
    "..bbbbbb..",
    "...bbbb...",
]
DWARF_HEAD_AT = (3, 4)


def pressed(emblem: list[str], at: tuple[int, int]) -> list[str]:
    """The stamp with an emblem drawn over its face: "." in the emblem leaves the face as it is."""
    rows = [list(row) for row in SPRITE]
    for dy, emblem_row in enumerate(emblem):
        for dx, pixel in enumerate(emblem_row):
            if pixel != ".":
                assert rows[at[1] + dy][at[0] + dx] == "F", "the emblem must stay inside the face"
                rows[at[1] + dy][at[0] + dx] = pixel
    return ["".join(row) for row in rows]


def main() -> None:
    assert all(len(row) == len(SPRITE) for row in SPRITE), "every row must be as long as the sprite is tall"
    outputs = {
        "science-stamp.png": (SPRITE, CYAN),
        "science-elf.png": (pressed(ELF_HEAD, ELF_HEAD_AT), GREEN),
        "science-dwarf.png": (pressed(DWARF_HEAD, DWARF_HEAD_AT), DWARF),
    }
    for name, (sprite, palette) in outputs.items():
        write_png(OUTPUT_DIR / name, to_pixels(outline(sprite, "K"), palette, scale=SCALE))
        print(f"wrote {(OUTPUT_DIR / name).relative_to(ROOT)}")


if __name__ == "__main__":
    main()
