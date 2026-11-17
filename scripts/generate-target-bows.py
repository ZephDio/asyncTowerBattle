#!/usr/bin/env python3
"""Generates the tower target zone indicator bows.

Run from anywhere: python3 scripts/generate-target-bows.py

Outputs:
- public/resources/hud/target-bow-active.png: red bow, the target cell is a path tile the tower can shoot at.
- public/resources/hud/target-bow-inactive.png: grey bow, the target cell has no path tile.

A drawn bow with an arrow pointing to the top right, drawn at SIZE native pixels and upscaled SCALE times like the
pattern stars (scripts/generate-pattern-stars.py), with the same outline and the same grey ramp. Shapes are laid out
in arrow coordinates: u along the arrow toward its head, v across it toward the bottom right.
"""

import math
from pathlib import Path

from voxel_sprite import TRANSPARENT, Color, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public" / "resources" / "hud"
SIZE = 24
SCALE = 2

# Bow: a parabola bulging toward the arrow head, from its tips at u = BOW_BASE to its grip at BOW_BASE + BOW_BULGE.
BOW_HALF_SPAN = 9.0
BOW_BASE = -2.5
BOW_BULGE = 4.5
BOW_THICKNESS = 1.1
# The string is pulled back to the nock.
NOCK = -6.5
SHAFT_FROM = -9.0
SHAFT_HALF_WIDTH = 0.7
HEAD_BASE = 5.0
HEAD_TIP = 10.5
HEAD_HALF_WIDTH = 3.0
FLETCH_FROM = -10.0
FLETCH_TO = -7.0
FLETCH_HALF_WIDTH = 1.6
# Light direction in screen space: x right, y down.
LIGHT = (-0.6, -0.8)

OUTLINE: Color = (22, 28, 46, 255)
# Ramps from highlight to deepest shade.
RAMPS: dict[str, list[Color]] = {
    "active": [
        (255, 178, 150, 255),
        (232, 82, 64, 255),
        (186, 44, 48, 255),
        (122, 28, 48, 255),
    ],
    "inactive": [
        (214, 218, 224, 255),
        (160, 166, 178, 255),
        (122, 128, 142, 255),
        (86, 92, 108, 255),
    ],
}

NEIGHBORS = ((1, 0), (-1, 0), (0, 1), (0, -1))
CENTER = (SIZE - 1) / 2


def to_arrow(x: int, y: int) -> tuple[float, float]:
    dx, dy = x - CENTER, y - CENTER
    return (dx - dy) / math.sqrt(2), (dx + dy) / math.sqrt(2)


def part(x: int, y: int) -> str | None:
    """The part of the bow the pixel belongs to, if any."""
    u, v = to_arrow(x, y)
    if HEAD_BASE <= u <= HEAD_TIP and abs(v) <= HEAD_HALF_WIDTH * (HEAD_TIP - u) / (HEAD_TIP - HEAD_BASE):
        return "head"
    if abs(v) <= BOW_HALF_SPAN:
        bow_u = BOW_BASE + BOW_BULGE * (1 - (v / BOW_HALF_SPAN) ** 2)
        if abs(u - bow_u) <= BOW_THICKNESS:
            return "bow"
    if FLETCH_FROM <= u <= FLETCH_TO and abs(v) <= min(FLETCH_HALF_WIDTH, (u - FLETCH_FROM + 1) * 0.6):
        return "fletching"
    if SHAFT_FROM <= u <= HEAD_BASE and abs(v) <= SHAFT_HALF_WIDTH:
        return "shaft"
    return None


def on_string(x: int, y: int) -> bool:
    """The string runs from each bow tip back to the nock, as a 1px line."""
    u, v = to_arrow(x, y)
    if abs(v) > BOW_HALF_SPAN:
        return False
    string_u = NOCK + (BOW_BASE - NOCK) * abs(v) / BOW_HALF_SPAN
    return abs(u - string_u) <= 0.55


def draw(ramp: list[Color]) -> list[list[Color]]:
    parts = [[part(x, y) for x in range(SIZE)] for y in range(SIZE)]

    def is_filled(x: int, y: int) -> bool:
        return 0 <= x < SIZE and 0 <= y < SIZE and parts[y][x] is not None

    pixels: list[list[Color]] = [[TRANSPARENT] * SIZE for _ in range(SIZE)]
    for y in range(SIZE):
        for x in range(SIZE):
            kind = parts[y][x]
            if kind is None:
                if any(is_filled(x + dx, y + dy) for dx, dy in NEIGHBORS):
                    pixels[y][x] = OUTLINE
                elif on_string(x, y):
                    pixels[y][x] = ramp[3]
                continue
            shade = {"head": 0, "bow": 1, "fletching": 1, "shaft": 2}[kind]
            # Rim: lighten the edges facing the light and darken the others, like the stars.
            empties = [(dx, dy) for dx in range(-2, 3) for dy in range(-2, 3) if not is_filled(x + dx, y + dy)]
            on_edge = any(not is_filled(x + dx, y + dy) for dx, dy in NEIGHBORS)
            ex = sum(dx for dx, _ in empties)
            ey = sum(dy for _, dy in empties)
            if on_edge and (ex or ey):
                facing = (ex * LIGHT[0] + ey * LIGHT[1]) / math.hypot(ex, ey)
                if facing > 0.3:
                    shade = max(0, shade - 1)
                elif facing < -0.3:
                    shade = min(3, shade + 1)
            pixels[y][x] = ramp[shade]
    return [[pixel for pixel in row for _ in range(SCALE)] for row in pixels for _ in range(SCALE)]


for name, ramp in RAMPS.items():
    write_png(OUTPUT_DIR / f"target-bow-{name}.png", draw(ramp))
