#!/usr/bin/env python3
"""Generates the basic barracks pixel art.

Run from anywhere: python3 scripts/generate-barracks.py

Outputs public/resources/house/barracks.png, the single front view of a one-cell piece, cropped to the art.

A long half-timbered hall stands across the back of a grey paved courtyard: a stone plinth, a white plaster ground
floor with timber posts, knee braces and an arched stone door, a blue band under the jettied upper floor and its
row of four small windows, and a gabled roof of mottled tan and brown tiles. The courtyard is open in front and on
the right; a stone wall with a timber walkway runs along its left side and ends in a small sentinel tower with a
pyramid tile roof at the front left. In the courtyard stand a weapons rack (spears and swords) and an archery
target on a tripod. It is modeled as voxels and rendered by voxel_sprite.py, which holds the camera, lighting and
outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, OUTLINE, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "house" / "barracks.png"
WIDTH = 108
HEIGHT = 119
ORIGIN_Y = 80

# Shared ramps, from dark to light
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
THATCH = [(94, 71, 78, 255), (138, 103, 99, 255), (175, 140, 121, 255), (227, 193, 140, 255), (245, 239, 169, 255)]
IRON = [(48, 44, 68, 255), (66, 64, 92, 255), (92, 94, 124, 255), (136, 142, 168, 255)]
GLASS = [(67, 91, 125, 255), (68, 142, 159, 255), (90, 185, 187, 255)]
# Grey granite of the Bosquet's boulder, for the paving, plinth and walls
GRANITE = [(58, 54, 72, 255), (88, 86, 102, 255), (124, 122, 134, 255), (164, 162, 166, 255), (204, 202, 194, 255)]
# New ramps from the reference: the darkest step leans toward violet, lighter steps get warmer
PLASTER = [(96, 92, 118, 255), (146, 142, 160, 255), (196, 192, 194, 255), (232, 228, 212, 255), (250, 246, 226, 255)]
TILE = [(88, 60, 72, 255), (136, 88, 82, 255), (180, 122, 94, 255), (218, 168, 118, 255), (240, 206, 150, 255)]
BLUE = [(40, 46, 96, 255), (52, 78, 150, 255), (76, 120, 198, 255), (128, 170, 226, 255)]
RED = [(92, 30, 52, 255), (150, 36, 46, 255), (204, 58, 52, 255), (240, 110, 78, 255)]

# Paved courtyard covering the cell
YARD_HALF_X = 47
YARD_FRONT = -40
YARD_BACK = 48
YARD_HEIGHT = 3

# Hall across the back
HALL_HALF_X = 45
HALL_FRONT = 18
HALL_BACK = 44
PLINTH_TOP = 8
GROUND_TOP = 30  # top of the ground floor beam
BAND = (30, 33)  # blue band under the upper floor
JETTY = 2  # the upper floor sticks out over the ground floor
UPPER_TOP = 57
GROUND_POSTS = (-43, -25, 25, 43)  # post centers, 3 voxels wide
DOOR_HALF = 7
DOOR_TOP = 25  # top of the opening at the arch key
ARCH_RING = 3
UPPER_POSTS = (-43, -24, -8, 8, 24, 43)
WINDOWS = (-32, -16, 16, 32)  # window centers
WINDOW_HALF = 4
WINDOW_Z = (40, 51)
BANNER = (6, 38)  # half width, bottom z of the swallowtail
# Gabled roof, ridge along x, overhanging the walls
EAVE_Z = UPPER_TOP + 1
EAVE_FRONT = HALL_FRONT - JETTY - 2
EAVE_BACK = HALL_BACK + 4
ROOF_HALF_X = 49
ROOF_SLOPE = 0.8
ROOF_THICKNESS = 3

# Wall along the left side, ending in the sentinel tower at the front
WALL_X = (-47, -37)
WALL_Y = (-31, HALL_FRONT)
WALL_TOP = 28
TOWER_X = (-50, -34)
TOWER_Y = (-45, -29)
TOWER_TOP = 22  # top of the stone body, the timber lookout stands on it
LOOKOUT_HEIGHT = 13
TOWER_ROOF_OVERHANG = 2
TOWER_ROOF_HEIGHT = 13

# Training props
RACK_X = (-11, 11)  # post x
RACK_Y = -23
RACK_HEIGHT = 16
WEAPONS = (("spear", -6), ("sword", 0), ("spear", 6))
TARGET = (30, -20, 17)  # center x, y, z of the bullseye
TARGET_RADIUS = 10
TARGET_TILT = 0.35  # radians, the top leans away from the camera

# A thin rim around the courtyard slab, wider around the tower; the hall's shadow falls behind it
SHADOW_OFFSET = (0, -2)
SHADOW_JITTER = 0.3

(
    PAVING_LABEL,
    STONE_LABEL,
    PLASTER_LABEL,
    TIMBER_LABEL,
    BAND_LABEL,
    WINDOW_LABEL,
    DOOR_LABEL,
    ARCH_LABEL,
    TILE_LABEL,
    WALK_LABEL,
    RACK_LABEL,
    IRON_LABEL,
    TARGET_LABEL,
    SHAFT_LABEL,
    GRIP_LABEL,
    BANNER_LABEL,
    SLIT_LABEL,
    BOARD_LABEL,
) = range(1, 19)


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    build_yard(grid)
    build_hall(grid)
    build_roof(grid)
    build_wall(grid)
    build_tower(grid)
    build_rack(grid)
    build_target(grid)
    return grid


def build_yard(grid: VoxelGrid) -> None:
    grid.box(-YARD_HALF_X, YARD_HALF_X, YARD_FRONT, YARD_BACK, 0, YARD_HEIGHT, PAVING_LABEL)
    # A few chipped slabs along the open front and right edges
    for x in range(-YARD_HALF_X, YARD_HALF_X, 3):
        if noise(x, 1) > 0.82:
            grid.box(x, x + 3, YARD_FRONT, YARD_FRONT + 1, YARD_HEIGHT - 1, YARD_HEIGHT, EMPTY)


def stamp_line(grid: VoxelGrid, y0: int, y1: int, a: tuple[float, float], b: tuple[float, float], half: float,
               label: int) -> None:
    """A beam of square section in the xz plane, between y0 and y1, from a to b."""
    steps = int(math.dist(a, b) * 2) + 1
    for i in range(steps + 1):
        t = i / steps
        x, z = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
        for vx in range(math.floor(x - half), math.ceil(x + half)):
            for vz in range(math.floor(z - half), math.ceil(z + half)):
                grid.box(vx, vx + 1, y0, y1, vz, vz + 1, label)


def build_hall(grid: VoxelGrid) -> None:
    upper_front = HALL_FRONT - JETTY
    base = YARD_HEIGHT
    # Stone plinth, then plaster ground floor, then the jettied plaster upper floor
    grid.box(-HALL_HALF_X - 1, HALL_HALF_X + 1, HALL_FRONT - 1, HALL_BACK, base, PLINTH_TOP, STONE_LABEL)
    grid.box(-HALL_HALF_X, HALL_HALF_X, HALL_FRONT, HALL_BACK, PLINTH_TOP, BAND[0], PLASTER_LABEL)
    grid.box(-HALL_HALF_X - 1, HALL_HALF_X + 1, upper_front, HALL_BACK, BAND[1], UPPER_TOP, PLASTER_LABEL)

    # Ground floor timber: posts, the beam under the band and knee braces, one voxel proud of the plaster
    front = HALL_FRONT - 1
    for cx in GROUND_POSTS:
        grid.box(cx - 1, cx + 2, front, HALL_FRONT, PLINTH_TOP, BAND[0], TIMBER_LABEL)
    grid.box(-HALL_HALF_X, HALL_HALF_X, front, HALL_FRONT, GROUND_TOP - 3, BAND[0], TIMBER_LABEL)
    for cx in GROUND_POSTS:
        for sign in (-1, 1):
            if abs(cx + sign * 9) > HALL_HALF_X:
                continue
            stamp_line(grid, front, HALL_FRONT, (cx + 0.5 + sign * 2, GROUND_TOP - 13),
                       (cx + 0.5 + sign * 10, GROUND_TOP - 3), 1.0, TIMBER_LABEL)

    # Arched stone door in the middle, its ring of voussoirs over a recessed planked door
    spring = DOOR_TOP - DOOR_HALF
    for z in range(base, DOOR_TOP + ARCH_RING + 1):
        for x in range(-DOOR_HALF - ARCH_RING, DOOR_HALF + ARCH_RING):
            cx = x + 0.5
            inner = spring + math.sqrt(max(0.0, DOOR_HALF**2 - cx * cx)) if abs(cx) < DOOR_HALF else -1
            outer = spring + math.sqrt(max(0.0, (DOOR_HALF + ARCH_RING) ** 2 - cx * cx))
            if z < inner:
                grid.box(x, x + 1, HALL_FRONT - 2, HALL_FRONT + 2, z, z + 1, EMPTY)
                grid.set(x, HALL_FRONT + 2, z, DOOR_LABEL)
            elif z < outer or (z < spring and abs(cx) < DOOR_HALF + ARCH_RING):
                grid.box(x, x + 1, HALL_FRONT - 2, HALL_FRONT, z, z + 1, ARCH_LABEL)

    # Blue band under the jetty
    grid.box(-HALL_HALF_X - 1, HALL_HALF_X + 1, upper_front - 1, HALL_BACK, BAND[0], BAND[1], BAND_LABEL)

    # Upper floor timber: sill, top plate, posts, window frames and braces
    front = upper_front - 1
    grid.box(-HALL_HALF_X - 1, HALL_HALF_X + 1, front, upper_front, BAND[1], BAND[1] + 3, TIMBER_LABEL)
    grid.box(-HALL_HALF_X - 1, HALL_HALF_X + 1, front, upper_front, UPPER_TOP - 3, UPPER_TOP, TIMBER_LABEL)
    for cx in UPPER_POSTS:
        grid.box(cx - 1, cx + 2, front, upper_front, BAND[1], UPPER_TOP, TIMBER_LABEL)
    for cx in WINDOWS:
        z0, z1 = WINDOW_Z
        grid.box(cx - WINDOW_HALF - 1, cx + WINDOW_HALF + 1, front, upper_front, z0 - 2, z1 + 1, TIMBER_LABEL)
        grid.box(cx - WINDOW_HALF, cx + WINDOW_HALF, front, upper_front + 1, z0, z1, EMPTY)
        grid.box(cx - WINDOW_HALF, cx + WINDOW_HALF, upper_front + 1, upper_front + 2, z0, z1, WINDOW_LABEL)
    # A banner hanging from the top plate in the wide middle panel, cut into a swallowtail
    half, bottom = BANNER
    for x in range(-half, half):
        notch = 4 - abs(x + 0.5) * 4 / half
        grid.box(x, x + 1, front - 1, front, round(bottom + notch), UPPER_TOP - 3, BANNER_LABEL)
    grid.box(-half - 1, half + 1, front - 2, front, UPPER_TOP - 4, UPPER_TOP - 2, RACK_LABEL)


def roof_z(y: int) -> float:
    ridge_y = (EAVE_FRONT + EAVE_BACK) / 2
    return EAVE_Z + ((EAVE_BACK - EAVE_FRONT) / 2 - abs(y + 0.5 - ridge_y)) * ROOF_SLOPE


def build_roof(grid: VoxelGrid) -> None:
    for y in range(EAVE_FRONT, EAVE_BACK):
        top = roof_z(y)
        for x in range(-ROOF_HALF_X, ROOF_HALF_X):
            grid.box(x, x + 1, y, y + 1, round(top - ROOF_THICKNESS), round(top) + 1, TILE_LABEL)
        # Plaster gables under the roof
        if HALL_FRONT <= y < HALL_BACK:
            grid.box(-HALL_HALF_X, HALL_HALF_X, y, y + 1, UPPER_TOP, round(top - ROOF_THICKNESS), PLASTER_LABEL)


def build_wall(grid: VoxelGrid) -> None:
    x0, x1 = WALL_X
    y0, y1 = WALL_Y
    grid.box(x0, x1, y0, y1, YARD_HEIGHT, WALL_TOP, STONE_LABEL)
    # Timber walkway on top, merlons along the outer edge
    for y in range(y0 + 2, y1, 9):
        grid.box(x0, x0 + 5, y, y + 4, WALL_TOP, WALL_TOP + 5, STONE_LABEL)
    grid.box(x0, x0 + 4, y0, y1, WALL_TOP, WALL_TOP + 1, STONE_LABEL)


def build_tower(grid: VoxelGrid) -> None:
    x0, x1 = TOWER_X
    y0, y1 = TOWER_Y
    grid.box(x0, x1, y0, y1, YARD_HEIGHT, TOWER_TOP, STONE_LABEL)
    # Arrow slit in the stone body
    cx = (x0 + x1) // 2
    grid.box(cx - 1, cx + 2, y0, y0 + 2, TOWER_TOP - 14, TOWER_TOP - 6, EMPTY)
    grid.box(cx - 1, cx + 2, y0 + 2, y0 + 3, TOWER_TOP - 14, TOWER_TOP - 6, SLIT_LABEL)
    # Timber lookout: a floor, corner posts, a parapet of planks and a dark open room behind
    top = TOWER_TOP + LOOKOUT_HEIGHT
    grid.box(x0 - 1, x1 + 1, y0 - 1, y1 + 1, TOWER_TOP, TOWER_TOP + 2, TIMBER_LABEL)
    grid.box(x0 + 2, x1 - 2, y0 + 2, y1 - 2, TOWER_TOP + 2, top, DOOR_LABEL)
    for px in (x0, x1 - 3):
        for py in (y0, y1 - 3):
            grid.box(px, px + 3, py, py + 3, TOWER_TOP + 2, top, TIMBER_LABEL)
    grid.box(x0, x1, y0, y0 + 2, TOWER_TOP + 2, TOWER_TOP + 5, WALK_LABEL)
    # Pyramid tile roof
    o = TOWER_ROOF_OVERHANG
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    half = (x1 - x0) / 2 + o
    for z in range(top, top + TOWER_ROOF_HEIGHT):
        h = half * (1 - (z - top) / TOWER_ROOF_HEIGHT) + 0.5
        grid.box(math.floor(mx - h), math.ceil(mx + h), math.floor(my - h), math.ceil(my + h), z, z + 1, TILE_LABEL)
    grid.box(math.floor(mx) - 1, math.floor(mx) + 1, math.floor(my) - 1, math.floor(my) + 1,
             top + TOWER_ROOF_HEIGHT, top + TOWER_ROOF_HEIGHT + 3, RACK_LABEL)


def build_rack(grid: VoxelGrid) -> None:
    base = YARD_HEIGHT
    y = RACK_Y
    # Two posts and a planked back board; the weapons stand against it so they read on wood, not on the paving
    for x in RACK_X:
        grid.box(x - 1, x + 2, y - 1, y + 2, base, base + RACK_HEIGHT + 2, RACK_LABEL)
    grid.box(RACK_X[0] + 2, RACK_X[1] - 1, y, y + 1, base + 4, base + RACK_HEIGHT, BOARD_LABEL)
    grid.box(RACK_X[0] - 1, RACK_X[1] + 2, y - 3, y - 1, base + 3, base + 5, RACK_LABEL)
    wy = y - 2
    for kind, x in WEAPONS:
        # Three voxels wide, or the outline turns them into ink bars
        if kind == "spear":
            grid.box(x - 1, x + 2, wy, wy + 2, base, base + 26, SHAFT_LABEL)
            # Leaf shaped head
            for z, h in zip(range(base + 26, base + 36), (1, 2, 2, 2, 2, 2, 1, 1, 0, 0)):
                grid.box(x - h, x + h + 1, wy, wy + 2, z, z + 1, IRON_LABEL)
        else:
            # Point down in the rack: blade, crossguard, grip and pommel on top
            grid.box(x - 1, x + 2, wy, wy + 2, base, base + 17, IRON_LABEL)
            grid.box(x - 3, x + 4, wy, wy + 2, base + 17, base + 19, GRIP_LABEL)
            grid.box(x - 1, x + 2, wy, wy + 2, base + 19, base + 24, SHAFT_LABEL)
            grid.box(x - 1, x + 2, wy, wy + 2, base + 24, base + 26, GRIP_LABEL)


def build_target(grid: VoxelGrid) -> None:
    tx, ty, tz = TARGET
    cos, sin = math.cos(TARGET_TILT), math.sin(TARGET_TILT)
    r = TARGET_RADIUS
    for z in range(tz - r - 3, tz + r + 3):
        for y in range(ty - 8, ty + 8):
            for x in range(tx - r - 1, tx + r + 1):
                dx, dy, dz = x + 0.5 - tx, y + 0.5 - ty, z + 0.5 - tz
                depth = -cos * dy + sin * dz  # along the face normal, toward the camera
                v = sin * dy + cos * dz
                if -2.5 <= depth <= 0.5 and dx * dx + v * v <= r * r:
                    grid.set(x, y, z, TARGET_LABEL)
    # Tripod: two splayed front legs and one behind
    base = YARD_HEIGHT
    for a, b in (((tx - 8, ty - 3, base), (tx - 4, ty - 1, tz - 2)),
                 ((tx + 8, ty - 3, base), (tx + 4, ty - 1, tz - 2)),
                 ((tx, ty + 9, base), (tx, ty + 2, tz + 4))):
        steps = 40
        for i in range(steps + 1):
            t = i / steps
            x, y, z = (a[k] + (b[k] - a[k]) * t for k in range(3))
            grid.box(math.floor(x), math.floor(x) + 2, math.floor(y), math.floor(y) + 2, math.floor(z),
                     math.floor(z) + 1, RACK_LABEL)


def step(ramp: list[tuple[int, int, int, int]], index: int) -> tuple[int, int, int, int]:
    return ramp[max(0, min(len(ramp) - 1, index))]


def face(hit: Hit) -> str:
    """Face orientation from the empty neighbors: top, front, left or right."""
    if hit.neighbor(0, 0, 1) == EMPTY:
        return "top"
    if hit.neighbor(0, -1, 0) == EMPTY:
        return "front"
    if hit.neighbor(-1, 0, 0) == EMPTY:
        return "left"
    if hit.neighbor(1, 0, 0) == EMPTY:
        return "right"
    normal = hit.normal()
    if normal[2] > 0.6:
        return "top"
    return "left" if normal[0] < -0.4 else "right" if normal[0] > 0.4 else "front"


def paving(x: int, y: int) -> tuple[int, int, int, int]:
    # Staggered slabs, joints one step lower, a lit lip on some slab edges
    row, v = divmod(y - YARD_FRONT, 7)
    col, u = divmod(x + 64 + 5 * (row % 2), 10)
    mark = noise(col, row, 2)
    value = 3 if mark > 0.25 else 2
    if u == 0 or v == 0:
        value = 2 if value == 3 else 1
    elif v == 6 and 1 < u < 8 and mark > 0.55:
        value = 4
    # Contact shadow at the foot of the hall and of the left wall
    if HALL_FRONT - 7 <= y < HALL_FRONT:
        value -= 1
    if WALL_X[1] <= x < WALL_X[1] + 5 and y > TOWER_Y[1]:
        value -= 1
    # Short shadows under the props, dropped toward the camera
    if RACK_X[0] - 2 <= x < RACK_X[1] + 2 and RACK_Y - 7 <= y < RACK_Y:
        value -= 1
    tx, ty, _ = TARGET
    if math.hypot((x - tx) / 1.2, y - ty + 4) < 7:
        value -= 1
    return step(GRANITE, value)


def masonry(hit: Hit, base: int, along: int) -> tuple[int, int, int, int]:
    """Staggered stone blocks, mortar one step lower."""
    row = hit.z // 5
    index = base
    if hit.z % 5 == 0 or (along + (row % 2) * 5 + 64) % 10 == 0:
        index -= 1
    return step(GRANITE, index)


def tile(hit: Hit, base: int, u: int, v: int) -> tuple[int, int, int, int]:
    """Mottled roof tiles: rows along u, each tile tan or brown at random, a dark lower edge on every row."""
    row, dv = divmod(v, 3)
    col, du = divmod(u + 64 + 2 * (row % 2), 4)
    mark = noise(col, row, 5)
    index = base
    if mark < 0.38:
        index -= 1
    elif mark > 0.93:
        index += 1
    if dv == 0:
        index -= 1
    return step(TILE, index)


def shade(hit: Hit) -> tuple[int, int, int, int]:
    orientation = face(hit)

    if hit.label == PAVING_LABEL:
        if orientation == "top":
            return paving(hit.mx, hit.my)
        return masonry(hit, 2, hit.mx if orientation == "front" else hit.my)

    if hit.label == STONE_LABEL:
        if orientation == "top":
            return GRANITE[4] if hit.neighbor(0, -1, 0) == EMPTY else GRANITE[3]
        base = {"front": 3, "left": 2, "right": 1}[orientation]
        # Contact shadow under the jetty and the tower roof
        return masonry(hit, base, hit.mx if orientation == "front" else hit.my)

    if hit.label == ARCH_LABEL:
        # Voussoirs radiating around the opening, the lit key at the top
        cx, cz = hit.mx + 0.5, hit.z + 0.5 - (DOOR_TOP - DOOR_HALF)
        angle = math.atan2(cz, cx)
        index = 3 if orientation == "front" else 4
        if cz > 0 and int(angle / (math.pi / 7)) % 2 == 0:
            index -= 1
        elif cz <= 0 and hit.z % 5 == 0:
            index -= 1
        return step(GRANITE, index)

    if hit.label == DOOR_LABEL:
        # Recessed vertical planks with seams in the lowest step, darker under the arch
        index = 1 if (hit.mx + 64) % 4 == 0 else 2
        if hit.z > DOOR_TOP - DOOR_HALF - 2:
            index -= 1
        return step(WOOD, index)

    if hit.label == PLASTER_LABEL:
        if orientation == "top":
            return PLASTER[3]
        index = 3 if orientation == "front" else 1
        # Contact shadow under the beam, the jetty and the eave
        if hit.my <= HALL_FRONT and BAND[0] - 4 <= hit.z < BAND[0]:
            index -= 1
        if hit.my <= HALL_FRONT and UPPER_TOP - 6 <= hit.z:
            index -= 1
        # A few faint plaster patches
        if noise(hit.mx // 3, hit.z // 2, 7) > 0.94:
            index -= 1
        return step(PLASTER, index)

    if hit.label == TIMBER_LABEL:
        if orientation == "top":
            return WOOD[3]
        index = 2
        # Grain: short 1px streaks along the beam
        if noise(hit.mx, hit.z // 5, 3) > 0.85:
            index -= 1
        return step(WOOD, index)

    if hit.label == BAND_LABEL:
        if orientation == "top":
            return BLUE[3]
        return BLUE[2] if hit.z == BAND[1] - 1 else BLUE[1]

    if hit.label == WINDOW_LABEL:
        # Dark panes, a light streak at the top left, a mullion and a transom in ink
        cx = min(WINDOWS, key=lambda c: abs(hit.mx - c))
        if hit.mx in (cx - 1, cx) or hit.z == WINDOW_Z[0] + 4:
            return OUTLINE
        if hit.z >= WINDOW_Z[1] - 2 and hit.mx < cx - 1:
            return GLASS[1]
        return GLASS[0]

    if hit.label == TILE_LABEL:
        if hit.my < TOWER_Y[1] + 10:
            # Tower pyramid: the lit left face and front, the shaded right face
            mx = (TOWER_X[0] + TOWER_X[1]) / 2
            dx = hit.mx + 0.5 - mx
            dy = hit.my + 0.5 - (TOWER_Y[0] + TOWER_Y[1]) / 2
            if abs(dx) > abs(dy):
                base = 3 if dx < 0 else 1
            else:
                base = 3 if dy < 0 else 2
            if hit.z < TOWER_TOP + LOOKOUT_HEIGHT + 1:
                base = 1
            return tile(hit, base, hit.mx if abs(dx) <= abs(dy) else hit.my, hit.z)
        # Hall roof: the front slope in light, the eave fascia and gable ends in shade
        if orientation == "top" or hit.normal()[2] > 0.3:
            base = 3 if hit.mx < ROOF_HALF_X - 6 else 2
            ridge = abs(hit.my + 0.5 - (EAVE_FRONT + EAVE_BACK) / 2) < 1.5
            if ridge:
                return TILE[1]
            return tile(hit, base, hit.mx, hit.my - EAVE_FRONT)
        return TILE[1] if orientation == "front" else TILE[0]

    if hit.label == BANNER_LABEL:
        # Lit left half, a pale stripe down the middle
        if abs(hit.mx + 0.5) < 1.5:
            return BLUE[3]
        return BLUE[2] if hit.mx < 0 else BLUE[1]

    if hit.label == SLIT_LABEL:
        return OUTLINE

    if hit.label == WALK_LABEL:
        return WOOD[1] if (hit.my + 64) % 4 == 0 else WOOD[3]

    if hit.label == SHAFT_LABEL:
        return WOOD[3] if hit.mx <= min(WEAPONS, key=lambda w: abs(hit.mx - w[1]))[1] else WOOD[2]

    if hit.label == RACK_LABEL:
        if orientation == "top" or hit.neighbor(-1, 0, 0) == EMPTY:
            return WOOD[3]
        return WOOD[2] if orientation == "front" else WOOD[1]

    if hit.label == BOARD_LABEL:
        # Vertical planks in shade behind the weapons
        return WOOD[0] if (hit.mx + 64) % 4 == 0 else WOOD[1]

    if hit.label == GRIP_LABEL:
        return WOOD[1] if hit.neighbor(1, 0, 0) == EMPTY else WOOD[2]

    if hit.label == IRON_LABEL:
        if hit.neighbor(-1, 0, 0) == EMPTY or orientation == "top":
            return IRON[3]
        return IRON[2]

    if hit.label == TARGET_LABEL:
        tx, ty, tz = TARGET
        dy, dz = hit.my + 0.5 - ty, hit.z + 0.5 - tz
        v = math.sin(TARGET_TILT) * dy + math.cos(TARGET_TILT) * dz
        r = math.hypot(hit.mx + 0.5 - tx, v)
        if r > TARGET_RADIUS - 1.5:
            return THATCH[1] if hit.mx > tx else THATCH[2]
        if r < 2.5:
            return RED[3] if hit.mx < tx else RED[2]
        if r < 4.5:
            return THATCH[4]
        if r < 6.5:
            return RED[2] if hit.mx < tx + 2 else RED[1]
        return THATCH[3] if hit.mx < tx + 3 else THATCH[2]

    return (255, 0, 255, 255)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    # A material switch always has ink between the two materials
    stone = {PAVING_LABEL, STONE_LABEL, ARCH_LABEL}
    wood = {RACK_LABEL, BOARD_LABEL}
    if label == other or {label, other} <= stone or {label, other} <= wood:
        return None
    if PAVING_LABEL in (label, other) and {label, other} & {STONE_LABEL, ARCH_LABEL}:
        return None
    if WINDOW_LABEL in (label, other):
        return None
    return OUTLINE


def footprint_shadow(x: float, y: float) -> float:
    """Distance outside the courtyard and tower outline, in units of each box's margin, 1 or less inside."""
    x, y = x - SHADOW_OFFSET[0], y - SHADOW_OFFSET[1]
    boxes = (
        (-YARD_HALF_X, YARD_HALF_X, YARD_FRONT, YARD_BACK, 2),
        (-HALL_HALF_X - 2, HALL_HALF_X + 2, HALL_FRONT, YARD_BACK + 4, 4),
        (TOWER_X[0], TOWER_X[1], TOWER_Y[0], TOWER_Y[1], 3),
    )
    return min(max(x0 - x, x - x1, y0 - y, y - y1, 0) / margin for x0, x1, y0, y1, margin in boxes)


def main() -> None:
    grid = build_model()
    # shadow_radii is ignored, footprint_shadow gives the shape
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), SHADOW_JITTER, shadow_shape=footprint_shadow)
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
