#!/usr/bin/env python3
"""Generates the little wooden sign that shows the price of a shop offer (src/shared/hud-element/entity-hud/price-hud.ts).

Run from anywhere: python3 scripts/generate-price-sign.py

A plank board on two short legs planted in the ground, in the wood of the shop and reserve signs
(generate-wood-panel.py): ink outline, a frame lit on its top edge and shaded on its bottom one, a dark plank face for
the price and the gold coin. The game draws it at two thirds of the army banner's art pixel.

Outputs, in public/resources/hud/price-sign/, three pieces the game stretches to the width of the price:
- left.png and right.png: the ends of the board, CAP pixels wide, with a leg under each.
- middle.png: one pixel wide, repeated between them.
The face, where the price goes, runs from row FACE_TOP to FACE_BOTTOM - 1 (see price-hud.ts).
"""

from pathlib import Path

from voxel_sprite import write_png

OUT = Path(__file__).resolve().parents[1] / "public" / "resources" / "hud" / "price-sign"

# The wood of generate-wood-panel.py.
INK = (42, 26, 16, 255)
FACE = (88, 57, 39, 255)
TOP_EDGE = (110, 74, 46, 255)
FRAME_DARK = (122, 80, 48, 255)
FRAME = (138, 90, 52, 255)
FRAME_LIGHT = (176, 122, 72, 255)
NAIL = (222, 190, 120, 255)
SHADOW = (22, 28, 46, 80)
CLEAR = (0, 0, 0, 0)

CAP = 4
BOARD = 13
FACE_TOP, FACE_BOTTOM = 2, BOARD - 2
LEG = 3
HEIGHT = BOARD + LEG + 1


def column(face_color, light, dark):
    """One column of the board, top to bottom: ink, lit edge, face, shaded edge, ink."""
    return [INK, light] + [face_color] * (FACE_BOTTOM - FACE_TOP) + [dark, INK]


def middle():
    board = column(FACE, FRAME_LIGHT, FRAME_DARK)
    board[FACE_TOP] = TOP_EDGE
    return [[color] for color in board + [CLEAR] * LEG + [CLEAR]]


def left():
    columns = [
        [INK] * BOARD,
        column(FRAME_LIGHT, FRAME_LIGHT, FRAME_DARK),
        column(FRAME, FRAME_LIGHT, FRAME_DARK),
        column(INK, FRAME_LIGHT, FRAME_DARK),
    ]
    columns[2][4] = NAIL
    pixels = [[columns[x][y] for x in range(CAP)] for y in range(BOARD)]
    # The leg: a stub of frame wood under the board, outlined, on a shadow one pixel wider each side
    for _ in range(LEG):
        pixels.append([CLEAR, INK, FRAME, INK])
    pixels[-1][2] = FRAME_DARK
    pixels.append([SHADOW, SHADOW, SHADOW, SHADOW])
    return pixels


def mirror(pixels):
    """The right end: the left one flipped, with the lit edge of each column kept on the left of the wood."""
    flipped = [row[::-1] for row in pixels]
    for y in range(1, BOARD - 1):
        if flipped[y][2] == FRAME_LIGHT and y > 1:
            flipped[y][2] = FRAME_DARK
    return flipped


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pieces = {"left": left(), "middle": middle()}
    pieces["right"] = mirror(pieces["left"])
    for name, pixels in pieces.items():
        write_png(OUT / f"{name}.png", pixels)
        print(f"wrote {(OUT / f'{name}.png').relative_to(OUT.parents[3])}")


if __name__ == "__main__":
    main()
