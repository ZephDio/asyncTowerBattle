#!/usr/bin/env python3
"""Generates the gobelin portal pixel art, its front view facing the camera.

Run from anywhere: python3 scripts/generate-gobelin-portal.py

Outputs public/resources/totem/gobelin-portal.png.

The portal is a ring of cold stone blocks standing on a two-step paved plinth, with a green dimensional ether
in its opening. It follows the tower and house art: native 1px pixel art, a small palette, a navy outline,
light coming from the top left and a translucent navy drop shadow.

It is modeled as voxels and rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, bayer, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "gobelin-portal.png"
WIDTH = 128
HEIGHT = 160

ORIGIN_Y = 112

# Cold stone of the ring, from crack to highlight
STONE = [(44, 50, 72, 255), (68, 78, 104, 255), (96, 109, 134, 255), (130, 145, 165, 255), (172, 186, 198, 255)]
# The same stone lit by the ether, for the inner rim of the ring
GLOWING_STONE = [(30, 56, 62, 255), (52, 92, 92, 255), (80, 136, 116, 255), (118, 184, 140, 255), (168, 226, 170, 255)]
# Paved stone of the plinth, a little warmer and darker than the ring
PAVING = [(58, 58, 78, 255), (86, 88, 108, 255), (114, 117, 135, 255), (148, 151, 164, 255)]
# Dimensional ether, from the rim to the brightest swirl
ETHER = [(18, 52, 48, 255), (30, 88, 66, 255), (52, 138, 80, 255), (102, 200, 100, 255), (188, 244, 160, 255)]

# Plinth steps as boxes: half width, half depth, bottom, top
STEPS = [(50, 36, 0, 7), (38, 26, 7, 14)]
SHADOW_RADII = (60, 44)

RING_CENTER_Z = 64
OUTER_RADII = (46, 52)
INNER_RADII = (21, 29)
INNER_CENTER_OFFSET = 3
RING_HALF_THICKNESS = 6
BLOCK_BULGE = 2

# Angular block boundaries in degrees (0 points right, 90 points down), with some blocks split in two rows
BLOCK_EDGES = [-100, -62, -28, 4, 36, 70, 110, 144, 178, 212, 246]
SPLIT_BLOCKS = {2, 7, 8}

# Swirls in ether space (-1..1, v going down): center u, center v, radius, start angle, turns
SWIRLS = [
    (0.05, -0.62, 0.32, 0.0, 1.6),
    (-0.08, -0.12, 0.34, 2.0, 1.7),
    (0.48, 0.28, 0.3, 4.0, 1.5),
    (-0.42, 0.3, 0.28, 1.0, 1.5),
    (0.1, 0.7, 0.28, 3.0, 1.5),
]
# Waves in ether space: start u, end u, v, amplitude
WAVES = [(-0.75, 0.15, -0.38, 0.06), (-0.7, 0.3, 0.06, 0.07), (-0.35, 0.55, 0.52, 0.06)]

LOWER_STEP, UPPER_STEP, ETHER_LABEL, BLOCK = 1, 2, 3, 10


def block_position(angle: float) -> tuple[int, float]:
    """Index of the block at this angle, and how far across the block the angle is (0..1)."""
    degrees = math.degrees(angle)
    for index in range(len(BLOCK_EDGES)):
        start = BLOCK_EDGES[index]
        end = BLOCK_EDGES[(index + 1) % len(BLOCK_EDGES)]
        if end <= start:
            end += 360
        d = degrees if degrees >= start else degrees + 360
        if start <= d < end:
            return index, (d - start) / (end - start)
    return 0, 0.5


def inner_distance(x: float, z: float) -> float:
    """Below 1 inside the opening of the ring."""
    nx = x
    ny = RING_CENTER_Z - z - INNER_CENTER_OFFSET
    q_in = math.hypot(nx / INNER_RADII[0], ny / INNER_RADII[1])
    return q_in / (1 + 0.05 * math.sin(math.atan2(ny, nx) * 5 + 1))


def ring_label(x: float, z: float) -> tuple[int, float]:
    """Label of the ring plane at (x, z) and its half thickness there."""
    nx = x
    ny = RING_CENTER_Z - z
    q = math.hypot(nx / OUTER_RADII[0], ny / OUTER_RADII[1])
    angle = math.atan2(ny / OUTER_RADII[1], nx / OUTER_RADII[0])
    index, fraction = block_position(angle)
    # Each block bulges out, which makes the silhouette lumpy like piled stones
    lump = 0.07 * math.sin(math.pi * fraction) + 0.015 * math.sin(angle * 7)
    q_in = inner_distance(x, z)
    if q_in < 1:
        return ETHER_LABEL, 1
    if q >= 1 + lump:
        return EMPTY, 0
    # Cracks bend a little as they go outward, so blocks are not perfect wedges
    bent = angle + 0.25 * (q - 0.7)
    index, fraction = block_position(math.atan2(math.sin(bent), math.cos(bent)))
    inner_q = q / q_in if q_in else 0
    rho = (q - inner_q) / (1 + lump - inner_q) if 1 + lump > inner_q else 0
    split = index in SPLIT_BLOCKS and rho < 0.5
    half = RING_HALF_THICKNESS + BLOCK_BULGE * math.sin(math.pi * fraction)
    return BLOCK + index * 2 + (1 if split else 0), half


def build_swirls() -> dict[tuple[int, int], int]:
    """Model (x, z) voxels drawn as bright swirls on the ether."""
    cx = 0
    cz = RING_CENTER_Z - INNER_CENTER_OFFSET
    cells: dict[tuple[int, int], int] = {}

    def plot(u: float, v: float, level: int) -> None:
        cell = (math.floor(cx + u * INNER_RADII[0]), math.floor(cz - v * INNER_RADII[1]))
        cells[cell] = max(cells.get(cell, 0), level)

    for su, sv, radius, start, turns in SWIRLS:
        for i in range(240):
            t = i / 240
            angle = start + t * turns * 2 * math.pi
            r = radius * (1 - t) * 0.9
            plot(su + r * math.cos(angle) * INNER_RADII[1] / INNER_RADII[0] * 0.9, sv + r * math.sin(angle) * 0.75, 4 if t > 0.55 else 3)
    for u0, u1, wv, amplitude in WAVES:
        for i in range(160):
            t = i / 160
            plot(u0 + (u1 - u0) * t, wv + amplitude * math.sin(t * 2 * math.pi), 3)
    for du, dv in [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1), (0, 2), (0, -2)]:
        cells[(cx + du, cz - 4 + dv)] = 4
    return cells


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    for x in range(-56, 56):
        for z in range(8, 124):
            label, half = ring_label(x + 0.5, z + 0.5)
            if label == EMPTY:
                continue
            for y in range(-10, 10):
                if abs(y + 0.5) < half:
                    grid.set(x, y, z, label)
    for index, (half_width, half_depth, bottom, top) in enumerate(STEPS):
        grid.box(-half_width, half_width, -half_depth, half_depth, bottom, top, LOWER_STEP + index)
    return grid


def shade(hit: Hit, swirls: dict[tuple[int, int], int]) -> tuple[int, int, int, int]:
    if hit.label == ETHER_LABEL:
        q_in = inner_distance(hit.mx + 0.5, hit.z + 0.5)
        level = 2.6 - 2.2 * q_in
        base = int(level)
        if level - base > bayer(hit.mx, hit.z):
            base += 1
        return ETHER[max(swirls.get((hit.mx, hit.z), 0), max(0, min(2, base)))]

    if hit.label >= BLOCK:
        # Another block counts as partly empty, which bevels the block edges
        normal = hit.normal(see_through=(EMPTY, ETHER_LABEL), bevel=lambda _: 0.35)
        light = hit.light(normal)
        ramp = GLOWING_STONE if inner_distance(hit.mx + 0.5, hit.z + 0.5) < 1.16 else STONE
        index = 1 if light < -0.15 else 2 if light < 0.35 else 3 if light < 0.8 else 4
        return ramp[index]

    # Paving: joints follow the model so they turn with the view
    light = hit.light(hit.normal(see_through=(EMPTY, ETHER_LABEL)))
    mx, my, z = hit.mx, hit.my, hit.z
    if hit.neighbor(0, 0, 1) == EMPTY:
        # Top face: the front edge is drawn dark so each step reads as a ledge
        if hit.neighbor(0, -1, 0) == EMPTY:
            return PAVING[0]
        row = (my + 64) // 10
        if (my + 64) % 10 == 0 or (mx + 64 + row * 7) % 14 == 0:
            return PAVING[1]
        return PAVING[3] if light > 0.6 else PAVING[2]
    # Side faces: darker, with staggered vertical joints
    if ((mx + my + 128) + (z // 4) * 6) % 12 == 0:
        return PAVING[0]
    return PAVING[1] if light < 0.5 else PAVING[2]


def crack(label: int, neighbor: int) -> tuple[int, int, int, int] | None:
    return STONE[0] if label >= BLOCK and neighbor >= BLOCK else None


def main() -> None:
    swirls = build_swirls()
    sprite = render(build_model(), 0, WIDTH, HEIGHT, ORIGIN_Y, lambda hit: shade(hit, swirls), SHADOW_RADII)
    outline(sprite, crack)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
