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
- lock.png: the smaller sign of a reserved offer, planted in front of the price sign's lower right corner
  (reserved-sign-hud.ts): the same board and wood on a single leg, with a closed padlock, its body in the gold coin's
  yellows (generate-gold-coin.py) and its shackle in steel, on the dark face.
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


# The padlock, one character per pixel on the lock sign's face: steel shackle (s light, S shade), gold body (W shine,
# G light, g mid, o shade), ink keyhole (K).
PADLOCK = [
    ".ssSS.",
    ".s..S.",
    ".s..S.",
    "WGGGGg",
    "GgKKgo",
    "GggKgo",
    "Gggggo",
    "oooooo",
]
PADLOCK_COLORS = {
    "s": (204, 210, 220, 255),
    "S": (128, 136, 156, 255),
    "W": (255, 246, 170, 255),
    "G": (254, 231, 97, 255),
    "g": (254, 174, 52, 255),
    "o": (205, 112, 38, 255),
    "K": INK,
}
LOCK_WIDTH = 12


def lock():
    """A square board in the price sign's frame, the padlock on its face, on one leg in the middle."""
    width = LOCK_WIDTH
    pixels = [[CLEAR] * width for _ in range(HEIGHT)]
    for y in range(BOARD):
        for x in range(width):
            if x in (0, width - 1) or y in (0, BOARD - 1):
                color = INK
            elif y == 1 or x == 1:
                color = FRAME_LIGHT
            elif y == BOARD - 2 or x == width - 2:
                color = FRAME_DARK
            elif y == FACE_TOP:
                color = TOP_EDGE
            else:
                color = FACE
            pixels[y][x] = color
    top = FACE_TOP + (FACE_BOTTOM - FACE_TOP - len(PADLOCK)) // 2 + 1
    left_x = (width - len(PADLOCK[0])) // 2
    for dy, row in enumerate(PADLOCK):
        for dx, char in enumerate(row):
            if char != ".":
                pixels[top + dy][left_x + dx] = PADLOCK_COLORS[char]
    middle_x = width // 2
    for y in range(BOARD, BOARD + LEG):
        pixels[y][middle_x - 2] = INK
        pixels[y][middle_x - 1] = FRAME
        pixels[y][middle_x] = FRAME_DARK
        pixels[y][middle_x + 1] = INK
    for x in range(middle_x - 3, middle_x + 3):
        pixels[HEIGHT - 1][x] = SHADOW
    return pixels


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pieces = {"left": left(), "middle": middle(), "lock": lock()}
    pieces["right"] = mirror(pieces["left"])
    for name, pixels in pieces.items():
        write_png(OUT / f"{name}.png", pixels)
        print(f"wrote {(OUT / f'{name}.png').relative_to(OUT.parents[3])}")


if __name__ == "__main__":
    main()
