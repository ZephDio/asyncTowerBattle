#!/usr/bin/env python3
"""Generates the corn field pixel art.

Run from anywhere: python3 scripts/generate-corn-field.py [output.png]

Outputs public/resources/totem/corn-field.png (the single front view) unless an output path is given.

A square bed of dark earth with a low rim, mounded into four rows running away from the camera. Each row holds a few
short corn plants spaced well apart, so the bed shows between them, and the back plants barely rise above the rim.
A plant is a stalk with nodes, a few arched leaves, one or two golden cobs with kernel rows, a green husk around
their base and a tuft of silk, with no tassel. It follows the tower and house art (see the
pixel-art-assets skill), modeled as voxels and rendered by voxel_sprite.py.
"""

import math
import sys
from pathlib import Path

from voxel_sprite import EMPTY, OUTLINE, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "corn-field.png"
WIDTH = 110
HEIGHT = 95
ORIGIN_Y = 55

# Ramps from dark to light
SOIL = [(58, 44, 58, 255), (78, 58, 62, 255), (104, 76, 70, 255), (134, 99, 83, 255)]
LEAF = [(28, 82, 56, 255), (46, 130, 62, 255), (92, 180, 62, 255), (160, 222, 86, 255)]
KERNEL = [(190, 120, 40, 255), (244, 184, 30, 255), (255, 218, 50, 255), (255, 244, 130, 255)]
SILK = [(110, 62, 52, 255), (150, 88, 60, 255)]
TASSEL = [(180, 131, 85, 255), (218, 181, 112, 255), (245, 230, 160, 255)]

HALF_SIZE = 50
SOIL_HEIGHT = 4
RIM_WIDTH = 4
RIM_HEIGHT = 7
# Rows run away from the camera: their x, how much they wave sideways, and the plants along each
ROW_X = (-27, 0, 27)
ROW_WAVE = 2
PLANTS_PER_ROW = 3
PLANT_SPAN = (-30, 22)
PLANT_JITTER = 3
# Mound under each row, in voxels
MOUND_HALF_WIDTH = 9
STALK_HEIGHT = (30, 34)
NODE_SPACING = 9
LEAF_LENGTH = (9, 12)
# Cob: radius and half length along its axis, and how far it leans out from the stalk
COB_RADIUS = 4.2
COB_HALF_LENGTH = 9.5
COB_LEAN = 0.35
# The shadow is the bed's square, shifted away from the top-left light
SHADOW_MARGIN = 2
SHADOW_OFFSET = (1, -2)
SHADOW_JITTER = 0.04
SHADOW_RADII = (1, 1)

SOIL_LABEL, RIM_LABEL = 1, 2
# One label per plant and part, so neighbor plants get an ink seam between them
STALK, LEAF_LABEL, COB, HUSK, TOP = 20, 60, 100, 140, 180
PARTS = (STALK, LEAF_LABEL, COB, HUSK, TOP)


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def part(label: int) -> int:
    return max(p for p in PARTS if label >= p) if label >= STALK else label


def plant(label: int) -> int:
    return label - part(label)


# Cob axes by plant, to shade kernels in the cob's own coordinates
COBS: dict[int, list[tuple[tuple[float, float, float], tuple[float, float, float]]]] = {}


def add_leaf(grid: VoxelGrid, label: int, x: int, y: int, z: int, angle: float, length: int) -> None:
    """A 2 voxel thick blade rising away from the stalk, then arching down at the tip."""
    dx, dy = math.cos(angle), math.sin(angle)
    for step in range(1, length + 1):
        t = step / length
        lift = 4 * t - 7 * t * t
        lx, ly, lz = x + round(dx * step), y + round(dy * step), z + round(lift)
        grid.box(lx, lx + 4, ly, ly + 3, lz, lz + 4, label)


def add_cob(grid: VoxelGrid, index: int, x: float, y: float, z: float, side: float) -> None:
    """A golden cob leaning out from the stalk, a green husk around its lower half and silk at its tip."""
    axis_x, axis_y = math.cos(side) * COB_LEAN, math.sin(side) * COB_LEAN * 0.5
    length = math.sqrt(axis_x * axis_x + axis_y * axis_y + 1)
    axis = (axis_x / length, axis_y / length, 1 / length)
    center = (x + axis[0] * (COB_HALF_LENGTH + 1), y + axis[1] * (COB_HALF_LENGTH + 1), z + axis[2] * COB_HALF_LENGTH)
    COBS.setdefault(index, []).append((center, axis))
    reach = int(COB_HALF_LENGTH + COB_RADIUS + 3)
    cx, cy, cz = (round(c) for c in center)
    for vz in range(cz - reach, cz + reach + 1):
        for vy in range(cy - reach, cy + reach + 1):
            for vx in range(cx - reach, cx + reach + 1):
                px, py, pz = vx + 0.5 - center[0], vy + 0.5 - center[1], vz + 0.5 - center[2]
                t = px * axis[0] + py * axis[1] + pz * axis[2]
                d = math.sqrt(max(0.0, px * px + py * py + pz * pz - t * t))
                u = t / COB_HALF_LENGTH
                if abs(u) <= 1 and d <= COB_RADIUS * math.sqrt(1 - u * u * u * u) + 0.3:
                    grid.set(vx, vy, vz, COB + index)
                elif -1.2 <= u <= -0.45 and d <= COB_RADIUS + 0.8:
                    # Husk: a short sheath around the base, one flap rising along the outer side
                    grid.set(vx, vy, vz, HUSK + index)
                elif 1 <= u <= 1.35 and d <= 1.2:
                    grid.set(vx, vy, vz, TOP + index)


def add_plant(grid: VoxelGrid, index: int, x: int, y: int) -> None:
    height = STALK_HEIGHT[0] + round(noise(index, 1) * (STALK_HEIGHT[1] - STALK_HEIGHT[0]))
    lean = (noise(index, 2) - 0.5) * 0.12
    base = SOIL_HEIGHT + 1
    for z in range(base - 2, base + height):
        sx = x + round(lean * (z - base))
        width = 6 if z < base + height * 0.7 else 5
        grid.box(sx, sx + width, y, y + 4, z, z + 1, STALK + index)
    # Leaves from the nodes, alternating sides and mostly sideways so the camera sees them
    side = math.pi if noise(index, 3) < 0.5 else 0.0
    for n, z in enumerate(range(base + 3, base + height - 3, NODE_SPACING)):
        angle = side + n * math.pi + (noise(index, n, 4) - 0.5) * 0.9
        length = LEAF_LENGTH[0] + round(noise(index, n, 5) * (LEAF_LENGTH[1] - LEAF_LENGTH[0]))
        add_leaf(grid, LEAF_LABEL + index, x + round(lean * (z - base)), y, z, angle, length)
    # One cob, sometimes two, on the side opposite to the lowest leaf
    cob_x = x + 6 if side == math.pi else x - 3
    add_cob(grid, index, cob_x, y, base + round(height * 0.25), side + math.pi)


def mound(x: int) -> int:
    """Height of the bed at x: a low mound under each row."""
    near = min(abs(x - row) for row in ROW_X)
    return SOIL_HEIGHT + (1 if near <= MOUND_HALF_WIDTH else 0)


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    inner = HALF_SIZE - RIM_WIDTH
    grid.box(-HALF_SIZE, HALF_SIZE, -HALF_SIZE, HALF_SIZE, 0, RIM_HEIGHT, RIM_LABEL)
    grid.box(-inner, inner, -inner, inner, 0, RIM_HEIGHT, EMPTY)
    for x in range(-inner, inner):
        grid.box(x, x + 1, -inner, inner, 0, mound(x), SOIL_LABEL)

    index = 0
    for row, rx in enumerate(ROW_X):
        for n in range(PLANTS_PER_ROW):
            y = PLANT_SPAN[0] + (PLANT_SPAN[1] - PLANT_SPAN[0]) * n / (PLANTS_PER_ROW - 1)
            y += (noise(row, n, 10) - 0.5) * 2 * PLANT_JITTER
            x = rx + ROW_WAVE * math.sin(y / 14 + row * 1.7)
            add_plant(grid, index, round(x), round(y))
            index += 1
    return grid


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    """Ink between the soil and the rim, between plants, and between a cob and its husk."""
    if {label, other} == {SOIL_LABEL, RIM_LABEL}:
        return OUTLINE
    if label >= STALK and other >= STALK:
        if plant(label) != plant(other) or {part(label), part(other)} == {COB, HUSK}:
            return OUTLINE
    return None


def kernel_step(hit: Hit, index: int) -> int:
    """Kernel rows: cells about 2 voxels along the cob and around it, darker between cells."""
    best = None
    for center, axis in COBS.get(index, []):
        px, py, pz = hit.mx + 0.5 - center[0], hit.my + 0.5 - center[1], hit.z + 0.5 - center[2]
        t = px * axis[0] + py * axis[1] + pz * axis[2]
        distance = abs(t) + abs(px * axis[2] - pz * axis[0])
        if best is None or distance < best[0]:
            best = (distance, t, math.atan2(pz * axis[0] - px * axis[2], py))
    if best is None:
        return 0
    _, t, around = best
    along = math.floor((t + 30) / 2.5) % 2
    column = math.floor((around + math.pi) / (math.pi / 3)) % 2
    return -1 if along != column else 0


def shade(hit: Hit) -> tuple[int, int, int, int]:
    lit_top = hit.neighbor(0, 0, 1) == EMPTY
    if hit.label == RIM_LABEL:
        return SOIL[3] if lit_top else SOIL[2 if noise(hit.mx // 3, hit.z, 5) > 0.3 else 1]
    if hit.label == SOIL_LABEL:
        if hit.z >= SOIL_HEIGHT:
            return SOIL[2] if lit_top else SOIL[1]
        # Bare earth between the mounds, with a few clods
        return SOIL[1] if noise(hit.mx // 2, hit.my // 2, 7) > 0.85 else SOIL[0 if not lit_top else 1]

    kind, index = part(hit.label), plant(hit.label)
    light = hit.light(hit.normal())
    if kind == COB:
        step = 3 if lit_top and light > 0.3 else (2 if light > 0.1 else 1)
        if hit.neighbor(-1, 0, 0) == EMPTY and step < 3:
            step += 1
        return KERNEL[max(0, min(3, step + kernel_step(hit, index)))]
    if kind == TOP:
        if hit.z < SOIL_HEIGHT + 1 + STALK_HEIGHT[0] - 2:
            return SILK[1 if light > 0.2 else 0]
        return TASSEL[2 if lit_top else (1 if light > 0.2 else 0)]
    # Stalk, leaves and husk: flat steps from the empty neighbors, as thin shapes have noisy normals
    step = 3 if lit_top else 2
    if hit.neighbor(1, 0, 0) != EMPTY and hit.neighbor(-1, 0, 0) != EMPTY and not lit_top:
        step = 1
    elif hit.neighbor(-1, 0, 0) != EMPTY and hit.neighbor(1, 0, 0) == EMPTY:
        step -= 1
    if kind == STALK:
        if (hit.z - SOIL_HEIGHT - 4) % NODE_SPACING == 0:
            step -= 1
        if hit.z < SOIL_HEIGHT + 4:
            step = 0
    if kind == HUSK:
        step = max(step, 2)
    return LEAF[max(0, min(3, step))]


def bed_shadow(x: float, y: float) -> float:
    half = HALF_SIZE + SHADOW_MARGIN
    return max(abs(x - SHADOW_OFFSET[0]), abs(y - SHADOW_OFFSET[1])) / half


def main() -> None:
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else OUTPUT
    grid = build_model()
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, SHADOW_RADII, SHADOW_JITTER, shadow_shape=bed_shadow)
    outline(sprite, crack, depth_gap=5, depth_width=1)
    write_png(output, sprite.pixels)
    print(f"wrote {output}")


if __name__ == "__main__":
    main()
