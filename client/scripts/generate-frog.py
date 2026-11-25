#!/usr/bin/env python3
"""Generates the frog unit pixel art and its idle sprite sheet.

Run from anywhere: python3 scripts/generate-frog.py

Outputs public/resources/units/frog.png, and public/resources/units/frog.sheet.png with its json (see sprite_sheet.py).

REST is a 16x13 frog, one character per pixel, outline included, upscaled 4x with nearest neighbor like the fox: a
green body with two bulging eyes, a wide mouth and a pale belly. The sheet's frame 1 is frog.png. Frame 2 breathes
out: every row above the belly drops one sprite pixel (row 8 is the one squeezed out) so the eyes bob down while the
feet stay planted.
"""

from pathlib import Path

from sprite_sheet import breath_out, to_pixels, write_sheet
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "frog.png"
SHEET = ROOT / "public" / "resources" / "units" / "frog.sheet.png"
SCALE = 4

PALETTE = {
    "a": (29, 29, 28, 255),  # outline
    "G": (88, 170, 70, 255),
    "g": (52, 120, 62, 255),
    "l": (150, 214, 100, 255),
    "y": (226, 236, 160, 255),
    "w": (250, 250, 240, 255),
    "k": (29, 29, 28, 255),
}

REST = [
    "..aaaa....aaaa..",
    ".awwwGa..aGwwwa.",
    ".awkkGaaaaGkkwa.",
    "aGGGGGGGGGGGGGGa",
    "aGGGGGGGGGGGGGGa",
    "aGlaaaaaaaaaalGa",
    "aGGGllllllllGGGa",
    "aGGGGGGGGGGGGGGa",
    "aGGGlyyyyyylGGGa",
    ".aGGGyyyyyyGGGa.",
    "aGGGaaGGGGaaGGGa",
    "aGGGGa....aGGGGa",
    ".aaaa......aaaa.",
]
SQUEEZED_ROW = 7


def main() -> None:
    assert all(len(row) == 16 for row in REST), "every row must be 16 pixels wide"
    write_png(OUTPUT, to_pixels(REST, PALETTE, scale=SCALE))
    write_sheet(SHEET, [("idle", [REST, breath_out(REST, SQUEEZED_ROW)], 450)], PALETTE, scale=SCALE)
    print(f"wrote {OUTPUT.relative_to(ROOT)}, {SHEET.relative_to(ROOT)} and its json")


if __name__ == "__main__":
    main()
