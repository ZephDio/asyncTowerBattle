#!/usr/bin/env python3
"""Generates the dragon unit's sprite sheet.

Run from anywhere: python3 scripts/generate-dragon-sheet.py

Outputs public/resources/units/dragon.sheet.png and public/resources/units/dragon.sheet.json (see sprite_sheet.py).

dragon.png is a 15x15 sprite upscaled 4x, placed at (3, 2) in a 65x64 canvas: the frames keep that canvas so frame 1
is dragon.png pixel for pixel, still used alone in the shop. Frame 2 breathes out: the head and the wings drop one
sprite pixel (row 7, a plain neck row, is the one squeezed out, so the striped belly stays whole) while the feet stay
planted. Cycling the two makes the "idle" loop.
"""

from pathlib import Path

from sprite_sheet import breath_out, write_sheet

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "units" / "dragon.sheet.png"

PALETTE = {
    "a": (29, 29, 28, 255),  # outline
    "b": (255, 211, 173, 255),
    "c": (218, 212, 188, 255),
    "d": (241, 147, 25, 255),
    "e": (181, 167, 147, 255),
    "f": (137, 122, 113, 255),
    "g": (195, 95, 29, 255),
    "h": (196, 76, 38, 255),
    "i": (186, 57, 0, 255),
    "j": (137, 58, 27, 255),
    "k": (66, 188, 127, 255),  # eyes
    "l": (126, 14, 19, 255),
    "m": (59, 118, 143, 255),
    "n": (83, 161, 173, 255),
    "o": (33, 82, 107, 255),
}

# dragon.png at 1x, one character per sprite pixel.
REST = [
    "..a..a....a.a..",
    ".abaacaaaacaba.",
    "abdbdefbbfedgda",
    "abdhijbbbbfjgda",
    "abdhijdkbkljgda",
    "abdhijgdbbdlgda",
    "abdhjbjgjdjlgda",
    "abdhjbgjggglgda",
    "abdhjbgmllljgda",
    "abdhjbgnnjglgda",
    ".adjhbgmmgdlja.",
    "..adhbgnngdlga.",
    "..adhbgmmgdlga.",
    "..adhbhnnjdlga.",
    ".aeicdcoocdclea",
]


def main() -> None:
    write_sheet(
        OUTPUT,
        [("idle", [REST, breath_out(REST, squeezed_row=7)], 450)],
        PALETTE,
        scale=4,
        canvas=(65, 64),
        offset=(3, 2),
    )
    print(f"wrote {OUTPUT.relative_to(ROOT)} and its json")


if __name__ == "__main__":
    main()
