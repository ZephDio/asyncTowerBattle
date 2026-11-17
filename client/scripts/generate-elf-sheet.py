#!/usr/bin/env python3
"""Generates the elf unit's sprite sheet.

Run from anywhere: python3 scripts/generate-elf-sheet.py

Outputs public/resources/units/elf.sheet.png and public/resources/units/elf.sheet.json (see sprite_sheet.py).

elf.png is smooth anti-aliased cartoon art, so the bob is built in image space. Frame 1 is elf.png pixel for pixel, still used alone
in the shop. Frame 2 squashes everything above Y_FEET by DROP rows (about 1/14 of the opaque height, like the fox
and the dragon), so the top drops by DROP while the trousers and the boots stay where they are. A hard cut of a DROP rows band left a
visible seam, the squash does not.
"""

from pathlib import Path

from sprite_sheet import opaque_rows, read_png, squash, write_strip

ROOT = Path(__file__).resolve().parent.parent
STILL = ROOT / "public" / "resources" / "units" / "elf.png"
OUTPUT = ROOT / "public" / "resources" / "units" / "elf.sheet.png"

Y_FEET = 272


def main() -> None:
    rest = read_png(STILL)
    top, bottom = opaque_rows(rest)
    drop = round((bottom - top) / 14)
    write_strip(OUTPUT, [("idle", [rest, squash(rest, Y_FEET, drop)], 450)])
    print(f"wrote {OUTPUT.relative_to(ROOT)} and its json, dropping {drop} rows")


if __name__ == "__main__":
    main()
