#!/usr/bin/env python3
"""Generates the Butchery pixel art.

Run from anywhere: python3 scripts/generate-butchery.py

Outputs public/resources/totem/butchery.png, a 196x196 front view. The Butchery is an L shaped three-cell piece
(`oo / os`) drawn over its 2x2 cell box, so each 98px quadrant of the image is one cell. The top two cells hold
the butcher's hall: a Dwarf stone plinth, a half-timbered wall, a long shingled roof and a smokehouse chimney.
Its right half is the shop, with a counter under an awning hung with hams and sausages and a cleaver sign; its
left half opens on the slaughter door. The bottom left cell is the abattoir pen in front of that door, a
fenced yard of trampled straw holding a pig and a sheep. Its gate stands open on its right side, toward the
bottom right cell, the star: the animals produced by a barrack there walk straight into the pen. That cell
stays transparent.

Modeled as voxels and rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "butchery.png"
CELL = 98
WIDTH = 2 * CELL
HEIGHT = 2 * CELL
# Screen row of the ground at model y 0; model x 0 is the column between the two cells
ORIGIN_Y = 153
HALF_X = CELL
HALF_Y = 160

# Ramps, dark to light
GRANITE = [(58, 54, 72, 255), (88, 86, 102, 255), (124, 122, 134, 255), (164, 162, 166, 255), (204, 202, 194, 255)]
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
BEAM = [(64, 46, 56, 255), (90, 70, 70, 255), (120, 86, 76, 255)]
PLASTER = [(138, 112, 112, 255), (186, 166, 146, 255), (222, 208, 176, 255), (240, 232, 200, 255)]
SHINGLE = [(72, 40, 52, 255), (110, 52, 58, 255), (150, 72, 64, 255), (190, 106, 78, 255)]
IRON = [(48, 44, 68, 255), (66, 64, 92, 255), (92, 94, 124, 255), (136, 142, 168, 255), (190, 196, 214, 255)]
STRAW = [(94, 71, 78, 255), (138, 103, 99, 255), (175, 140, 121, 255), (227, 193, 140, 255), (245, 239, 169, 255)]
DIRT = [(76, 58, 70, 255), (110, 84, 82, 255), (144, 112, 94, 255), (172, 140, 108, 255)]
# New ramps: pig skin, sheep wool and cured meat, their darkest step leaning violet
PIG = [(98, 52, 76, 255), (156, 82, 100, 255), (206, 122, 128, 255), (236, 166, 156, 255), (250, 206, 186, 255)]
WOOL = [(86, 80, 102, 255), (146, 140, 150, 255), (198, 194, 188, 255), (236, 232, 212, 255)]
MEAT = [(84, 30, 52, 255), (138, 46, 56, 255), (186, 78, 68, 255), (222, 128, 98, 255)]
BONE = [(176, 160, 140, 255), (236, 226, 196, 255)]
INTERIOR = (52, 40, 62, 255)
INK = (22, 28, 46, 255)

# The hall over the two top cells: its front wall stands just above the empty bottom right cell
HALL = (-90, 90, 90, 128)  # x0, x1, y0, y1
FOOTING = (-93, 93, 87, 131)
FOOTING_HEIGHT = 3
PLINTH_TOP = 18
WALL_TOP = 54
EAVE = 5
ROOF_SLOPE = 1.05
POSTS = (-90, -66, -30, -2, 18, 68, 88)
DOOR = (-64, -34, 38)  # x0, x1, top z: the slaughter door, over the pen
SHOP = (22, 64, 21, 38)  # x0, x1, z0, z1: the counter window
AWNING = (16, 70, 82, 44)  # x0, x1, front y, z at the wall
HAMS = (28, 52)
SAUSAGE = 40
CHIMNEY = (48, 60, 100, 110, 84)
SMOKE = ((53, 106, 89, 5.5), (59, 110, 96, 4.5))  # x0, x1, y0, y1, top z
SIGN_X = 6

# The pen on the bottom left cell, in front of the slaughter door
PEN = (-92, -6, -54, 88)  # x0, x1, y0, y1
POST = 4
FENCE_HEIGHT = 20
RAILS = ((7, 10), (14, 17))
GATE = (-10, 26)  # the gap in the right fence, toward the star
PIG_AT = (-58, 0)
SHEEP_AT = (-40, 54)
PIGLET_AT = (-24, -24)
TROUGH = (-87, -75, 16, 52, 9)
ANIMAL_SCALE = 1.15

SHADOW_OFFSET = (0, -2)
SHADOW_JITTER = 0.25

(
    FOOTING_LABEL,
    PLINTH_LABEL,
    WALL_LABEL,
    BEAM_LABEL,
    ROOF_LABEL,
    DOOR_LABEL,
    WINDOW_LABEL,
    WOOD_LABEL,
    AWNING_LABEL,
    IRON_LABEL,
    MEAT_LABEL,
    BONE_LABEL,
    CHIMNEY_LABEL,
    FLOOR_LABEL,
    STRAW_LABEL,
    FENCE_LABEL,
    PIG_LABEL,
    SNOUT_LABEL,
    WOOL_LABEL,
    FACE_LABEL,
    TROUGH_LABEL,
    FEED_LABEL,
    SMOKE_LABEL,
) = range(1, 24)


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def step(ramp: list[tuple[int, int, int, int]], index: int) -> tuple[int, int, int, int]:
    return ramp[max(0, min(len(ramp) - 1, index))]


def ellipsoid(grid: VoxelGrid, cx: float, cy: float, cz: float, rx: float, ry: float, rz: float, label: int) -> None:
    for z in range(math.floor(cz - rz), math.ceil(cz + rz) + 1):
        for y in range(math.floor(cy - ry), math.ceil(cy + ry) + 1):
            for x in range(math.floor(cx - rx), math.ceil(cx + rx) + 1):
                if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 + ((z + 0.5 - cz) / rz) ** 2 <= 1:
                    grid.set(x, y, z, label)


def roof_top(y: int) -> float:
    ridge = (HALL[2] + HALL[3]) / 2
    return WALL_TOP + ((HALL[3] - HALL[2]) / 2 + EAVE - abs(y + 0.5 - ridge)) * ROOF_SLOPE


def build_hall(grid: VoxelGrid) -> None:
    fx0, fx1, fy0, fy1 = FOOTING
    grid.box(fx0, fx1, fy0, fy1, 0, FOOTING_HEIGHT, FOOTING_LABEL)
    x0, x1, y0, y1 = HALL
    grid.box(x0, x1, y0, y1, FOOTING_HEIGHT, PLINTH_TOP, PLINTH_LABEL)
    grid.box(x0, x1, y0, y1, PLINTH_TOP, WALL_TOP, WALL_LABEL)
    # Timber frame on the front: a sill and a top plate, posts between them
    grid.box(x0, x1, y0 - 1, y0, PLINTH_TOP, PLINTH_TOP + 2, BEAM_LABEL)
    grid.box(x0, x1, y0 - 1, y0, WALL_TOP - 3, WALL_TOP, BEAM_LABEL)
    for px in POSTS:
        grid.box(max(x0, px - 2), min(x1, px + 2), y0 - 1, y0, PLINTH_TOP, WALL_TOP, BEAM_LABEL)
    # Gable roof with its ridge along x, the walls filled up under it
    # Hipped at both ends: the roof also slopes down toward the left and right eaves
    for y in range(y0 - EAVE, y1 + EAVE):
        for x in range(x0 - EAVE, x1 + EAVE):
            hip = WALL_TOP + (min(x - (x0 - EAVE), x1 + EAVE - 1 - x) + 0.5) * ROOF_SLOPE
            top = round(min(roof_top(y), hip))
            grid.box(x, x + 1, y, y + 1, top - 3, top, ROOF_LABEL)
            if y0 <= y < y1 and x0 <= x < x1:
                grid.box(x, x + 1, y, y + 1, WALL_TOP, top - 3, WALL_LABEL)
    # Smokehouse chimney through the back slope
    cx0, cx1, cy0, cy1, ctop = CHIMNEY
    grid.box(cx0, cx1, cy0, cy1, WALL_TOP, ctop, CHIMNEY_LABEL)
    grid.box(cx0 + 3, cx1 - 3, cy0 + 3, cy1 - 3, ctop - 4, ctop, EMPTY)
    for sx, sy, sz, r in SMOKE:
        ellipsoid(grid, sx, sy, sz, r, r, r * 0.8, SMOKE_LABEL)

    # Slaughter door over the pen: two plank leaves with iron straps, under a lintel
    dx0, dx1, dtop = DOOR
    grid.box(dx0 - 2, dx1 + 2, y0 - 2, y0, dtop, dtop + 3, BEAM_LABEL)
    grid.box(dx0, dx1, y0 - 1, y0, FOOTING_HEIGHT, dtop, DOOR_LABEL)
    for sz in (10, 24):
        grid.box(dx0 + 1, dx1 - 1, y0 - 2, y0 - 1, sz, sz + 2, IRON_LABEL)

    # Shop: a dark counter window, a plank sill, an awning hung with hams and sausages
    sx0, sx1, sz0, sz1 = SHOP
    grid.box(sx0, sx1, y0 - 1, y0 + 3, sz0, sz1, WINDOW_LABEL)
    grid.box(sx0 - 3, sx1 + 3, y0 - 5, y0, sz0 - 3, sz0, WOOD_LABEL)
    ax0, ax1, afront, az = AWNING
    for y in range(afront, y0):
        z = az - round((y0 - y) * 0.45)
        grid.box(ax0, ax1, y, y + 1, z, z + 2, AWNING_LABEL)
    grid.box(sx0, sx1, afront + 2, afront + 3, az - 7, az - 6, IRON_LABEL)
    hang_y = afront + 2.5
    for hx in HAMS:
        ellipsoid(grid, hx, hang_y, az - 16, 5, 3.5, 5.5, MEAT_LABEL)
        ellipsoid(grid, hx, hang_y, az - 11, 3, 2.4, 2.8, MEAT_LABEL)
        grid.box(hx - 1, hx + 1, math.floor(hang_y) - 1, math.floor(hang_y) + 1, az - 9, az - 7, BONE_LABEL)
    for i, z in enumerate(range(az - 9, az - 24, -3)):
        ellipsoid(grid, SAUSAGE + (1 if i % 2 else -1) * 0.5, hang_y, z, 1.8, 1.8, 1.7, MEAT_LABEL)
    # Cleaver sign on an iron bracket
    grid.box(SIGN_X - 1, SIGN_X + 1, y0 - 10, y0, 47, 49, IRON_LABEL)
    grid.box(SIGN_X - 7, SIGN_X + 5, y0 - 9, y0 - 7, 32, 43, IRON_LABEL)
    grid.box(SIGN_X + 5, SIGN_X + 12, y0 - 9, y0 - 7, 38, 41, WOOD_LABEL)
    grid.box(SIGN_X - 1, SIGN_X + 1, y0 - 9, y0 - 7, 43, 47, IRON_LABEL)


def build_pen(grid: VoxelGrid) -> None:
    x0, x1, y0, y1 = PEN
    grid.box(x0, x1, y0, y1, 0, 1, FLOOR_LABEL)
    # Trampled straw in tufts
    for y in range(y0 + 2, y1 - 2):
        for x in range(x0 + 2, x1 - 2):
            if noise(x // 4, y // 3, 7) > 0.8:
                grid.set(x, y, 1, STRAW_LABEL)
                if noise(x // 2, y // 2, 9) > 0.75:
                    grid.set(x, y, 2, STRAW_LABEL)
    gate0, gate1 = GATE
    rx = x1 - POST

    def posts_along_x(y: int) -> None:
        for px in range(x0, x1 - POST + 1, 22):
            grid.box(px, px + POST, y, y + POST, 0, FENCE_HEIGHT, FENCE_LABEL)
        grid.box(rx, x1, y, y + POST, 0, FENCE_HEIGHT, FENCE_LABEL)

    posts_along_x(y0)
    for z0, z1 in RAILS:
        grid.box(x0, x1, y0 + 1, y0 + 3, z0, z1, FENCE_LABEL)
    # Left and right fences run back to the hall's footing
    for py in list(range(y0, y1 - POST + 1, 24)) + [y1 - POST]:
        grid.box(x0, x0 + POST, py, py + POST, 0, FENCE_HEIGHT, FENCE_LABEL)
        if not (gate0 < py + POST and py < gate1):
            grid.box(rx, x1, py, py + POST, 0, FENCE_HEIGHT, FENCE_LABEL)
    grid.box(rx, x1, gate0 - POST, gate0, 0, FENCE_HEIGHT + 5, FENCE_LABEL)
    grid.box(rx, x1, gate1, gate1 + POST, 0, FENCE_HEIGHT + 5, FENCE_LABEL)
    for z0, z1 in RAILS:
        grid.box(x0 + 1, x0 + 3, y0, y1, z0, z1, FENCE_LABEL)
        grid.box(rx + 1, rx + 3, y0, gate0, z0, z1, FENCE_LABEL)
        grid.box(rx + 1, rx + 3, gate1, y1, z0, z1, FENCE_LABEL)
    # The gate leaf swung open into the pen, flat against the hinge post
    for z0, z1 in RAILS:
        grid.box(rx - 20, rx, gate1 + 1, gate1 + 3, z0, z1, FENCE_LABEL)
    grid.box(rx - 20, rx - 16, gate1 + 1, gate1 + 3, 3, FENCE_HEIGHT - 1, FENCE_LABEL)
    # A trodden trail from the gate to the slaughter door
    for y in range(gate0, y1):
        for x in range(DOOR[0] + 6, rx):
            t = (y - gate0) / (y1 - gate0)
            centre = rx - 8 - t * (rx - 8 - (DOOR[0] + DOOR[1]) / 2)
            if abs(x - centre) < 5 and grid.get(x, y, 1) == STRAW_LABEL:
                grid.set(x, y, 1, EMPTY)
                grid.set(x, y, 2, EMPTY)

    tx0, tx1, ty0, ty1, tz = TROUGH
    grid.box(tx0, tx1, ty0, ty1, 1, tz, TROUGH_LABEL)
    grid.box(tx0 + 2, tx1 - 2, ty0 + 2, ty1 - 2, tz - 2, tz, FEED_LABEL)


def scaled(grid: VoxelGrid, cx: float, cy: float, k: float):
    """Helpers placing parts of an animal around (cx, cy), every size multiplied by k."""

    def blob(dx: float, dy: float, z: float, rx: float, ry: float, rz: float, label: int) -> None:
        ellipsoid(grid, cx + dx * k, cy + dy * k, z * k, rx * k, ry * k, rz * k, label)

    def block(dx: float, dy: float, z: float, sx: float, sy: float, sz: float, label: int) -> None:
        x, y = round(cx + dx * k), round(cy + dy * k)
        grid.box(x, x + max(2, round(sx * k)), y, y + max(2, round(sy * k)), round(z * k), round((z + sz) * k), label)

    return blob, block


def build_pig(grid: VoxelGrid, cx: float, cy: float, k: float) -> None:
    blob, block = scaled(grid, cx, cy, k)
    for lx in (-6, 4):
        for ly in (-3.5, 1.5):
            block(lx, ly, 0, 2.5, 2.5, 5, PIG_LABEL)
    blob(0, 0, 10, 11, 7, 7, PIG_LABEL)
    blob(-11, -1, 11, 6, 6, 6, PIG_LABEL)
    blob(-16.5, -1, 10, 2.2, 3.2, 3, SNOUT_LABEL)
    block(-13, -5, 15.5, 3, 3, 3, PIG_LABEL)
    block(-13, 2, 15.5, 3, 3, 3, PIG_LABEL)
    block(10, -1, 12, 3, 2, 2, PIG_LABEL)
    block(12, -1, 14, 2, 2, 2.5, PIG_LABEL)


def build_sheep(grid: VoxelGrid, cx: float, cy: float, k: float) -> None:
    blob, block = scaled(grid, cx, cy, k)
    for lx in (-5, 4):
        for ly in (-3, 2):
            block(lx, ly, 0, 2, 2, 6, FACE_LABEL)
    blob(0, 0, 12, 8, 6.5, 6, WOOL_LABEL)
    for dx, dy, dz, r in ((-6, 0, 13, 4.5), (6, 0, 13, 4.5), (0, -3, 15, 4.5), (-3, 3, 16, 4), (3, 2, 16, 4)):
        blob(dx, dy, dz, r, r, r, WOOL_LABEL)
    blob(11, -1, 13, 4, 3.2, 4, FACE_LABEL)
    blob(9, -1, 17, 2.5, 3, 2, WOOL_LABEL)


def build_model() -> VoxelGrid:
    grid = VoxelGrid(HALF_X, HALF_Y)
    build_hall(grid)
    build_pen(grid)
    build_pig(grid, *PIG_AT, ANIMAL_SCALE)
    build_pig(grid, *PIGLET_AT, 0.8)
    build_sheep(grid, *SHEEP_AT, ANIMAL_SCALE)
    return grid


def face(hit: Hit) -> str:
    if hit.neighbor(0, 0, 1) == EMPTY:
        return "top"
    if hit.neighbor(0, -1, 0) == EMPTY:
        return "front"
    if hit.neighbor(-1, 0, 0) == EMPTY:
        return "left"
    return "right"


def lit(hit: Hit, ramp: list, base: int) -> tuple[int, int, int, int]:
    light = hit.light(hit.normal())
    return step(ramp, base + (1 if light > 0.55 else 0 if light > 0.1 else -1 if light > -0.3 else -2))


def shade(hit: Hit) -> tuple[int, int, int, int]:
    side = face(hit)
    label = hit.label

    if label == FOOTING_LABEL:
        return GRANITE[3] if side == "top" else GRANITE[1]

    if label == PLINTH_LABEL:
        # Dwarf masonry: big granite blocks in staggered courses
        if side == "top":
            return GRANITE[4]
        base = 3 if side == "front" else 2 if side == "left" else 1
        row = (hit.z - FOOTING_HEIGHT) // 5
        u = hit.mx if side == "front" else hit.my
        if (hit.z - FOOTING_HEIGHT) % 5 == 4 or (u + (row % 2) * 6 + (2 if noise(row, 3) > 0.5 else 0)) % 12 == 0:
            base -= 1
        if hit.z >= PLINTH_TOP - 2:
            base -= 1
        return step(GRANITE, base)

    if label == WALL_LABEL:
        base = 2 if side == "front" else 1
        if side == "front" and hit.z >= WALL_TOP - 9:
            base -= 1
        if base == 2 and noise(hit.mx // 3, hit.z // 2, 11) > 0.93:
            base = 3
        return step(PLASTER, base)

    if label == BEAM_LABEL:
        if side == "top":
            return BEAM[2]
        return BEAM[1] if side in ("front", "left") else BEAM[0]

    if label == ROOF_LABEL:
        if hit.neighbor(0, 0, 1) != EMPTY and hit.neighbor(0, 0, -1) == EMPTY:
            return SHINGLE[0]
        ridge = (HALL[2] + HALL[3]) / 2
        if side == "left" or hit.neighbor(-1, 0, 0) == EMPTY and hit.neighbor(-1, 0, -1) == EMPTY:
            return SHINGLE[2] if hit.mx < 0 else SHINGLE[1]
        if hit.mx > 0 and hit.neighbor(1, 0, 1) == EMPTY and hit.neighbor(0, -1, 1) != EMPTY:
            return SHINGLE[1]
        index = 3 if hit.my >= ridge - 3 else 2
        course = (hit.my - HALL[2] + EAVE) // 4
        shift = round(noise(course, 21) * 6)
        if (hit.my - HALL[2] + EAVE) % 4 == 0 or ((hit.mx + 400 + shift + course * 4) % 8 == 0 and noise(course, (hit.mx + 400 + shift + course * 4) // 8) > 0.35):
            index -= 1
        elif noise(course, (hit.mx + 400 + shift + course * 4) // 8, 13) > 0.85:
            index -= 1
        return step(SHINGLE, index)

    if label == CHIMNEY_LABEL:
        if side == "top":
            return GRANITE[4]
        if hit.neighbor(0, 0, 1) == EMPTY or (hit.z > CHIMNEY[4] - 5 and side != "front"):
            return INTERIOR
        base = 3 if side == "front" else 2 if side == "left" else 1
        if hit.z % 5 == 0 or (hit.mx + (hit.z // 5 % 2) * 4) % 8 == 0:
            base -= 1
        return step(GRANITE, base)

    if label == DOOR_LABEL:
        index = 1 if (hit.mx + 200) % 7 == 0 else 2
        if hit.mx == (DOOR[0] + DOOR[1]) // 2:
            return INK
        if index == 2 and noise(hit.mx, hit.z // 4, 5) > 0.85:
            index = 1
        return step(WOOD, index - (1 if hit.z >= DOOR[2] - 4 else 0))

    if label == WINDOW_LABEL:
        return INTERIOR

    if label in (WOOD_LABEL, AWNING_LABEL, TROUGH_LABEL):
        if side == "top":
            index = 3
            if label == AWNING_LABEL and (hit.mx + 200) % 6 == 0:
                index = 2
            return step(WOOD, index)
        return step(WOOD, 2 if side in ("front", "left") else 1)

    if label == FEED_LABEL:
        return step(STRAW, 3 if noise(hit.mx, hit.my, 2) > 0.4 else 2)

    if label == IRON_LABEL and SIGN_X - 7 <= hit.mx < SIGN_X + 5 and 32 <= hit.z < 43 and side == "front":
        if hit.z < 34:
            return IRON[4]
        if SIGN_X - 5 <= hit.mx < SIGN_X - 3 and 39 <= hit.z < 41:
            return INK
        return IRON[2] if hit.mx >= SIGN_X + 2 else IRON[3]

    if label == IRON_LABEL:
        if side == "top":
            return IRON[4]
        return IRON[3] if side in ("front", "left") else IRON[2]

    if label == MEAT_LABEL:
        return lit(hit, MEAT, 2)

    if label == BONE_LABEL:
        return BONE[1] if side == "top" else BONE[0]

    if label == FLOOR_LABEL:
        index = 2
        if noise(hit.mx // 4, hit.my // 3, 4) > 0.9:
            index = 1
        return step(DIRT, index)

    if label == STRAW_LABEL:
        index = 3
        if noise(hit.mx, hit.my // 3, 6) > 0.7:
            index = 2
        if hit.neighbor(0, 0, 1) != EMPTY:
            index = 1
        return step(STRAW, index)

    if label == FENCE_LABEL:
        if side == "top":
            return WOOD[3]
        return WOOD[2] if side in ("front", "left") else WOOD[1]

    if label == PIG_LABEL:
        return lit(hit, PIG, 3)

    if label == SNOUT_LABEL:
        # The snout's flat end, with two nostrils
        return PIG[2] if hit.neighbor(-1, 0, 0) == EMPTY else PIG[1]

    if label == WOOL_LABEL:
        return lit(hit, WOOL, 2)

    if label == FACE_LABEL:
        return step(IRON, 1 if side in ("front", "top", "left") else 0)

    if label == SMOKE_LABEL:
        return lit(hit, WOOL, 2)

    return (255, 0, 255, 255)


SAME_MATERIAL = ({SMOKE_LABEL},{WALL_LABEL, BEAM_LABEL}, {WOOD_LABEL, AWNING_LABEL}, {FLOOR_LABEL, STRAW_LABEL}, {PIG_LABEL, SNOUT_LABEL})


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    if label == other or any({label, other} <= group for group in SAME_MATERIAL):
        return None
    if FLOOR_LABEL in (label, other) or STRAW_LABEL in (label, other):
        return None
    return INK


def footprint_shadow(x: float, y: float) -> float:
    """Distance outside the hall and the pen fences, in units of their margin: a rim around the hall, almost none
    around the low pen, and nothing on the empty bottom right cell."""
    x, y = x - SHADOW_OFFSET[0], y - SHADOW_OFFSET[1]

    def outside(box: tuple[int, int, int, int]) -> float:
        bx0, bx1, by0, by1 = box
        return max(bx0 - x, x - bx1, by0 - y, y - by1, 0)

    return min(outside(FOOTING) / 3, outside(PEN) / 1.5)


def main() -> None:
    grid = build_model()
    # shadow_radii is ignored, footprint_shadow gives the shape
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), SHADOW_JITTER, shadow_shape=footprint_shadow)
    # Fence posts and rails are thin: a 2px depth outline would turn them into ink bars
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
