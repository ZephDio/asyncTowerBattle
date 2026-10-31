#!/usr/bin/env python3
"""Generates the witch house (poison tower) pixel art.

Run from anywhere: python3 scripts/generate-witch-house.py

Outputs public/resources/towers/poison-tower.png, a 96x196 front view cropped to the art: the witch house is a
vertical two-cell piece, so the model is deeper than a square one.

A grass yard with a thatched cottage at the back (stone walls, timber posts, windows glowing poison green,
crossed beams over the gable and a stone chimney). In front, a witch in a pointy hat stands with her arms
spread behind a big iron cauldron of bubbling green potion with a ladle in it. It is modeled as voxels and
rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "towers" / "poison-tower.png"
WIDTH = 96
HEIGHT = 196
ORIGIN_Y = 132
HALF_Y = 96

# Shared ramps, from dark to light
STONE = [(72, 63, 97, 255), (67, 91, 125, 255), (68, 142, 159, 255), (90, 185, 187, 255), (143, 226, 185, 255)]
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
THATCH = [(94, 71, 78, 255), (138, 103, 99, 255), (175, 140, 121, 255), (227, 193, 140, 255), (245, 239, 169, 255)]
# New ramps: the darkest step leans toward violet, lighter steps get warmer
GRASS = [(52, 70, 78, 255), (60, 104, 76, 255), (92, 146, 74, 255), (146, 190, 90, 255), (196, 222, 124, 255)]
POTION = [(60, 104, 76, 255), (98, 170, 60, 255), (164, 216, 62, 255), (226, 244, 128, 255)]
IRON = [(48, 44, 68, 255), (66, 64, 92, 255), (92, 94, 124, 255), (136, 142, 168, 255)]
ROBE = [(48, 40, 70, 255), (70, 56, 96, 255), (98, 78, 126, 255)]
SKIN = [(70, 116, 70, 255), (112, 166, 84, 255), (160, 204, 112, 255)]
HAIR = [(150, 64, 48, 255), (210, 106, 50, 255), (240, 160, 78, 255)]
HAT_BAND = (218, 181, 112, 255)

# Grass yard covering the whole footprint
YARD_HALF_X = 46
YARD_FRONT = -88
YARD_BACK = 92
YARD_HEIGHT = 3

# Cottage at the back
HOUSE_HALF_X = 32
HOUSE_FRONT = 46
HOUSE_BACK = 88
WALL_TOP = 40
POSTS_X = (-32, -29, 29, 32)
WINDOWS_X = (-19, 19)
WINDOW_HALF = 5
WINDOW_Z = (20, 32)
DOOR_HALF = 6
DOOR_HEIGHT = 28
# Gable roof, ridge along y, overhanging the walls
EAVE_HALF_X = 42
EAVE_Z = 36
ROOF_SLOPE = 1.1
ROOF_FRONT = 40
ROOF_BACK = 92
GABLE_INSET = 4
CHIMNEY = (-26, -17, 66, 75, 104)  # x0, x1, y0, y1, top

# Witch, behind the cauldron
WITCH_Y = 6
ROBE_RADII = (10, 5)
ROBE_HEIGHT = 34
ARM_LENGTH = 22
HEAD_Z = 40
HEAD_RADIUS = 6
HAT_BRIM = (9, 48)  # radius, z
HAT_HEIGHT = 24

# Cauldron in front
CAULDRON_Y = -46
CAULDRON_RADIUS = 25
CAULDRON_CENTER_Z = 26
CAULDRON_TOP = 42
POTION_Z = 39
WALL_THICKNESS = 3
BUBBLES = ((-8, -4), (4, -9), (-2, 6))
LADLE = ((9, CAULDRON_Y + 4, POTION_Z), (24, CAULDRON_Y + 14, 72))

# The yard is already ground, so there is no drop shadow: the renderer needs radii, these stay under the yard
SHADOW_RADII = (1, 1)

(
    GRASS_LABEL,
    STONE_LABEL,
    WOOD_LABEL,
    THATCH_LABEL,
    WINDOW_LABEL,
    DOOR_LABEL,
    ROBE_LABEL,
    SKIN_LABEL,
    HAIR_LABEL,
    HAT_LABEL,
    BAND_LABEL,
    IRON_LABEL,
    POTION_LABEL,
    LADLE_LABEL,
    CHIMNEY_LABEL,
) = range(1, 16)


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def roof_height(x: int) -> float:
    return EAVE_Z + (EAVE_HALF_X - abs(x + 0.5)) * ROOF_SLOPE


def build_model() -> VoxelGrid:
    grid = VoxelGrid(half_y=HALF_Y)
    build_yard(grid)
    build_house(grid)
    build_witch(grid)
    build_cauldron(grid)
    return grid


def build_yard(grid: VoxelGrid) -> None:
    for y in range(YARD_FRONT, YARD_BACK):
        for x in range(-YARD_HALF_X, YARD_HALF_X):
            # The edges are ragged so the yard reads as a lawn, not a slab
            edge = min(x + YARD_HALF_X, YARD_HALF_X - 1 - x, y - YARD_FRONT, YARD_BACK - 1 - y)
            if edge < 3 and noise(x // 2, y // 2, 1) < 0.5 - edge * 0.15:
                continue
            grid.box(x, x + 1, y, y + 1, 0, YARD_HEIGHT, GRASS_LABEL)


def build_house(grid: VoxelGrid) -> None:
    grid.box(-HOUSE_HALF_X, HOUSE_HALF_X, HOUSE_FRONT, HOUSE_BACK, YARD_HEIGHT, WALL_TOP, STONE_LABEL)
    for x0 in POSTS_X[::2]:
        x1 = POSTS_X[POSTS_X.index(x0) + 1]
        grid.box(x0, x1, HOUSE_FRONT - 1, HOUSE_BACK, YARD_HEIGHT, WALL_TOP, WOOD_LABEL)
    # Lintel beam under the eave
    grid.box(-HOUSE_HALF_X, HOUSE_HALF_X, HOUSE_FRONT - 1, HOUSE_FRONT + 1, WALL_TOP - 4, WALL_TOP, WOOD_LABEL)
    for cx in WINDOWS_X:
        grid.box(cx - WINDOW_HALF - 1, cx + WINDOW_HALF + 1, HOUSE_FRONT - 1, HOUSE_FRONT, WINDOW_Z[0] - 1,
                 WINDOW_Z[1] + 1, WOOD_LABEL)
        grid.box(cx - WINDOW_HALF, cx + WINDOW_HALF, HOUSE_FRONT - 1, HOUSE_FRONT + 1, WINDOW_Z[0], WINDOW_Z[1],
                 WINDOW_LABEL)
    # Arched door recessed in a wooden frame
    for z in range(YARD_HEIGHT, YARD_HEIGHT + DOOR_HEIGHT + 2):
        for x in range(-DOOR_HALF - 2, DOOR_HALF + 2):
            arch = YARD_HEIGHT + DOOR_HEIGHT - DOOR_HALF + math.sqrt(max(0, (DOOR_HALF + 2) ** 2 - (x + 0.5) ** 2))
            inner = YARD_HEIGHT + DOOR_HEIGHT - DOOR_HALF + math.sqrt(max(0, DOOR_HALF**2 - (x + 0.5) ** 2))
            if z < inner and abs(x + 0.5) < DOOR_HALF:
                grid.box(x, x + 1, HOUSE_FRONT - 1, HOUSE_FRONT + 2, z, z + 1, EMPTY)
                grid.set(x, HOUSE_FRONT + 2, z, DOOR_LABEL)
            elif z < arch:
                grid.box(x, x + 1, HOUSE_FRONT - 2, HOUSE_FRONT, z, z + 1, WOOD_LABEL)

    # Roof: a gable of thatch with jagged eaves, a stone gable wall and crossed beams at the front
    for x in range(-EAVE_HALF_X, EAVE_HALF_X):
        top = roof_height(x)
        for y in range(ROOF_FRONT, ROOF_BACK):
            tuft = round(noise(x // 2, y // 3, 4) * 5) if abs(x) > EAVE_HALF_X - 6 else 0
            front_tuft = round(noise(x // 3, 5) * 4) if y < ROOF_FRONT + 3 else 0
            bottom = max(EAVE_Z - tuft, top - 8) - front_tuft
            if y < ROOF_FRONT + 3 and noise(x // 2, 6) > 0.7:
                continue
            grid.box(x, x + 1, y, y + 1, round(bottom), round(top) + 1, THATCH_LABEL)
        # Gable wall under the roof, set back from the thatch edge
        for z in range(WALL_TOP, round(top) - 6):
            if abs(x) < HOUSE_HALF_X:
                grid.box(x, x + 1, ROOF_FRONT + GABLE_INSET, HOUSE_BACK, z, z + 1, STONE_LABEL)
    # Crossed beams sticking out above the front of the ridge
    apex = roof_height(0)
    for t in range(-4, 16):
        for sign in (-1, 1):
            x = sign * t
            z = round(apex - 10 + t * ROOF_SLOPE) if t >= 0 else None
            if z is None:
                continue
            grid.box(x - 1, x + 1, ROOF_FRONT - 2, ROOF_FRONT + 1, z, z + 3, WOOD_LABEL)
    x0, x1, y0, y1, top = CHIMNEY
    grid.box(x0, x1, y0, y1, WALL_TOP, top, CHIMNEY_LABEL)
    grid.box(x0 + 2, x1 - 2, y0 + 2, y1 - 2, top - 3, top, EMPTY)


def build_witch(grid: VoxelGrid) -> None:
    for z in range(YARD_HEIGHT, YARD_HEIGHT + ROBE_HEIGHT):
        t = (z - YARD_HEIGHT) / ROBE_HEIGHT
        radius = ROBE_RADII[0] + (ROBE_RADII[1] - ROBE_RADII[0]) * t
        disc(grid, 0, WITCH_Y, z, radius, ROBE_LABEL)
    # Arms spread out, the sleeves widening toward green hands
    shoulder = YARD_HEIGHT + ROBE_HEIGHT - 4
    for sign in (-1, 1):
        for step in range(3, ARM_LENGTH):
            x = sign * step
            sleeve = 1 + step // 5
            grid.box(x, x + 1, WITCH_Y - 3, WITCH_Y + 3, shoulder - sleeve - step // 4, shoulder + 3 - step // 4,
                     ROBE_LABEL)
        hand = sign * (ARM_LENGTH + 1)
        grid.box(min(hand, hand - sign * 2), max(hand, hand - sign * 2) + 1, WITCH_Y - 1, WITCH_Y + 2,
                 shoulder - 6, shoulder - 2, SKIN_LABEL)
    # Head, with orange hair spilling down the back and sides
    for z in range(HEAD_Z - 9, HEAD_Z + 8):
        for y in range(WITCH_Y - 9, WITCH_Y + 10):
            for x in range(-9, 9):
                d = math.dist((x + 0.5, y + 0.5, z + 0.5), (0, WITCH_Y, HEAD_Z))
                if d <= HEAD_RADIUS:
                    grid.set(x, y, z, SKIN_LABEL)
                elif d <= HEAD_RADIUS + 2.5 and y + 0.5 > WITCH_Y - 2 and z > HEAD_Z - 9:
                    grid.set(x, y, z, HAIR_LABEL)
    # Long nose
    grid.box(-1, 1, WITCH_Y - 10, WITCH_Y - 5, HEAD_Z - 3, HEAD_Z - 1, SKIN_LABEL)
    # Pointy hat with a brim and a band, the tip bent toward the right
    radius, brim_z = HAT_BRIM
    for z in (brim_z, brim_z + 1, brim_z + 2):
        disc(grid, 0, WITCH_Y, z, radius, HAT_LABEL)
    for z in range(brim_z + 3, brim_z + 3 + HAT_HEIGHT):
        t = (z - brim_z - 3) / HAT_HEIGHT
        bend = round(7 * t * t)
        label = BAND_LABEL if z < brim_z + 5 else HAT_LABEL
        disc(grid, bend, WITCH_Y, z, 7.5 * (1 - t) + 0.8, label)


def disc(grid: VoxelGrid, cx: float, cy: float, z: int, radius: float, label: int) -> None:
    reach = math.ceil(radius) + 1
    for y in range(math.floor(cy) - reach, math.floor(cy) + reach):
        for x in range(math.floor(cx) - reach, math.floor(cx) + reach):
            if math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= radius:
                grid.set(x, y, z, label)


def build_cauldron(grid: VoxelGrid) -> None:
    r = CAULDRON_RADIUS
    for z in range(YARD_HEIGHT + 2, CAULDRON_TOP):
        for y in range(CAULDRON_Y - r - 1, CAULDRON_Y + r + 1):
            for x in range(-r - 1, r + 1):
                d = math.dist((x + 0.5, y + 0.5, z + 0.5), (0, CAULDRON_Y, CAULDRON_CENTER_Z))
                if d > r:
                    continue
                inside = math.hypot(x + 0.5, y + 0.5 - CAULDRON_Y) < r - WALL_THICKNESS and z > CAULDRON_CENTER_Z - 6
                if not inside:
                    grid.set(x, y, z, IRON_LABEL)
                elif z < POTION_Z:
                    grid.set(x, y, z, POTION_LABEL)
    # Thick rim
    rim_radius = math.sqrt(r * r - (CAULDRON_TOP - CAULDRON_CENTER_Z) ** 2)
    for z in range(CAULDRON_TOP - 1, CAULDRON_TOP + 2):
        for y in range(CAULDRON_Y - r, CAULDRON_Y + r):
            for x in range(-r, r):
                d = math.hypot(x + 0.5, y + 0.5 - CAULDRON_Y)
                if rim_radius - 3.5 <= d <= rim_radius + 1.5:
                    grid.set(x, y, z, IRON_LABEL)
    # A few big bubbles on the surface
    for bx, by in BUBBLES:
        disc(grid, bx, CAULDRON_Y + by, POTION_Z, 2.5, POTION_LABEL)
    # Ring handles on the sides
    for sign in (-1, 1):
        cx = sign * (r + 1)
        for z in range(CAULDRON_CENTER_Z, CAULDRON_TOP + 2):
            for x in range(cx - 5, cx + 6):
                ring = math.hypot(x + 0.5 - cx, z + 0.5 - (CAULDRON_TOP - 4))
                if 3 <= ring <= 5 and sign * (x + 0.5 - cx) > -1:
                    grid.box(x, x + 1, CAULDRON_Y - 1, CAULDRON_Y + 2, z, z + 1, IRON_LABEL)
    # Ladle stirring the potion
    (x0, y0, z0), (x1, y1, z1) = LADLE
    steps = 80
    for i in range(steps + 1):
        t = i / steps
        x, y, z = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z0 + (z1 - z0) * t
        grid.box(math.floor(x), math.floor(x) + 2, math.floor(y), math.floor(y) + 2, math.floor(z),
                 math.floor(z) + 2, LADLE_LABEL)


def step(ramp: list[tuple[int, int, int, int]], index: int) -> tuple[int, int, int, int]:
    return ramp[max(0, min(len(ramp) - 1, index))]


def face_index(hit: Hit, light: float, top: int, front: int) -> int:
    """Flat step from the face orientation: top faces lightest, lit fronts a step lower, shade lower again."""
    if hit.neighbor(0, 0, 1) == EMPTY and hit.normal()[2] > 0.55:
        return top
    if light > 0.55:
        return front
    if light > 0.2:
        return front - 1
    return front - 2


def shade(hit: Hit) -> tuple[int, int, int, int]:
    normal = hit.normal()
    light = hit.light(normal)

    if hit.label == GRASS_LABEL:
        if hit.z >= YARD_HEIGHT:
            return GRASS[4] if hit.neighbor(-1, 0, 0) == EMPTY else GRASS[3]
        if hit.neighbor(0, 0, 1) != EMPTY:
            return GRASS[1]
        # Lawn: a flat base step with a few chunky lighter strokes
        base = 2
        if noise(hit.mx // 3, hit.my // 7, 8) > 0.93:
            base = 3
        # Contact shadow in front of the house and under the cauldron
        if HOUSE_FRONT - 8 <= hit.my < HOUSE_FRONT:
            base -= 1
        if math.hypot(hit.mx, hit.my - CAULDRON_Y) < CAULDRON_RADIUS + 2:
            base -= 1
        return step(GRASS, base)

    if hit.label in (STONE_LABEL, CHIMNEY_LABEL):
        index = face_index(hit, light, 4, 3)
        # Under the eave the wall sits in shadow
        if hit.label == STONE_LABEL and hit.z > WALL_TOP - 10 and hit.my <= HOUSE_FRONT + 1:
            index -= 1
        if hit.label == STONE_LABEL and hit.z >= WALL_TOP:
            index = 1
        # Masonry: staggered bricks with mortar one step lower
        row = hit.z // 6
        along = hit.mx if abs(normal[0]) < 0.5 else hit.my
        if hit.z % 6 == 0 or (along + (row % 2) * 6 + 64) % 12 == 0:
            index -= 1
        return step(STONE, index)

    if hit.label == WOOD_LABEL:
        return step(WOOD, face_index(hit, light, 3, 2))

    if hit.label == DOOR_LABEL:
        # Vertical planks, seams in the lowest step
        return WOOD[0] if (hit.mx + 64) % 6 == 0 else WOOD[1]

    if hit.label == THATCH_LABEL:
        # Cream down the ridge, straw on the slopes, mauve at the eaves, with vertical strands
        from_ridge = abs(hit.mx + 0.5) / EAVE_HALF_X
        index = 4 if from_ridge < 0.12 else 3 if from_ridge < 0.55 else 2 if from_ridge < 0.85 else 1
        if hit.mx > 0 and index > 1:
            index -= 1 if from_ridge > 0.3 else 0
        if not (hit.neighbor(0, 0, 1) == EMPTY or normal[2] > 0.3):
            index = 1 if hit.my < ROOF_FRONT + 3 else index - 1
        strand = noise(hit.mx // 2, (hit.z + hit.my) // 10, 9)
        if strand > 0.9:
            index += 1
        elif strand < 0.1:
            index -= 1
        return step(THATCH, index)

    if hit.label == WINDOW_LABEL:
        # Poison glow, brighter at the top
        return POTION[3] if hit.z >= WINDOW_Z[1] - 3 else POTION[2]

    if hit.label == POTION_LABEL:
        if hit.z >= POTION_Z:
            return POTION[3] if hit.neighbor(0, 0, 1) == EMPTY else POTION[2]
        # Darker near the rim, where the iron wall shades the surface
        return POTION[1] if math.hypot(hit.mx, hit.my - CAULDRON_Y) > CAULDRON_RADIUS - WALL_THICKNESS - 5 else POTION[2]

    if hit.label == IRON_LABEL:
        index = face_index(hit, light, 3, 2)
        # The bowl darkens toward both edges, the left one keeps a bit more light
        side = hit.mx / CAULDRON_RADIUS
        if side > 0.45 or side < -0.75:
            index -= 1
        if hit.z >= CAULDRON_TOP - 1 and hit.neighbor(0, 0, 1) == EMPTY:
            index = 3
        return step(IRON, index)

    if hit.label == LADLE_LABEL:
        lit = hit.neighbor(-1, 0, 0) == EMPTY or hit.neighbor(0, 0, 1) == EMPTY
        return WOOD[3] if lit else WOOD[1]

    if hit.label in (ROBE_LABEL, HAT_LABEL):
        index = 2 if light > 0.55 else 1 if light > 0.1 else 0
        return step(ROBE, index)
    if hit.label == BAND_LABEL:
        return HAT_BAND
    if hit.label == SKIN_LABEL:
        return step(SKIN, 2 if light > 0.55 else 1 if light > 0.1 else 0)
    if hit.label == HAIR_LABEL:
        return step(HAIR, 2 if light > 0.55 else 1 if light > 0.1 else 0)
    return (255, 0, 255, 255)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    # A material switch always has ink between the two materials
    same = {STONE_LABEL, CHIMNEY_LABEL}
    if label == other or {label, other} <= same:
        return None
    if GRASS_LABEL in (label, other):
        return None
    return (22, 28, 46, 255)


def main() -> None:
    grid = build_model()
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, SHADOW_RADII)
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
