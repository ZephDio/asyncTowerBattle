#!/usr/bin/env python3
"""Generates the pattern indicator stars.

Run from anywhere: python3 scripts/generate-pattern-stars.py

Outputs:
- public/resources/icons/pattern-star-active.png: yellow star, the pattern cell condition is met.
- public/resources/icons/pattern-star-inactive.png: grey star, the pattern cell condition is not met.

A five branched star with slightly rounded tips, drawn at SIZE native pixels and upscaled SCALE times.
The star is shaded as a low pyramid: each branch is split along its spine into two flat facets whose 3D normal
is lit from the top left like the rest of the art. The rim is lightened on the edges facing the light, darkened
on the others, and the house outline goes around the silhouette.
"""

import math
from pathlib import Path

from voxel_sprite import TRANSPARENT, Color, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public" / "resources" / "icons"
SIZE = 24
SCALE = 2

OUTER_RADIUS = 10.6
INNER_RATIO = 0.44
# Radius of the disk swept along the star: rounds the branch tips.
ROUNDING = 1.3
# Height of the star center above its tips and inner corners, in pixels: higher means more contrast between facets.
PYRAMID_HEIGHT = 4.0
# Light direction: x right, y down, z toward the camera.
LIGHT = (-0.45, -0.6, 0.66)
# Facet light above which a facet takes the base color, then the mid shade, below it the deep shade.
BASE_THRESHOLD = 0.6
MID_THRESHOLD = 0.0

OUTLINE: Color = (22, 28, 46, 255)
# Ramps from highlight to deepest shade.
RAMPS: dict[str, list[Color]] = {
    "active": [
        (255, 246, 170, 255),
        (255, 214, 72, 255),
        (241, 172, 36, 255),
        (196, 118, 28, 255),
    ],
    "inactive": [
        (214, 218, 224, 255),
        (160, 166, 178, 255),
        (122, 128, 142, 255),
        (86, 92, 108, 255),
    ],
}

NEIGHBORS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def star_points(cx: float, cy: float, outer: float) -> list[tuple[float, float]]:
    points = []
    for i in range(10):
        radius = outer if i % 2 == 0 else outer * INNER_RATIO
        angle = -math.pi / 2 + i * math.pi / 5
        points.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    return points


def inside(points: list[tuple[float, float]], x: float, y: float) -> bool:
    result = False
    for (x1, y1), (x2, y2) in zip(points, points[1:] + points[:1]):
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
            result = not result
    return result


def edge_distance(points: list[tuple[float, float]], x: float, y: float) -> float:
    best = math.inf
    for (x1, y1), (x2, y2) in zip(points, points[1:] + points[:1]):
        dx, dy = x2 - x1, y2 - y1
        t = max(0.0, min(1.0, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
        best = min(best, math.hypot(x - x1 - t * dx, y - y1 - t * dy))
    return best


def facet_light(cx: float, cy: float, x: float, y: float) -> float:
    """Light of the facet the pixel sits on: the triangle between the raised center, a tip and an inner corner."""
    angle = math.atan2(y - cy, x - cx)
    step = 2 * math.pi / 5
    branch = round((angle + math.pi / 2) / step)
    spine = -math.pi / 2 + branch * step
    corner = spine + (step / 2 if angle - spine > 0 else -step / 2)
    tip = (OUTER_RADIUS * math.cos(spine), OUTER_RADIUS * math.sin(spine), -PYRAMID_HEIGHT)
    inner = (OUTER_RADIUS * INNER_RATIO * math.cos(corner), OUTER_RADIUS * INNER_RATIO * math.sin(corner), -PYRAMID_HEIGHT)
    nx = tip[1] * inner[2] - tip[2] * inner[1]
    ny = tip[2] * inner[0] - tip[0] * inner[2]
    nz = tip[0] * inner[1] - tip[1] * inner[0]
    if nz < 0:
        nx, ny, nz = -nx, -ny, -nz
    length = math.sqrt(nx * nx + ny * ny + nz * nz) * math.sqrt(sum(c * c for c in LIGHT))
    return (nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) / length


def draw(ramp: list[Color]) -> list[list[Color]]:
    cx = cy = (SIZE - 1) / 2
    # Push the star down a little: its tips sit higher than its bottom branches.
    cy += 0.9
    points = star_points(cx, cy, OUTER_RADIUS - ROUNDING)
    filled = [
        [inside(points, x, y) or edge_distance(points, x, y) <= ROUNDING for x in range(SIZE)] for y in range(SIZE)
    ]

    def is_filled(x: int, y: int) -> bool:
        return 0 <= x < SIZE and 0 <= y < SIZE and filled[y][x]

    pixels: list[list[Color]] = [[TRANSPARENT] * SIZE for _ in range(SIZE)]
    for y in range(SIZE):
        for x in range(SIZE):
            if not filled[y][x]:
                if any(is_filled(x + dx, y + dy) for dx, dy in NEIGHBORS):
                    pixels[y][x] = OUTLINE
                continue
            light = facet_light(cx, cy, x, y)
            # The core is flat and catches the light.
            if math.hypot(x - cx, y - cy) < 1.5:
                light = 1.0
            shade = 1 if light > BASE_THRESHOLD else 2 if light > MID_THRESHOLD else 3
            # Rim: the edge direction is the sum of the empty pixels in a 5x5 window (a 3x3 one flips from pixel to
            # pixel on staircase edges), compared with the light in screen space.
            on_edge = any(not is_filled(x + dx, y + dy) for dx, dy in NEIGHBORS)
            empties = [(dx, dy) for dx in range(-2, 3) for dy in range(-2, 3) if not is_filled(x + dx, y + dy)]
            ex = sum(dx for dx, _ in empties)
            ey = sum(dy for _, dy in empties)
            if on_edge and (ex or ey):
                facing = (ex * LIGHT[0] + ey * LIGHT[1]) / math.hypot(ex, ey) / math.hypot(LIGHT[0], LIGHT[1])
                if facing > 0.3:
                    shade = max(0, shade - 1)
                elif facing < -0.3:
                    shade = min(3, shade + 1)
            pixels[y][x] = ramp[shade]
    return [[pixel for pixel in row for _ in range(SCALE)] for row in pixels for _ in range(SCALE)]


for name, ramp in RAMPS.items():
    write_png(OUTPUT_DIR / f"pattern-star-{name}.png", draw(ramp))
