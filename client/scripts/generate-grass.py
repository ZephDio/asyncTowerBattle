#!/usr/bin/env python3
"""Generates the grass patches that cover the grids (src/shared/traits/render/grid-renderable.ts).

Run from anywhere: python3 scripts/generate-grass.py

Outputs, in public/resources/environment/grass/, patches of CELL x CELL art pixels per cell they cover, in several
variants each (VARIANTS, also in src/engine/grid/grass-layout.ts):
- small-N.png: one cell.
- wide-N.png: two cells side by side. tall-N.png: two cells one above the other. big-N.png: 2 x 2 cells.

The game lays them out by the run's seed (src/engine/grid/grass-layout.ts), mirrored (never upside down, the tufts grow up) and in patches of different sizes,
so the grass doesn't repeat cell by cell. Every patch is the flat BASE green at its border, with its soft spots kept
MARGIN pixels inside, and its tufts and flowers each in a slot of their own that it never leaves, so any patch
joins any other patch seamlessly and the decorations stay as even across a join as inside a patch. The BASE is the
grid's old flat green.
"""

import random
from pathlib import Path

from voxel_sprite import write_png

OUT = Path(__file__).resolve().parents[1] / "public" / "resources" / "environment" / "grass"

CELL = 48
# The soft spots stay this far from the border; the decorations go all the way to it.
MARGIN = 5
SLOT_WIDTH, SLOT_HEIGHT = 16, 16

BASE = (102, 204, 102, 255)
SOFT = (96, 197, 99, 255)
SHADE = (80, 172, 88, 255)
MID = (86, 186, 94, 255)
LIGHT = (136, 228, 122, 255)
PALE = (108, 211, 107, 255)
DEEP = (70, 160, 84, 255)
PETAL = (252, 246, 226, 255)
HEART = (250, 206, 84, 255)
PINK = (246, 164, 186, 255)
BLUE = (160, 196, 248, 255)
PEBBLE = (160, 184, 156, 255)
PEBBLE_SHADE = (120, 150, 126, 255)
CLOVER = (92, 190, 98, 255)
ROCK_LIGHT = (196, 204, 198, 255)
ROCK = (154, 164, 160, 255)
ROCK_SHADE = (112, 124, 128, 255)
ROCK_DARK = (78, 90, 100, 255)
MOSS = (96, 168, 92, 255)

VARIANTS = {"small": 4, "wide": 2, "tall": 2, "big": 3}
SIZES = {"small": (1, 1), "wide": (2, 1), "tall": (1, 2), "big": (2, 2)}


def blank(width, height):
    return [[BASE] * width for _ in range(height)]


def put(pixels, x, y, color, margin=0):
    if margin <= x < len(pixels[0]) - margin and margin <= y < len(pixels) - margin:
        pixels[y][x] = color


def spot(pixels, rng, color):
    """A slightly different patch of ground, with a ragged pixel outline."""
    height, width = len(pixels), len(pixels[0])
    radius_x, radius_y = rng.randrange(5, 15), rng.randrange(3, 10)
    cx = rng.randrange(MARGIN + radius_x, width - MARGIN - radius_x)
    cy = rng.randrange(MARGIN + radius_y, height - MARGIN - radius_y)
    for y in range(height):
        for x in range(width):
            d = ((x - cx) / radius_x) ** 2 + ((y - cy) / radius_y) ** 2
            if d < 0.8 + rng.random() * 0.35 and d < 1.1:
                put(pixels, x, y, color, MARGIN)


def tuft(pixels, x, y, rng, room):
    """Blades fanning out of one root, dark at the root and lit at the tip, on a one pixel shadow. Tufts are small, tall
    or wide, and some lean. No blade is taller than `room` pixels."""
    put(pixels, x, y + 1, SHADE)
    put(pixels, x + 1, y + 1, SHADE)
    tall = rng.random() < 0.3
    blades = [(0, rng.randrange(4, 9) if tall else rng.randrange(2, 6), rng.choice((-1, 0, 1)))]
    blades += [(-1, rng.randrange(2, 4), -1), (1, rng.randrange(2, 4), 1)][: rng.randrange(1, 3)]
    if rng.random() < 0.35:
        blades.append((2, rng.randrange(1, 3), 1))
    for dx, blade_height, lean in blades:
        blade_height = min(blade_height, room)
        for h in range(blade_height):
            tip = h == blade_height - 1
            color = LIGHT if tip else (MID if h else SHADE)
            put(pixels, x + dx + (lean if h >= 2 else 0), y - h, color)


def pack(pixels, x, y, rng, room):
    """A pack of blades growing from one mound, taller in the middle and leaning outward at the sides: dark at the
    root, lit at the tips, on a shadow. Centered on x, at most 9 pixels wide and `room` pixels tall."""
    count = rng.randrange(4, 8)
    half = count - 1
    peak = min(room, rng.randrange(5, 9))
    put(pixels, x - half, y + 1, SHADE)
    for dx in range(-half, half + 2):
        put(pixels, x + dx, y + 1, SHADE)
    for index in range(count):
        dx = -half + 2 * index
        edge = abs(dx) / max(half, 1)
        blade_height = max(2, min(room, round(peak * (1 - 0.55 * edge)) + rng.randrange(-1, 2)))
        lean = (1 if dx > 0 else -1 if dx < 0 else rng.choice((-1, 1))) if blade_height >= 4 else 0
        for h in range(blade_height):
            tip = h == blade_height - 1
            color = LIGHT if tip else (MID if h >= 2 else DEEP)
            put(pixels, x + dx + (lean if h >= blade_height - 2 else 0), y - h, color)
    for dx in range(-half, half + 1):
        put(pixels, x + dx, y, DEEP)
        if abs(dx) < half:
            put(pixels, x + dx, y - 1, DEEP if dx % 2 else MID)


def bush(pixels, x, y, rng, room):
    """A low rounded bush, leaves lit on the upper left and dark below, on a shadow. Centered on x."""
    w = rng.randrange(8, 11)
    h = min(room, rng.randrange(5, 8))
    for row in range(h):
        for col in range(w):
            dx, dy = (col + 0.5) / w * 2 - 1, (row + 0.5) / h * 2 - 1
            if dx * dx + dy * dy > 1.0 + (0.18 if (row * 3 + col) % 4 == 0 else 0):
                continue
            if row >= h - 2 or col >= w - 2 and row > h // 2:
                color = DEEP
            elif row <= 1 and col < w // 2 or (row + col) % 5 == 0 and row < h - 3:
                color = LIGHT
            else:
                color = MID
            put(pixels, x - w // 2 + col, y - h + 1 + row, color)
    for col in range(1, w):
        put(pixels, x - w // 2 + col, y + 1, SHADE)


def flower(pixels, x, y, rng):
    petals = rng.choice((PETAL, PETAL, PINK, BLUE))
    put(pixels, x, y, HEART)
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        put(pixels, x + dx, y + dy, petals)


def clover(pixels, x, y):
    for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, -1), (0, 1)):
        put(pixels, x + dx, y + dy, CLOVER)
    put(pixels, x, y, DEEP)


def pebble(pixels, x, y):
    put(pixels, x, y, PEBBLE)
    put(pixels, x + 1, y, PEBBLE)
    put(pixels, x, y + 1, PEBBLE_SHADE)
    put(pixels, x + 1, y + 1, PEBBLE_SHADE)


def rock(pixels, x, y, rng):
    """A little rock lying in the grass, w x h pixels with its bottom left corner at (x, y), lit from the upper left,
    with a shadow on the ground under it and sometimes moss on top."""
    w, h = rng.randrange(5, 10), rng.randrange(4, 7)
    for row in range(h):
        for col in range(w):
            dx, dy = (col + 0.5) / w * 2 - 1, (row + 0.5) / h * 2 - 1
            if dx * dx + dy * dy * 1.1 > 1.0:
                continue
            if row == h - 1 or col == w - 1 and row > 0:
                color = ROCK_SHADE
            elif row == 0 or col == 0:
                color = ROCK_LIGHT
            elif row >= h - 2 or col >= w - 2:
                color = ROCK_SHADE
            else:
                color = ROCK
            put(pixels, x + col, y - h + 1 + row, color)
    for col in range(1, w + 1):
        put(pixels, x + col, y + 1, SHADE)
    put(pixels, x + w // 2, y - h + 1 + h - 1, ROCK_DARK)
    if rng.random() < 0.5:
        for col in range(1, w - 2):
            if rng.random() < 0.6:
                put(pixels, x + col, y - h + 1, MOSS)
    return w, h


def pebbles(pixels, x, y, rng):
    """Two or three small stones next to each other."""
    for dx, dy in ((0, 0), (rng.randrange(3, 5), -1), (rng.randrange(1, 3), 2))[: rng.randrange(2, 4)]:
        pebble(pixels, x + dx, y + dy)


def posy(pixels, x, y, rng):
    """Three or four flowers of the same color close together on short stems."""
    petals = rng.choice((PETAL, PINK, BLUE))
    for dx, dy in ((0, 0), (4, 1), (2, -3), (6, -2))[: rng.randrange(3, 5)]:
        put(pixels, x + dx, y + dy + 1, CLOVER)
        put(pixels, x + dx, y + dy, HEART)
        for ox, oy in ((1, 0), (-1, 0), (0, -1)):
            put(pixels, x + dx + ox, y + dy + oy, petals)


def patch(columns, rows, seed):
    rng = random.Random(seed)
    pixels = blank(columns * CELL, rows * CELL)
    for _ in range(columns * rows * 2):
        spot(pixels, rng, rng.choice((SOFT, SOFT, PALE)))
    # One decoration per SLOT_WIDTH x SLOT_HEIGHT slot, jittered but kept inside its slot, and none left empty, so the
    # decorations are as even across a patch's border as inside it: the two slots facing each other each leave their own
    # gap.
    for slot_y in range(0, rows * CELL, SLOT_HEIGHT):
        for slot_x in range(0, columns * CELL, SLOT_WIDTH):
            roll = rng.random()
            x = slot_x + rng.randrange(1, SLOT_WIDTH - 3)
            y = slot_y + rng.randrange(4, SLOT_HEIGHT - 1)
            y_pack = slot_y + rng.randrange(6, SLOT_HEIGHT - 1)
            if roll < 0.04:
                # A rock needs the whole slot: it keeps to it as its tufts do.
                rock(pixels, slot_x + rng.randrange(0, 3), slot_y + rng.randrange(7, SLOT_HEIGHT - 2), rng)
            elif roll < 0.06:
                pebbles(pixels, slot_x + rng.randrange(1, 4), slot_y + rng.randrange(5, SLOT_HEIGHT - 3), rng)
            elif roll < 0.19:
                posy(pixels, slot_x + rng.randrange(2, 5), slot_y + rng.randrange(5, SLOT_HEIGHT - 3), rng)
            elif roll < 0.23:
                flower(pixels, x, y, rng)
            elif roll < 0.28:
                clover(pixels, x, y)
            else:
                kind = rng.random()
                if kind < 0.4:
                    pack(pixels, slot_x + rng.randrange(4, SLOT_WIDTH - 4), y_pack, rng, y_pack - slot_y + 1)
                elif kind < 0.55:
                    bush(pixels, slot_x + rng.randrange(5, SLOT_WIDTH - 5), y_pack, rng, y_pack - slot_y + 1)
                else:
                    tuft(pixels, x, y, rng, y - slot_y + 1)
    return pixels


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.png"):
        old.unlink()
    pieces = {}
    for kind, (columns, rows) in SIZES.items():
        for variant in range(VARIANTS[kind]):
            pieces[f"{kind}-{variant}"] = patch(columns, rows, 100 * columns + 10 * rows + variant)
    for name, pixels in pieces.items():
        write_png(OUT / f"{name}.png", pixels)
        print(f"wrote {(OUT / f'{name}.png').relative_to(OUT.parents[3])}")


if __name__ == "__main__":
    main()
