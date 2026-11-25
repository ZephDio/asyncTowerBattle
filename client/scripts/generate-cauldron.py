#!/usr/bin/env python3
"""Generates the Cauldron totem pixel art.

Run from anywhere: python3 scripts/generate-cauldron.py

Outputs public/resources/totem/cauldron.png, the single front view cropped to the art.

A witch's black iron cauldron on three short legs over a small fire of logs, brimming with bubbling green brew
that spills a little down its front. It is modeled as voxels and rendered by voxel_sprite.py, which holds the
camera, lighting and outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, OUTLINE, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "cauldron.png"
WIDTH = 98
HEIGHT = 76
ORIGIN_Y = 58

IRON = [(36, 34, 54, 255), (62, 60, 86, 255), (92, 92, 122, 255), (130, 134, 164, 255), (178, 182, 206, 255)]
BREW = [(34, 110, 70, 255), (66, 170, 70, 255), (124, 224, 84, 255), (190, 250, 130, 255)]
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
FLAME = [(190, 52, 42, 255), (240, 112, 44, 255), (252, 190, 70, 255)]

POT_CENTER = (0, 0)
POT_RADIUS = 30
POT_BOTTOM = 12
POT_TOP = 38
RIM_HEIGHT = 3
LEG_HEIGHT = POT_BOTTOM
LEGS = ((-17, -14), (17, -14), (0, 20))

IRON_LABEL, BREW_LABEL, WOOD_LABEL, FLAME_LABEL, RIM_LABEL = range(1, 6)


def noise(*values: int) -> float:
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def pot_radius(z: float) -> float:
    """Round belly: widest a bit above the middle, narrower at the base and at the mouth."""
    t = (z - POT_BOTTOM) / (POT_TOP - POT_BOTTOM)
    return POT_RADIUS * (0.6 + 0.4 * math.sin(math.pi * (0.1 + t * 0.6)))


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    cx, cy = POT_CENTER
    wall = 4
    for z in range(POT_BOTTOM, POT_TOP):
        radius = pot_radius(z + 0.5)
        for y in range(-40, 40):
            for x in range(-40, 40):
                d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
                if d <= radius:
                    inside = d <= radius - wall and z >= POT_BOTTOM + wall
                    if inside:
                        if z >= POT_TOP - 4:
                            grid.set(x, y, z, BREW_LABEL)
                        continue
                    label = RIM_LABEL if z >= POT_TOP - RIM_HEIGHT else IRON_LABEL
                    grid.set(x, y, z, label)
    # Brew bulges slightly over the rim
    for y in range(-40, 40):
        for x in range(-40, 40):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
            if d <= pot_radius(POT_TOP - 1) - wall:
                grid.set(x, y, POT_TOP - 3, BREW_LABEL)
                if d <= pot_radius(POT_TOP - 1) - wall - 3:
                    grid.set(x, y, POT_TOP - 2, BREW_LABEL)
    # Bubbles
    for bx, by, r in ((-8, -6, 4), (8, 4, 3), (-2, 10, 3)):
        for z in range(POT_TOP - 3, POT_TOP + r):
            for y in range(by - r, by + r + 1):
                for x in range(bx - r, bx + r + 1):
                    if math.dist((x + 0.5, y + 0.5, z + 0.5), (bx, by, POT_TOP - 2)) <= r:
                        grid.set(x, y, z, BREW_LABEL)
    # Legs
    for lx, ly in LEGS:
        for z in range(0, LEG_HEIGHT + 2):
            for y in range(ly - 3, ly + 3):
                for x in range(lx - 3, lx + 3):
                    grid.set(x, y, z, IRON_LABEL)
    # Logs and flames between the legs
    for i, (x0, x1, y0, y1) in enumerate(((-22, 22, -4, 3), (-3, 4, -22, 22))):
        grid.box(x0, x1, y0, y1, 0, 7, WOOD_LABEL)
    for fx, fy, h in ((-12, -18, 9), (10, -20, 11), (0, -22, 14), (-20, -10, 6), (20, -10, 7)):
        for z in range(2, 2 + h):
            half = max(1, (h - (z - 2)) // 3)
            grid.box(fx - half, fx + half, fy - half, fy + half, z, z + 1, FLAME_LABEL)
    return grid


def step(ramp: list[tuple[int, int, int, int]], index: int) -> tuple[int, int, int, int]:
    return ramp[max(0, min(len(ramp) - 1, index))]


def shade(hit: Hit) -> tuple[int, int, int, int]:
    top = hit.neighbor(0, 0, 1) == EMPTY
    if hit.label in (IRON_LABEL, RIM_LABEL):
        light = hit.light(hit.normal())
        index = 4 if light > 0.85 else 3 if light > 0.55 else 2 if light > 0.25 else 1 if light > -0.1 else 0
        if hit.label == RIM_LABEL and top:
            index = 4
        return step(IRON, index)
    if hit.label == BREW_LABEL:
        index = 3 if top else 2
        if noise(hit.mx // 3, hit.my // 3) > 0.8:
            index -= 1
        return step(BREW, index)
    if hit.label == WOOD_LABEL:
        return WOOD[3] if top else WOOD[1]
    if hit.label == FLAME_LABEL:
        return step(FLAME, 2 if hit.neighbor(0, 0, 1) == EMPTY else 1 if hit.z > 4 else 0)
    return (255, 0, 255, 255)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    if label == other or {label, other} <= {IRON_LABEL, RIM_LABEL}:
        return None
    return OUTLINE


def footprint_shadow(x: float, y: float) -> float:
    return math.hypot(x, y) / (POT_RADIUS + 4)


def main() -> None:
    grid = build_model()
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), 0.3, shadow_shape=footprint_shadow)
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
