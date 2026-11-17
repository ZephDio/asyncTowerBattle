#!/usr/bin/env python3
"""Generates the forging anvil totem pixel art.

Run from anywhere: python3 scripts/generate-anvil.py

Outputs public/resources/totem/anvil.png, the single front view.

An iron anvil with a horn on each side sits on a stone pedestal pierced by an arch. Two brass gears are half sunk
in the anvil face, and a hammer grows out of each gear hub, one leaning left and one leaning right, matching the
totem's effect on the pieces at its left and right. It is modeled as voxels and rendered by voxel_sprite.py, which
holds the camera, lighting and outlines.
"""

import math
from typing import Callable
from pathlib import Path

from voxel_sprite import EMPTY, OUTLINE, Hit, Sprite, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "anvil.png"
WIDTH = 128
HEIGHT = 104
ORIGIN_Y = 86

# Ramps from dark to light
IRON = [(38, 42, 58, 255), (58, 64, 86, 255), (84, 92, 116, 255), (120, 128, 152, 255), (168, 176, 196, 255)]
STONE = [(72, 66, 74, 255), (104, 96, 102, 255), (138, 128, 128, 255), (172, 162, 154, 255)]
BRASS = [(124, 76, 38, 255), (184, 126, 50, 255), (226, 176, 74, 255), (246, 216, 120, 255)]
# Wood shared with the towers and houses
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
ARCH_DARK = (40, 32, 40, 255)
MORTAR = (64, 58, 66, 255)

# Stone pedestal with an arch through it, its side walls sloping out toward the ground like a pyramid
PEDESTAL_HALF_X = 19
PEDESTAL_BOTTOM_HALF_X = 32
PEDESTAL_HALF_Y = 10
PEDESTAL_HEIGHT = 30
ARCH_HALF_WIDTH = 7
ARCH_HEIGHT = 21
BRICK_HEIGHT = 6
BRICK_LENGTH = 10

# Anvil body: a waist flaring into a wide face, then a block and a pointed horn on each side
BODY_HALF_Y = 13
WAIST_HALF_X = PEDESTAL_HALF_X
FACE_HALF_X = 30
FACE_BOTTOM = 40
FACE_TOP = 58
HORN_BLOCK_END = 42
HORN_BLOCK_HALF = (9, 6)  # half depth, half height
HORN_TIP = 58
HORN_CENTER_Z = 50
BAND_Z = 43

# Gears half out of the face, in the plane facing the camera
GEAR_X = 13
GEAR_RADIUS = 8.5
GEAR_TOOTH = 3
GEAR_TEETH = 7
GEAR_HUB = 3
GEAR_HALF_DEPTH = 3
# Gears sit against the front edge of the face so their lower half sinks into it and the teeth show above it
GEAR_Y = -BODY_HALF_Y + GEAR_HALF_DEPTH + 1

# Hammers: a handle from each gear hub, tilted away from vertical, with a head across its end
HAMMER_TILT = 38
HANDLE_LENGTH = 50
HANDLE_HALF = 2
HEAD_HALF_LENGTH = 14
HEAD_HALF_THICKNESS = 6
HEAD_HALF_DEPTH = 5
COLLAR_LENGTH = 3

# The shadow is the anvil's own footprint seen from above (pedestal, body, horns tapering to points), grown by a
# margin and shifted away from the top-left light: toward the right and toward the camera, in voxels
SHADOW_MARGIN = 3
SHADOW_OFFSET = (2, -5)
# Ignored by the renderer since shadow_shape replaces the ellipse
SHADOW_RADII = (1, 1)

STONE_LABEL, ARCH_LABEL, IRON_LABEL, BAND_LABEL, BRASS_LABEL, WOOD_LABEL, HEAD_LABEL, COLLAR_LABEL, AXLE_LABEL = range(1, 10)


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    for z in range(PEDESTAL_HEIGHT):
        t = z / (PEDESTAL_HEIGHT - 1)
        half = round(PEDESTAL_BOTTOM_HALF_X + (PEDESTAL_HALF_X - PEDESTAL_BOTTOM_HALF_X) * t)
        grid.box(-half, half, -PEDESTAL_HALF_Y, PEDESTAL_HALF_Y, z, z + 1, STONE_LABEL)
    # The arch is a shallow alcove with a dark back wall, so it reads as a doorway
    for z in range(ARCH_HEIGHT + ARCH_HALF_WIDTH):
        for x in range(-ARCH_HALF_WIDTH, ARCH_HALF_WIDTH):
            top = ARCH_HEIGHT - ARCH_HALF_WIDTH + math.sqrt(max(0, ARCH_HALF_WIDTH**2 - (x + 0.5) ** 2))
            if z < top:
                grid.box(x, x + 1, -PEDESTAL_HALF_Y, -PEDESTAL_HALF_Y + 5, z, z + 1, EMPTY)
                grid.set(x, -PEDESTAL_HALF_Y + 5, z, ARCH_LABEL)

    # The waist flares out from the pedestal up to the face
    for z in range(PEDESTAL_HEIGHT, FACE_BOTTOM):
        t = (z - PEDESTAL_HEIGHT) / (FACE_BOTTOM - PEDESTAL_HEIGHT)
        half = round(WAIST_HALF_X + (FACE_HALF_X - WAIST_HALF_X) * math.sqrt(t))
        grid.box(-half, half, -PEDESTAL_HALF_Y, PEDESTAL_HALF_Y, z, z + 1, IRON_LABEL)
    grid.box(-FACE_HALF_X, FACE_HALF_X, -BODY_HALF_Y, BODY_HALF_Y, FACE_BOTTOM, FACE_TOP, IRON_LABEL)
    grid.box(-FACE_HALF_X, FACE_HALF_X, -BODY_HALF_Y, BODY_HALF_Y, BAND_Z, BAND_Z + 2, BAND_LABEL)

    half_y, half_z = HORN_BLOCK_HALF
    for sign in (-1, 1):
        x0, x1 = sorted((sign * FACE_HALF_X, sign * HORN_BLOCK_END))
        grid.box(x0, x1, -half_y, half_y, HORN_CENTER_Z - half_z, HORN_CENTER_Z + half_z, IRON_LABEL)
        # The horn tapers to a point
        for step in range(HORN_TIP - HORN_BLOCK_END):
            t = 1 - step / (HORN_TIP - HORN_BLOCK_END)
            ry, rz = (half_y - 1) * t, (half_z - 1) * t
            x = sign * (HORN_BLOCK_END + step) - (1 if sign < 0 else 0)
            for y in range(-half_y, half_y):
                for z in range(HORN_CENTER_Z - half_z, HORN_CENTER_Z + half_z):
                    dy, dz = (y + 0.5) / max(ry, 0.6), (z + 0.5 - HORN_CENTER_Z) / max(rz, 0.6)
                    if dy * dy + dz * dz <= 1:
                        grid.set(x, y, z, IRON_LABEL)

    for sign in (-1, 1):
        add_gear(grid, sign * GEAR_X)
        add_hammer(grid, sign)
    return grid


def add_gear(grid: VoxelGrid, cx: int) -> None:
    reach = math.ceil(GEAR_RADIUS + GEAR_TOOTH)
    for z in range(FACE_TOP - reach, FACE_TOP + reach):
        for x in range(cx - reach, cx + reach):
            dx, dz = x + 0.5 - cx, z + 0.5 - FACE_TOP
            r = math.hypot(dx, dz)
            angle = math.atan2(dz, dx) + math.pi / GEAR_TEETH / 2
            tooth = math.cos(angle * GEAR_TEETH) > 0.3
            if r < GEAR_HUB:
                grid.box(x, x + 1, GEAR_Y - GEAR_HALF_DEPTH - 1, GEAR_Y + GEAR_HALF_DEPTH, z, z + 1, AXLE_LABEL)
            elif GEAR_HUB <= r <= GEAR_RADIUS or (r <= GEAR_RADIUS + GEAR_TOOTH and tooth):
                grid.box(x, x + 1, GEAR_Y - GEAR_HALF_DEPTH, GEAR_Y + GEAR_HALF_DEPTH, z, z + 1, BRASS_LABEL)


def add_hammer(grid: VoxelGrid, sign: int) -> None:
    tilt = math.radians(HAMMER_TILT)
    direction = (sign * math.sin(tilt), math.cos(tilt))
    across = (direction[1], -direction[0])
    start = (sign * GEAR_X, FACE_TOP)
    head = (start[0] + direction[0] * HANDLE_LENGTH, start[1] + direction[1] * HANDLE_LENGTH)
    reach = HANDLE_LENGTH + HEAD_HALF_LENGTH + 2
    for z in range(FACE_TOP - 2, FACE_TOP + reach):
        for x in range(-reach, reach):
            px, pz = x + 0.5, z + 0.5
            # Handle
            u = (px - start[0]) * direction[0] + (pz - start[1]) * direction[1]
            v = (px - start[0]) * across[0] + (pz - start[1]) * across[1]
            if 0 <= u <= HANDLE_LENGTH and abs(v) <= HANDLE_HALF:
                collar = HANDLE_LENGTH - HEAD_HALF_THICKNESS - COLLAR_LENGTH <= u
                label = COLLAR_LABEL if collar else WOOD_LABEL
                grid.box(x, x + 1, GEAR_Y - 2, GEAR_Y + 2, z, z + 1, label)
            # Head across the handle end, its striking faces flared a little
            hu = (px - head[0]) * direction[0] + (pz - head[1]) * direction[1]
            hv = (px - head[0]) * across[0] + (pz - head[1]) * across[1]
            flare = 1 if abs(hv) > HEAD_HALF_LENGTH - 3 else 0
            if abs(hv) <= HEAD_HALF_LENGTH and abs(hu) <= HEAD_HALF_THICKNESS + flare:
                depth = HEAD_HALF_DEPTH + flare
                grid.box(x, x + 1, GEAR_Y - depth, GEAR_Y + depth, z, z + 1, HEAD_LABEL)


def ramp(colors: list[tuple[int, int, int, int]], light: float) -> tuple[int, int, int, int]:
    steps = [0.1, 0.45, 0.75, 0.93][: len(colors) - 1]
    return colors[sum(light >= step for step in steps)]


def shade(hit: Hit) -> tuple[int, int, int, int]:
    if hit.label == ARCH_LABEL:
        return ARCH_DARK
    if hit.label in (WOOD_LABEL, COLLAR_LABEL):
        # Thin handles get noisy normals: light the faces with empty space up or left of them
        lit = hit.neighbor(0, 0, 1) == EMPTY or hit.neighbor(-1, 0, 0) == EMPTY
        shaded = hit.neighbor(0, 0, -1) == EMPTY or hit.neighbor(1, 0, 0) == EMPTY
        colors = BRASS if hit.label == COLLAR_LABEL else WOOD
        if lit and not shaded:
            return colors[3]
        if shaded and not lit:
            return colors[1]
        return colors[2]

    light = hit.light(hit.normal())
    if hit.label == STONE_LABEL:
        row = hit.z // BRICK_HEIGHT
        offset = (BRICK_LENGTH // 2) * (row % 2)
        along = hit.mx
        if hit.neighbor(0, 0, 1) != EMPTY:
            if hit.z % BRICK_HEIGHT == 0 or (along + offset + 64) % BRICK_LENGTH == 0:
                return MORTAR
        return ramp(STONE, light)
    if hit.label == BRASS_LABEL:
        # Teeth are thin, so shade by open faces: tooth tops catch the light, the front face is mid tone
        if hit.neighbor(0, 0, 1) == EMPTY or hit.neighbor(-1, 0, 0) == EMPTY:
            return BRASS[3]
        if hit.neighbor(1, 0, 0) == EMPTY or hit.neighbor(0, 0, -1) == EMPTY:
            return BRASS[1]
        return BRASS[2]
    if hit.label == AXLE_LABEL:
        return IRON[0] if light < 0.6 else IRON[1]
    if hit.label == BAND_LABEL:
        return ramp(BRASS, light - 0.1)
    return ramp(IRON, light)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    if {label, other} & {BRASS_LABEL, HEAD_LABEL, WOOD_LABEL, COLLAR_LABEL, AXLE_LABEL}:
        return (22, 28, 46, 255)
    if {label, other} == {STONE_LABEL, IRON_LABEL}:
        return (22, 28, 46, 255)
    return None


def outline_gears(sprite: Sprite) -> None:
    """Outlines the gear teeth against the anvil face behind them, which the large depth gap leaves unmarked."""
    gear = (BRASS_LABEL, AXLE_LABEL)
    marked = []
    for y in range(sprite.height):
        for x in range(sprite.width):
            if sprite.labels[y][x] <= 0 or sprite.labels[y][x] in gear:
                continue
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if sprite.label_at(nx, ny) in gear and sprite.depths[y][x] > sprite.depths[ny][nx] + 1:
                    marked.append((x, y))
                    break
    for x, y in marked:
        sprite.pixels[y][x] = OUTLINE


def footprint_shadow(grid: VoxelGrid) -> Callable[[float, float], float]:
    """Shadow shape from the top-down footprint of the anvil and its pedestal, hammers and gears left out.

    Returns the distance to the footprint in units of SHADOW_MARGIN, so 1 or less is in shadow.
    """
    solid = (STONE_LABEL, IRON_LABEL, BAND_LABEL)
    cells = {
        (x, y)
        for x in range(-grid.half_x, grid.half_x)
        for y in range(-grid.half_y, grid.half_y)
        if any(grid.get(x, y, z) in solid for z in range(FACE_TOP))
    }
    distances: dict[tuple[int, int], float] = {}
    reach = SHADOW_MARGIN + 2
    for cx, cy in cells:
        for dy in range(-reach, reach + 1):
            for dx in range(-reach, reach + 1):
                key = (cx + dx + SHADOW_OFFSET[0], cy + dy + SHADOW_OFFSET[1])
                # Diamond distance keeps the horn tips pointed instead of rounding them
                d = (abs(dx) + abs(dy)) / SHADOW_MARGIN
                if d < distances.get(key, 2):
                    distances[key] = d

    def shape(x: float, y: float) -> float:
        return distances.get((math.floor(x), math.floor(y)), 2)

    return shape


def main() -> None:
    grid = build_model()
    sprite = render(
        grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, SHADOW_RADII, shadow_jitter=0.2, shadow_shape=footprint_shadow(grid)
    )
    # A large gap keeps the stepped slope of the pedestal from being outlined at every step
    outline(sprite, crack, depth_gap=10)
    outline_gears(sprite)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
