#!/usr/bin/env python3
"""Generates the brewery pixel art.

Run from anywhere: python3 scripts/generate-brewery.py

Outputs public/resources/totem/brewery.png, a 256x128 front view: the brewery is a horizontal two-cell piece.

A wooden saloon on a plank deck: a shingled gable roof, a porch awning on posts, lit windows, swinging doors,
a few barrels, and a false front carrying a big beer mug sign. It is modeled as voxels and rendered by
voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, bayer, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "brewery.png"
WIDTH = 256
HEIGHT = 128
ORIGIN_Y = 100

# Wood shared with the towers and houses, from dark to light
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
PLANK = [(94, 71, 78, 255), (138, 103, 99, 255), (175, 140, 121, 255), (227, 193, 140, 255)]
SHINGLE = [(72, 40, 52, 255), (110, 52, 58, 255), (150, 72, 64, 255), (190, 106, 78, 255)]
BEER = [(170, 104, 30, 255), (214, 150, 40, 255), (240, 196, 70, 255), (250, 228, 130, 255)]
FOAM = [(175, 140, 121, 255), (227, 210, 180, 255), (245, 239, 220, 255), (255, 252, 240, 255)]
GLASS = [(170, 190, 200, 255), (215, 230, 235, 255)]
WINDOW_LIGHT = [(218, 181, 112, 255), (245, 239, 169, 255)]
INTERIOR = (72, 63, 97, 255)

HALF_X = 128
# Building body, in voxels
BODY_HALF_WIDTH = 94
BODY_FRONT = -10
BODY_BACK = 34
WALL_HEIGHT = 72
DECK_HALF_WIDTH = 100
DECK_FRONT = -24
DECK_HEIGHT = 4
EAVE = 3
# Porch awning on posts, kept shallow so it does not hide the front wall from the camera above
AWNING_FRONT = -20
AWNING_Z = 56
POSTS_X = (-90, -50, 50, 90)
# False front carrying the sign
FACADE_HALF_WIDTH = 44
FACADE_STEPS = ((44, 104), (32, 116))
WINDOWS_X = (-70, 70)
WINDOW_HALF_WIDTH = 11
WINDOW_Z = (18, 44)
DOOR_HALF_WIDTH = 10
DOOR_HEIGHT = 44
# Mug sign relief, centered a little left so the handle balances it
MUG_X = (-18, 12)
MUG_Z = (80, 108)
MUG_FRONT = -16
BARRELS = ((-26, -17, 0), (26, -17, 0), (-70, -17, 0))
BARREL_RADIUS = 5
BARREL_HEIGHT = 12
SHADOW_RADII = (108, 30)

DECK, WALL, ROOF, FACADE, POST, AWNING, BARREL, MUG, FOAM_LABEL, HANDLE, DOOR = range(1, 12)


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def roof_top(y: int) -> int:
    """Gable roof height at model row y, ridge along x."""
    ridge = (BODY_FRONT + BODY_BACK) // 2
    half_depth = (BODY_BACK - BODY_FRONT) // 2 + EAVE
    return WALL_HEIGHT + round(1.3 * (half_depth - abs(y - ridge))) - EAVE


def build_model() -> VoxelGrid:
    grid = VoxelGrid(HALF_X)
    grid.box(-DECK_HALF_WIDTH, DECK_HALF_WIDTH, DECK_FRONT, BODY_BACK + 2, 0, DECK_HEIGHT, DECK)
    grid.box(-BODY_HALF_WIDTH, BODY_HALF_WIDTH, BODY_FRONT, BODY_BACK, DECK_HEIGHT, WALL_HEIGHT, WALL)
    for y in range(BODY_FRONT - EAVE, BODY_BACK + EAVE):
        top = roof_top(y)
        grid.box(-BODY_HALF_WIDTH - EAVE, BODY_HALF_WIDTH + EAVE, y, y + 1, top - 3, top, ROOF)
        grid.box(-BODY_HALF_WIDTH, BODY_HALF_WIDTH, y, y + 1, WALL_HEIGHT, top - 3, ROOF)

    # The false front rises in steps above the roof
    grid.box(-FACADE_HALF_WIDTH, FACADE_HALF_WIDTH, BODY_FRONT - 2, BODY_FRONT + 3, DECK_HEIGHT, WALL_HEIGHT, FACADE)
    for half_width, top in FACADE_STEPS:
        grid.box(-half_width, half_width, BODY_FRONT - 2, BODY_FRONT + 3, WALL_HEIGHT, top, FACADE)
    # Door opening, carved a few voxels deep
    grid.box(-DOOR_HALF_WIDTH, DOOR_HALF_WIDTH, BODY_FRONT - 2, BODY_FRONT + 4, DECK_HEIGHT, DECK_HEIGHT + DOOR_HEIGHT, EMPTY)
    grid.box(-DOOR_HALF_WIDTH, DOOR_HALF_WIDTH, BODY_FRONT + 4, BODY_FRONT + 5, DECK_HEIGHT, DECK_HEIGHT + DOOR_HEIGHT, WALL)
    # Swinging saloon doors, half height, with a gap in the middle
    for x0, x1 in ((-DOOR_HALF_WIDTH + 1, -1), (1, DOOR_HALF_WIDTH - 1)):
        grid.box(x0, x1, BODY_FRONT, BODY_FRONT + 1, DECK_HEIGHT + 12, DECK_HEIGHT + 34, DOOR)

    for y in range(AWNING_FRONT, BODY_FRONT):
        z = AWNING_Z + (y - AWNING_FRONT) // 4
        grid.box(-BODY_HALF_WIDTH - 2, BODY_HALF_WIDTH + 2, y, y + 1, z, z + 3, AWNING)
    for x in POSTS_X:
        grid.box(x - 2, x + 1, AWNING_FRONT + 1, AWNING_FRONT + 4, DECK_HEIGHT, AWNING_Z, POST)

    build_mug(grid)
    for bx, by, stack in BARRELS:
        build_barrel(grid, bx, by, DECK_HEIGHT + stack * BARREL_HEIGHT)
    return grid


def build_mug(grid: VoxelGrid) -> None:
    x0, x1 = MUG_X
    z0, z1 = MUG_Z
    back = BODY_FRONT - 2
    cx = (x0 + x1) / 2
    for z in range(z0, z1):
        # The mug flares a little toward the rim
        flare = round((z - z0) / (z1 - z0) * 2)
        for x in range(x0 - flare, x1 + flare):
            # Rounded front so it catches the light
            edge = min(x - (x0 - flare), x1 + flare - 1 - x)
            depth = 4 if edge > 2 else 3 if edge > 0 else 2
            grid.box(x, x + 1, back - depth, back, z, z + 1, MUG)
    # Foam: overlapping bumps spilling over the rim
    for index, bx in enumerate(range(x0 - 3, x1 + 4, 6)):
        radius = 4 + noise(index, 7) * 2
        bz = z1 + 1 + noise(index, 8) * 2
        for x in range(math.floor(bx - radius), math.ceil(bx + radius)):
            for z in range(math.floor(bz - radius), math.ceil(bz + radius)):
                d = ((x + 0.5 - bx) ** 2 + (z + 0.5 - bz) ** 2) / radius**2
                if d <= 1 and z >= z1 - 2:
                    grid.box(x, x + 1, back - 5 + round(d * 2), back, z, z + 1, FOAM_LABEL)
    # A drip running down the side
    grid.box(x0 + 3, x0 + 6, back - 5, back - 3, z1 - 6, z1 - 1, FOAM_LABEL)
    # Handle: a ring on the right side
    hz = (z0 + z1) / 2
    hx = x1 + 2
    for x in range(x1, x1 + 10):
        for z in range(z0, z1):
            d = math.hypot((x + 0.5 - hx) / 1.1, z + 0.5 - hz)
            if 5 <= d <= 8.5 and x >= x1 + 1:
                grid.box(x, x + 1, back - 3, back, z, z + 1, HANDLE)
    _ = cx


def build_barrel(grid: VoxelGrid, bx: int, by: int, base: int) -> None:
    for z in range(base, base + BARREL_HEIGHT):
        # Bulging staves
        t = (z - base + 0.5) / BARREL_HEIGHT
        radius = BARREL_RADIUS + 1.2 * math.sin(math.pi * t)
        for y in range(by - 8, by + 8):
            for x in range(bx - 8, bx + 8):
                if math.hypot(x + 0.5 - bx, y + 0.5 - by) <= radius:
                    grid.set(x, y, z, BARREL)


def barrel_center(hit: Hit) -> int:
    return min((bx for bx, _, _ in BARRELS), key=lambda bx: abs(bx - hit.mx))


def hit_barrel_y(hit: Hit) -> int:
    return next(by for bx, by, _ in BARRELS if bx == barrel_center(hit))


def ramp_index(light: float, cuts: tuple[float, float, float] = (0.1, 0.45, 0.8)) -> int:
    return sum(light >= cut for cut in cuts)


def front_detail(hit: Hit) -> tuple[int, int, int, int] | None:
    """Paint on the front faces of the walls and false front: windows, door frame, sign trim."""
    x, z = hit.mx, hit.z
    for wx in WINDOWS_X:
        if abs(x - wx + 0.5) <= WINDOW_HALF_WIDTH + 2 and WINDOW_Z[0] - 2 <= z < WINDOW_Z[1] + 2:
            inside = abs(x - wx + 0.5) <= WINDOW_HALF_WIDTH and WINDOW_Z[0] <= z < WINDOW_Z[1]
            if not inside:
                return WOOD[0] if z == WINDOW_Z[0] - 2 else WOOD[2] if z >= WINDOW_Z[1] else WOOD[1]
            if x == wx or z == (WINDOW_Z[0] + WINDOW_Z[1]) // 2:
                return WOOD[1]
            # Warm light from inside, brighter at the top
            level = (z - WINDOW_Z[0]) / (WINDOW_Z[1] - WINDOW_Z[0])
            return WINDOW_LIGHT[1] if level > bayer(x, z) * 0.9 else WINDOW_LIGHT[0]
    if hit.my <= BODY_FRONT - 2 and abs(x + 0.5) <= DOOR_HALF_WIDTH + 2 and z < DECK_HEIGHT + DOOR_HEIGHT + 2:
        return WOOD[2] if z >= DECK_HEIGHT + DOOR_HEIGHT else WOOD[1]
    if hit.label == FACADE and z >= WALL_HEIGHT - 2:
        # Sign trim along the stepped top and a band under it
        for half_width, top in FACADE_STEPS:
            if abs(x + 0.5) < half_width and (z == top - 1 or z == top - 2):
                return WOOD[3] if z == top - 1 else WOOD[1]
        if z in (WALL_HEIGHT - 2, WALL_HEIGHT - 1):
            return WOOD[1] if z == WALL_HEIGHT - 2 else WOOD[3]
    return None


def shade(hit: Hit) -> tuple[int, int, int, int]:
    light = hit.light(hit.normal())
    facing_front = hit.neighbor(0, -1, 0) == EMPTY
    top = hit.neighbor(0, 0, 1) == EMPTY

    if hit.label == MUG:
        index = ramp_index(light, (-0.2, 0.25, 0.6))
        # Glass ribs and bubbles
        if facing_front and (hit.mx - MUG_X[0]) % 6 == 2:
            index = max(0, index - 1)
        if index < 3 and noise(hit.mx, hit.z, 3) > 0.96:
            index = 3
        return BEER[index]
    if hit.label == FOAM_LABEL:
        return FOAM[ramp_index(light, (-0.2, 0.3, 0.7))]
    if hit.label == HANDLE:
        return GLASS[1] if light > 0.3 else GLASS[0]
    if hit.label == BARREL:
        z = hit.z
        local = (z - DECK_HEIGHT) % BARREL_HEIGHT
        if local in (2, BARREL_HEIGHT - 3) and not top:
            return WOOD[0]
        if top:
            return WOOD[3] if math.hypot(hit.mx + 0.5 - barrel_center(hit), hit.my + 0.5 - hit_barrel_y(hit)) < BARREL_RADIUS - 1 else WOOD[2]
        # Small and round: light the side facing the top-left, shade the right
        side = (hit.mx + 0.5 - barrel_center(hit)) / (BARREL_RADIUS + 1)
        return WOOD[3] if side < -0.5 else WOOD[2] if side < 0.4 else WOOD[1]
    if hit.label == DOOR:
        # Slats with a scalloped top
        if hit.neighbor(0, 0, 1) == EMPTY:
            return PLANK[3]
        return PLANK[1] if (hit.mx + 64) % 3 == 0 else PLANK[2]

    if hit.label == ROOF:
        if hit.neighbor(0, 0, 1) != EMPTY and hit.neighbor(0, -1, 0) == EMPTY and hit.neighbor(0, 0, -1) == EMPTY:
            return SHINGLE[0]
        # Shingle courses run along x, staggered seams between courses
        ridge = (BODY_FRONT + BODY_BACK) // 2
        course = (hit.my - ridge) // 3
        index = ramp_index(light, (-0.1, 0.3, 0.7))
        if (hit.my - ridge) % 3 == 0:
            index = max(0, index - 1)
        elif (hit.mx + course * 4) % 8 == 0:
            index = max(0, index - 1)
        return SHINGLE[index]
    if hit.label == AWNING:
        if top:
            return PLANK[3] if hit.mx % 9 else PLANK[1]
        return PLANK[0]
    if hit.label == POST:
        return WOOD[2] if hit.neighbor(-1, 0, 0) == EMPTY else WOOD[1] if facing_front else WOOD[0]
    if hit.label == DECK:
        if top:
            # Deck boards run along x
            return WOOD[1] if (hit.my + 64) % 5 == 0 else WOOD[3] if noise(hit.mx // 12, hit.my // 5) > 0.3 else WOOD[2]
        return WOOD[0] if hit.z == 0 else WOOD[1]

    if facing_front:
        detail = front_detail(hit)
        if detail:
            return detail
    if hit.label == WALL and hit.my > BODY_FRONT + 2 and abs(hit.mx) <= DOOR_HALF_WIDTH:
        # Dark saloon interior behind the swinging doors
        swing = DECK_HEIGHT + 12 <= hit.z < DECK_HEIGHT + 34 and abs(hit.mx + 0.5) > 1
        if swing:
            return PLANK[2] if (hit.mx + 64) % 4 else PLANK[1]
        return INTERIOR
    if hit.label == FACADE:
        # Vertical boards on the sign
        index = ramp_index(light, (-0.2, 0.3, 0.75))
        if (hit.mx + 64) % 7 == 0:
            index = max(0, index - 1)
        return PLANK[index]
    # Walls: horizontal clapboards
    index = ramp_index(light, (-0.2, 0.3, 0.75))
    if hit.z % 5 == 0:
        index = max(0, index - 1)
    return WOOD[index]


def main() -> None:
    grid = build_model()
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, SHADOW_RADII)
    # The porch posts are 1-2px wide: a 2px depth outline would swallow them
    outline(sprite, depth_gap=5, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
