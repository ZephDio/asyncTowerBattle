#!/usr/bin/env python3
"""Generates the gobelin unit's sprite sheet.

Run from anywhere: python3 scripts/generate-gobelin-sheet.py

Outputs public/resources/units/gobelin.sheet.png and public/resources/units/gobelin.sheet.json (see sprite_sheet.py).

gobelin.png is 4-bit palette pixel art at 1x, too big to transcribe by hand, so the bob is built in image space. Frame 1 is gobelin.png pixel for pixel, still used alone
in the shop. Frame 2 squashes everything above Y_FEET by DROP rows (about 1/14 of the opaque height, like the fox
and the dragon), so the top drops by DROP while the legs, planted in the ground shadow stay where they are. A hard cut of a DROP rows band left a
visible seam, the squash does not.
"""

from pathlib import Path

from sprite_sheet import opaque_rows, read_png, squash, write_strip

ROOT = Path(__file__).resolve().parent.parent
STILL = ROOT / "public" / "resources" / "units" / "gobelin.png"
OUTPUT = ROOT / "public" / "resources" / "units" / "gobelin.sheet.png"

Y_FEET = 76


def main() -> None:
    rest = read_png(STILL)
    top, bottom = opaque_rows(rest)
    drop = round((bottom - top) / 14)
    write_strip(OUTPUT, [("idle", [rest, squash(rest, Y_FEET, drop)], 450)])
    print(f"wrote {OUTPUT.relative_to(ROOT)} and its json, dropping {drop} rows")


if __name__ == "__main__":
    main()
