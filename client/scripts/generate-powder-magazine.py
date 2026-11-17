#!/usr/bin/env python3
"""Generates the powder magazine totem pixel art.

Run from anywhere: python3 scripts/generate-powder-magazine.py

Outputs public/resources/totem/powder-magazine.png, the single front view cropped to the art.

A squat stone bunker storing cannon powder: thick masonry walls under a barrel vault of red clay tiles, a heavy
arched door of planks held by iron bands, and a red warning flag on the ridge. Powder barrels stand on the left of
the door, one marked with a black powder sign, and a pyramid of cannonballs sits on the right. It is modeled as
voxels and rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, OUTLINE, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "powder-magazine.png"
WIDTH = 98
HEIGHT = 124
ORIGIN_Y = 88

# Shared ramps, from dark to light
STONE = [(72, 63, 97, 255), (67, 91, 125, 255), (68, 142, 159, 255), (90, 185, 187, 255), (143, 226, 185, 255)]
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
IRON = [(48, 44, 68, 255), (66, 64, 92, 255), (92, 94, 124, 255), (136, 142, 168, 255)]
# New ramps: the darkest step leans toward violet, lighter steps get warmer
TILE = [(74, 40, 62, 255), (120, 52, 60, 255), (170, 74, 62, 255), (212, 112, 78, 255), (236, 160, 104, 255)]
FLAG = [(120, 52, 60, 255), (184, 40, 42, 255), (226, 76, 56, 255)]

# Bunker walls
WALL_HALF_X = 40
WALL_FRONT = -8
WALL_BACK = 44
WALL_TOP = 26
# Stone gable facade in front of the vault, its arched top standing proud of the tiles
FACADE_DEPTH = 5
FACADE_RISE = 3
# Barrel vault along y, overhanging the side walls
VAULT_HALF_X = 44
VAULT_RISE = 22
VAULT_THICKNESS = 4
VAULT_FRONT = WALL_FRONT + FACADE_DEPTH
VAULT_BACK = 47
# Arched door in the facade
DOOR_HALF = 9
DOOR_HEIGHT = 26
DOOR_RECESS = 2
# Flag on the ridge
FLAG_POLE = (0, 34)  # x, y
FLAG_POLE_HEIGHT = 30
FLAG_SIZE = (18, 11)  # length, height

# Props in front of the walls
BARRELS = ((-30, -22), (-16, -34))  # x, y of upright barrels
BARREL_RADIUS = 8
BARREL_HEIGHT = 18
CANNONBALL_RADIUS = 4.5
CANNONBALL_PILE = (26, -28)

SHADOW_MARGIN = 3
SHADOW_OFFSET = (0, -2)
SHADOW_JITTER = 0.3

(
    WALL_LABEL,
    TILE_LABEL,
    DOOR_LABEL,
    DOOR_FRAME_LABEL,
    BAND_LABEL,
    POLE_LABEL,
    FLAG_LABEL,
    BARREL_LABEL,
    HOOP_LABEL,
    BALL_LABEL,
) = range(1, 11)


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def vault_height(x: float, half: float = VAULT_HALF_X) -> float:
    """Top of the vault over column x, an elliptic arch."""
    t = min(1.0, abs(x) / half)
    return WALL_TOP + VAULT_RISE * math.sqrt(1 - t * t)


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    build_bunker(grid)
    build_flag(grid)
    for i, (x, y) in enumerate(BARRELS):
        barrel(grid, x, y, i)
    build_cannonballs(grid)
    return grid


def build_bunker(grid: VoxelGrid) -> None:
    grid.box(-WALL_HALF_X, WALL_HALF_X, WALL_FRONT, WALL_BACK, 0, WALL_TOP, WALL_LABEL)
    # The front and back walls rise into the arch of the vault
    for x in range(-WALL_HALF_X, WALL_HALF_X):
        top = round(vault_height(x + 0.5) - VAULT_THICKNESS)
        grid.box(x, x + 1, WALL_FRONT, WALL_BACK, WALL_TOP, top, WALL_LABEL)
    # Facade: the front wall full width, topped by an arch slightly above the tiles
    for x in range(-WALL_HALF_X, WALL_HALF_X):
        top = round(vault_height(x + 0.5, WALL_HALF_X) + FACADE_RISE)
        grid.box(x, x + 1, WALL_FRONT, WALL_FRONT + FACADE_DEPTH, 0, top, WALL_LABEL)
    # Tiled vault shell, overhanging the side walls
    for x in range(-VAULT_HALF_X, VAULT_HALF_X):
        top = vault_height(x + 0.5)
        bottom = max(WALL_TOP - 3, top - VAULT_THICKNESS - 1)
        grid.box(x, x + 1, VAULT_FRONT, VAULT_BACK, round(bottom), round(top) + 1, TILE_LABEL)
    # Arched door recessed in a wooden frame
    for z in range(0, DOOR_HEIGHT + 3):
        for x in range(-DOOR_HALF - 2, DOOR_HALF + 2):
            spring = DOOR_HEIGHT - DOOR_HALF
            arch = spring + math.sqrt(max(0, (DOOR_HALF + 2) ** 2 - (x + 0.5) ** 2))
            inner = spring + math.sqrt(max(0, DOOR_HALF**2 - (x + 0.5) ** 2))
            if z < inner and abs(x + 0.5) < DOOR_HALF:
                grid.box(x, x + 1, WALL_FRONT - 1, WALL_FRONT + DOOR_RECESS, z, z + 1, EMPTY)
                grid.set(x, WALL_FRONT + DOOR_RECESS, z, DOOR_LABEL)
            elif z < arch:
                grid.box(x, x + 1, WALL_FRONT - 2, WALL_FRONT, z, z + 1, DOOR_FRAME_LABEL)
    # Iron bands across the door
    for z in (6, 7, 17, 18):
        grid.box(-DOOR_HALF, DOOR_HALF, WALL_FRONT + DOOR_RECESS - 1, WALL_FRONT + DOOR_RECESS, z, z + 1,
                 BAND_LABEL)


def build_flag(grid: VoxelGrid) -> None:
    px, py = FLAG_POLE
    base = math.floor(vault_height(px + 0.5)) - 1
    top = base + FLAG_POLE_HEIGHT
    grid.box(px - 1, px + 1, py - 1, py + 1, base, top, POLE_LABEL)
    length, height = FLAG_SIZE
    for i in range(length):
        # A small wave along the flag, the free end a bit lower
        wave = round(math.sin(i / 3) * 1.2)
        droop = i // 6
        grid.box(px + 1 + i, px + 2 + i, py + wave - 1, py + wave + 1, top - height - droop, top - droop,
                 FLAG_LABEL)
    grid.box(px - 2, px + 2, py - 2, py + 2, top, top + 2, POLE_LABEL)


def barrel(grid: VoxelGrid, cx: int, cy: int, index: int) -> None:
    for z in range(BARREL_HEIGHT):
        # Bulging staves, widest in the middle
        t = (z + 0.5) / BARREL_HEIGHT
        radius = BARREL_RADIUS - 1.2 * (2 * t - 1) ** 2
        label = HOOP_LABEL if z in (2, 3, BARREL_HEIGHT - 4, BARREL_HEIGHT - 3) else BARREL_LABEL
        for y in range(cy - BARREL_RADIUS - 1, cy + BARREL_RADIUS + 1):
            for x in range(cx - BARREL_RADIUS - 1, cx + BARREL_RADIUS + 1):
                if math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= radius:
                    grid.set(x, y, z, label)


def build_cannonballs(grid: VoxelGrid) -> None:
    cx, cy = CANNONBALL_PILE
    r = CANNONBALL_RADIUS
    step = 2 * r
    centers = []
    # A 3x3 bottom layer, a 2x2 layer in its hollows and one ball on top
    for layer, count in enumerate((3, 2, 1)):
        offset = (count - 1) / 2
        for i in range(count):
            for j in range(count):
                centers.append((cx + (i - offset) * step, cy + (j - offset) * step, r + layer * r * 1.4))
    # One label per ball so neighbor balls get an ink seam between them
    for index, (bx, by, bz) in enumerate(centers):
        for z in range(math.floor(bz - r), math.ceil(bz + r)):
            for y in range(math.floor(by - r), math.ceil(by + r)):
                for x in range(math.floor(bx - r), math.ceil(bx + r)):
                    if math.dist((x + 0.5, y + 0.5, z + 0.5), (bx, by, bz)) <= r:
                        grid.set(x, y, z, BALL_LABEL + index)


def tile_course(x: int) -> int:
    """Index of the tile course over column x, evenly spaced along the arch rather than along x."""
    angle = math.asin(max(-1.0, min(1.0, (x + 0.5) / VAULT_HALF_X)))
    return math.floor(angle * 7)


def step(ramp:list[tuple[int, int, int, int]], index: int) -> tuple[int, int, int, int]:
    return ramp[max(0, min(len(ramp) - 1, index))]


def face(hit: Hit) -> str:
    """Face orientation from the empty neighbors: top, front, left or right."""
    if hit.neighbor(0, 0, 1) == EMPTY:
        return "top"
    if hit.neighbor(0, -1, 0) == EMPTY:
        return "front"
    if hit.neighbor(-1, 0, 0) == EMPTY:
        return "left"
    return "right"


def shade(hit: Hit) -> tuple[int, int, int, int]:
    orientation = face(hit)

    if hit.label == WALL_LABEL:
        index = {"top": 4, "front": 3, "left": 3, "right": 1}[orientation]
        # Contact shadow under the overhanging vault
        # The arch coping of the facade catches the light like a top face
        if orientation == "front" and hit.z >= vault_height(hit.mx + 0.5, WALL_HALF_X) + FACADE_RISE - 3:
            index = 4
        # Masonry: staggered blocks with mortar one step lower, some cut by a crack
        row = hit.z // 6
        along = hit.mx if orientation in ("front", "top") else hit.my
        if hit.z % 6 == 0 or (along + (row % 2) * 5 + 64) % 10 == 0:
            index -= 1
        elif noise(along // 10, row, 3) > 0.9 and (along + hit.z) % 7 == 0:
            index -= 1
        # Big corner stones lighter on the lit edge
        if orientation == "front" and hit.mx < -WALL_HALF_X + 4:
            index += 1
        return step(STONE, index)

    if hit.label == TILE_LABEL:
        if orientation != "top" and hit.neighbor(0, 0, 1) != EMPTY:
            return TILE[0]
        # Curved roof: light along the arch from the top left, both edges a step darker
        side = (hit.mx + 0.5) / VAULT_HALF_X
        index = 4 if -0.45 < side < 0.05 else 3 if -0.75 < side < 0.4 else 2 if side < 0.75 else 1
        if side < -0.75:
            index = 2
        # The front edge of the shell: the tile ends seen head on
        if hit.my <= VAULT_FRONT and orientation != "top":
            index = 1
        # Contact shadow behind the facade
        if hit.my < VAULT_FRONT + 4:
            index -= 1
        # Tile courses follow the curve, staggered joints along y
        course = tile_course(hit.mx)
        if course != tile_course(hit.mx + 1) or (hit.my + (course % 2) * 3 + 64) % 6 == 0:
            index -= 1
        return step(TILE, index)

    if hit.label == DOOR_LABEL:
        # Vertical planks, seams in the lowest step, the top in the shade of the arch
        index = 1 if (hit.mx + 64) % 5 == 0 else 2
        if hit.z > DOOR_HEIGHT - 6:
            index -= 1
        return step(WOOD, index)

    if hit.label == DOOR_FRAME_LABEL:
        if orientation == "top" or hit.mx < -DOOR_HALF:
            return WOOD[3]
        return WOOD[1] if hit.mx >= DOOR_HALF else WOOD[2]

    if hit.label == BAND_LABEL:
        return IRON[3] if hit.z in (7, 18) else IRON[2]

    if hit.label == POLE_LABEL:
        return WOOD[3] if hit.neighbor(-1, 0, 0) == EMPTY or orientation == "top" else WOOD[1]

    if hit.label == FLAG_LABEL:
        index = 2 if math.sin((hit.mx - FLAG_POLE[0]) / 3) > -0.2 else 1
        if orientation == "top":
            index = 2
        return step(FLAG, index)

    if hit.label in (BARREL_LABEL, HOOP_LABEL):
        ramp = IRON if hit.label == HOOP_LABEL else WOOD
        if orientation == "top":
            # Lid planks, with the powder mark burnt on the front barrel
            cx, cy = min(BARRELS, key=lambda b: math.hypot(hit.mx - b[0], hit.my - b[1]))
            if (cx, cy) == BARRELS[1] and abs(hit.mx + 0.5 - cx) + abs(hit.my + 0.5 - cy) < 3:
                return OUTLINE
            return WOOD[2] if (hit.mx + 64) % 4 == 0 else WOOD[3]
        cx, _ = min(BARRELS, key=lambda b: math.hypot(hit.mx - b[0], hit.my - b[1]))
        side = (hit.mx + 0.5 - cx) / BARREL_RADIUS
        index = len(ramp) - 2 if side < -0.2 else len(ramp) - 3 if side < 0.5 else len(ramp) - 4
        # Staves
        if hit.label == BARREL_LABEL and (hit.mx - cx + 64) % 3 == 0 and abs(side) < 0.8:
            index -= 1
        return step(ramp, index)

    if hit.label >= BALL_LABEL:
        light = hit.light(hit.normal())
        return step(IRON, 3 if light > 0.8 else 2 if light > 0.45 else 1 if light > 0 else 0)
    return (255, 0, 255, 255)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    # A material switch always has ink between the two materials
    if label == other or {label, other} <= {BARREL_LABEL, HOOP_LABEL}:
        return None
    if {label, other} <= {DOOR_LABEL, BAND_LABEL}:
        return None
    return OUTLINE


def footprint_shadow(x: float, y: float) -> float:
    """Distance outside the walls and the props, in units of the margin, 1 or less inside the shadow.

    The light is overhead: the shadow rims every part evenly and drops a little toward the camera.
    """
    x, y = x - SHADOW_OFFSET[0], y - SHADOW_OFFSET[1]
    distances = [max(-VAULT_HALF_X - x, x - VAULT_HALF_X, VAULT_FRONT - y, y - VAULT_BACK, 0)]
    for bx, by in BARRELS:
        distances.append(max(0, math.hypot(x - bx, y - by) - BARREL_RADIUS))
    cx, cy = CANNONBALL_PILE
    reach = 3 * CANNONBALL_RADIUS
    distances.append(max(abs(x - cx) - reach, abs(y - cy) - reach, 0))
    return min(distances) / SHADOW_MARGIN


def main() -> None:
    grid = build_model()
    # shadow_radii is ignored, footprint_shadow gives the shape
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), SHADOW_JITTER, shadow_shape=footprint_shadow)
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
