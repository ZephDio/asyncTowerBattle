#!/usr/bin/env python3
"""Generates the frog unit pixel art and its idle sprite sheet.

Run from anywhere: python3 scripts/generate-frog.py

Outputs public/resources/units/frog.png, and public/resources/units/frog.sheet.png with its json (see sprite_sheet.py).

A sitting frog seen from the front, 27x27 pixels with its outline, upscaled 3x with nearest neighbor: big eyes with a
highlight on top of the head, a wide smile, a yellow-green belly narrowing to a point and two folded front legs. LEFT
holds the columns from the left edge to the center column, mirrored to make the full sprite. The sheet's frame 1 is
frog.png. Frame 2 breathes out: every row above the belly drops one sprite pixel (row 9 is the one squeezed out) so
the head bobs down while the legs stay planted.
"""

from pathlib import Path

from sprite_sheet import breath_out, to_pixels, write_sheet
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "frog.png"
SHEET = ROOT / "public" / "resources" / "units" / "frog.sheet.png"
SCALE = 3

PALETTE = {
    "a": (0, 0, 0, 255),  # outline
    "L": (110, 200, 50, 255),
    "G": (86, 170, 40, 255),
    "g": (62, 130, 36, 255),
    "d": (44, 100, 30, 255),
    "y": (190, 200, 50, 255),
    "Y": (160, 168, 40, 255),
    "w": (255, 255, 255, 255),
}

LEFT = [
    ".......aaa....",
    "......aLLLa...",
    ".....aLwwwLaaa",
    ".....aLwwwLaaa",
    ".....awaaawLLL",
    ".....awaaawGGG",
    ".....awwwwwGGG",
    "....aLGGGGGGGG",
    "....aLGGGGGGGG",
    "....aGaGGGGGGG",
    "....aGGagGGGGG",
    "....aGGGgaaaaa",
    ".....aGyyyyyyy",
    ".....aGyyyyyyy",
    ".....aGyyyyyyy",
    ".....aGyyyyyyy",
    "....aaGGYyyyyy",
    ".aaaLaGagYyyyy",
    "aLLLLaGagYyyyy",
    "aLLLLaGagYyyyy",
    "aGGGGaGagYyyyy",
    "aggGGaGaaaYyyy",
    ".aaaGaGGgaaYyy",
    "..aaaGaGGGGaYY",
    "...aaGaGGGGaGY",
    "..aggggaagggaa",
    "..aaaaaaaaaaaa",
]
REST = [row + row[-2::-1] for row in LEFT]
SQUEEZED_ROW = 9


def main() -> None:
    assert all(len(row) == 27 for row in REST), "every row must be 27 pixels wide"
    write_png(OUTPUT, to_pixels(REST, PALETTE, scale=SCALE))
    write_sheet(SHEET, [("idle", [REST, breath_out(REST, SQUEEZED_ROW)], 450)], PALETTE, scale=SCALE)
    print(f"wrote {OUTPUT.relative_to(ROOT)}, {SHEET.relative_to(ROOT)} and its json")


if __name__ == "__main__":
    main()
