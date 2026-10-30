#!/usr/bin/env python3
"""Generates the crops field (wheat field) pixel art, one image per orientation view.

Run from anywhere: python3 scripts/generate-crops-field.py

Outputs public/resources/totem/crops-field/<front|back|left|right>-view.png.

A square bed of tilled soil framed by wooden planks, with rows of ripe wheat growing on the furrow ridges and
leaning a little in the wind. It is modeled as voxels and rendered by voxel_sprite.py, which holds the camera,
lighting and outlines. The field is square, so every view is a true quarter turn.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public" / "resources" / "totem" / "crops-field"
WIDTH = 128
HEIGHT = 116
ORIGIN_Y = 72

# Wood shared with the towers, from dark to light
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
SOIL = [(56, 40, 40, 255), (78, 56, 50, 255), (104, 74, 60, 255), (128, 94, 72, 255)]
STEM = [(118, 104, 52, 255), (156, 138, 66, 255), (196, 172, 86, 255)]
EAR = [(140, 84, 38, 255), (196, 132, 52, 255), (226, 176, 74, 255), (246, 216, 120, 255)]

HALF_SIZE = 50
FRAME_WIDTH = 4
FRAME_HEIGHT = 8
SOIL_HEIGHT = 4
FURROW_SPACING = 10
RIDGE_HEIGHT = 3
# Wheat grows in tufts on a jittered grid rather than in rows: rows seen along their length collapse into lines,
# and the gaps between tufts keep the field from reading as one flat mass
TUFT_SPACING = 9
TUFT_JITTER = 2
STALKS_PER_TUFT = (4, 7)
TUFT_RADIUS = 2.5
STALK_HEIGHT = (15, 23)
EAR_HEIGHT = 8
# Horizontal drift of a stalk top, in voxels: toward model +x for the wind, away from the tuft center to fan out
WIND = 2.5
FAN = 3
SHADOW_RADII = (62, 62)

FRAME, SOIL_LABEL, STEM_LABEL, EAR_LABEL, EAR_TIP = 1, 2, 3, 4, 5

VIEWS = {"front-view": 0, "back-view": 180, "right-view": 90, "left-view": -90}


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def ridge_top(y: int) -> int:
    """Soil height at model row y: furrows run along x, ridges peak between them."""
    phase = (y + HALF_SIZE) % FURROW_SPACING
    bump = math.sin(math.pi * phase / FURROW_SPACING)
    return SOIL_HEIGHT + round(RIDGE_HEIGHT * bump)


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    inner = HALF_SIZE - FRAME_WIDTH
    grid.box(-HALF_SIZE, HALF_SIZE, -HALF_SIZE, HALF_SIZE, 0, FRAME_HEIGHT, FRAME)
    grid.box(-inner, inner, -inner, inner, 0, FRAME_HEIGHT, EMPTY)
    for y in range(-inner, inner):
        top = ridge_top(y)
        grid.box(-inner, inner, y, y + 1, 0, top, SOIL_LABEL)

    margin = TUFT_JITTER + 4
    for ty in range(-inner + margin, inner - margin + 1, TUFT_SPACING):
        for tx in range(-inner + margin, inner - margin, TUFT_SPACING):
            cx = tx + round((noise(tx, ty, 1) * 2 - 1) * TUFT_JITTER)
            cy = ty + round((noise(tx, ty, 2) * 2 - 1) * TUFT_JITTER)
            count = STALKS_PER_TUFT[0] + round(noise(tx, ty, 3) * (STALKS_PER_TUFT[1] - STALKS_PER_TUFT[0]))
            for index in range(count):
                angle = 2 * math.pi * (index + noise(tx, ty, index, 4)) / count
                distance = TUFT_RADIUS * (0.4 + 0.6 * noise(tx, ty, index, 5))
                plant_stalk(grid, cx + round(math.cos(angle) * distance), cy + round(math.sin(angle) * distance), angle)
    return grid


def plant_stalk(grid: VoxelGrid, x: int, y: int, fan_angle: float) -> None:
    base = ridge_top(y)
    height = STALK_HEIGHT[0] + round(noise(x, y, 3) * (STALK_HEIGHT[1] - STALK_HEIGHT[0]))
    lean_x = WIND * (0.6 + 0.8 * noise(x, y, 4)) + FAN * math.cos(fan_angle)
    lean_y = FAN * math.sin(fan_angle)

    def drift(z: int) -> tuple[int, int]:
        t = (z - base) / (height + EAR_HEIGHT)
        return x + round(lean_x * t * t), y + round(lean_y * t * t)

    for z in range(base, base + height):
        sx, sy = drift(z)
        grid.set(sx, sy, z, STEM_LABEL)
    # The ear: a 2x2 core with grains sticking out on alternating sides, darker at the bottom, and a short awn
    for z in range(base + height, base + height + EAR_HEIGHT):
        sx, sy = drift(z)
        label = EAR_TIP if z >= base + height + EAR_HEIGHT // 2 else EAR_LABEL
        grid.box(sx, sx + 2, sy, sy + 2, z, z + 1, label)
        if (z - base) % 2 == 0:
            grid.set(sx - 1, sy, z, label)
        else:
            grid.set(sx + 2, sy + 1, z, label)
    top = base + height + EAR_HEIGHT
    for z in (top, top + 1):
        sx, sy = drift(z)
        grid.set(sx + 1, sy, z, EAR_TIP)


def shade(hit: Hit) -> tuple[int, int, int, int]:
    if hit.label in (EAR_LABEL, EAR_TIP):
        # Thin shapes get noisy normals, so light faces directly: top and left are lit, right is in shade
        lit = hit.neighbor(0, 0, 1) == EMPTY or hit.neighbor(-1, 0, 0) == EMPTY
        shaded = hit.neighbor(1, 0, 0) != EMPTY and not lit
        if hit.label == EAR_TIP:
            return EAR[3] if lit else EAR[1] if shaded else EAR[2]
        return EAR[2] if lit else EAR[0] if shaded else EAR[1]
    if hit.label == STEM_LABEL:
        if hit.neighbor(-1, 0, 0) == EMPTY and hit.z % 3:
            return STEM[2]
        return STEM[1] if hit.z % 4 else STEM[0]

    light = hit.light(hit.normal())
    if hit.label == SOIL_LABEL:
        index = 0 if light < 0.2 else 1 if light < 0.6 else 2 if light < 0.9 else 3
        # A few clods catch the light
        if index < 3 and noise(hit.mx, hit.my, hit.z) > 0.93:
            index += 1
        return SOIL[index]

    # Frame planks run along each side, with a seam every few voxels
    if hit.neighbor(0, 0, 1) == EMPTY:
        along = hit.mx if abs(hit.my) > abs(hit.mx) else hit.my
        return WOOD[1] if (along + 64) % 13 == 0 else WOOD[3]
    if hit.z == FRAME_HEIGHT // 2:
        return WOOD[0]
    return WOOD[1] if light < 0.4 else WOOD[2]


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    grid = build_model()
    for name, yaw in VIEWS.items():
        sprite = render(grid, yaw, WIDTH, HEIGHT, ORIGIN_Y, shade, SHADOW_RADII)
        # A large gap keeps the depth outline to the field edges instead of every stalk in front of another
        outline(sprite, depth_gap=10)
        write_png(OUTPUT_DIR / f"{name}.png", sprite.pixels)
    print(f"wrote {len(VIEWS)} views to {OUTPUT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
