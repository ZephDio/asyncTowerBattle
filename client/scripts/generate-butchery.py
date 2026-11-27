#!/usr/bin/env python3
"""Generates the Butchery pixel art.

Run from anywhere: python3 scripts/generate-butchery.py

Outputs public/resources/totem/butchery.png, a 196x196 front view. The Butchery is an L shaped three-cell piece
(`oo / os`) drawn over its 2x2 cell box, so each 98px quadrant of the image is one cell; the bottom right cell,
its star, stays transparent.

The top two cells hold the butcher's hall, a Dwarf monument in the stone bricks of the Dwarf castle on a rough
granite plinth, under a flat battlemented roof with a smoking chimney and a signboard carved with a big steak. Its left half is the
open slaughter door: a bloody axe stuck in a stump and a steak on a hook. Its right half is the shop, a counter
under an awning hung with hams and strings of sausages, a cleaver sign and a coiled sausage sign. The bottom left cell holds
its annex, a stone cold room under a slate roof with sides of meat hanging in its open arch, behind which a paved
cutting yard holds a chopping block with a bloody cleaver, a rack of steaks and salt barrels. The yard is open on
its right, toward the star, where the animals come in.

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

# Ramps, dark to light. STONE, ROCK, TRIM and the slate IRON are the Dwarf castle's
STONE = [(70, 64, 84, 255), (108, 98, 108, 255), (146, 134, 130, 255), (186, 172, 156, 255), (214, 200, 176, 255)]
ROCK = [(44, 40, 62, 255), (72, 66, 90, 255), (104, 96, 118, 255), (142, 132, 146, 255), (184, 172, 178, 255)]
TRIM = [(96, 86, 96, 255), (142, 128, 122, 255), (184, 168, 148, 255), (222, 206, 176, 255)]
SLATE = [(38, 42, 58, 255), (58, 64, 86, 255), (84, 92, 116, 255), (124, 132, 156, 255), (150, 160, 190, 255)]
STEEL = [(48, 44, 68, 255), (66, 64, 92, 255), (92, 94, 124, 255), (136, 142, 168, 255), (190, 196, 214, 255)]
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
SHINGLE = [(72, 40, 52, 255), (110, 52, 58, 255), (150, 72, 64, 255), (190, 106, 78, 255)]
MEAT = [(84, 30, 52, 255), (138, 46, 56, 255), (186, 78, 68, 255), (222, 128, 98, 255)]
FAT = [(176, 160, 140, 255), (236, 226, 196, 255)]
BLOOD = [(70, 16, 38, 255), (124, 22, 40, 255), (176, 30, 42, 255)]
SMOKE = [(86, 80, 102, 255), (146, 140, 150, 255), (198, 194, 188, 255), (236, 232, 212, 255)]
INTERIOR = [(30, 24, 40, 255), (44, 36, 54, 255)]
INK = (22, 28, 46, 255)

# The hall over the two top cells: its front wall stands just above the empty bottom right cell
HALL = (-90, 90, 90, 128)  # x0, x1, y0, y1
FOOTING = (-93, 93, 87, 131)
FOOTING_HEIGHT = 3
PLINTH_TOP = 14
WALL_TOP = 54
EAVE = 5
ROOF_SLOPE = 1.05
DOOR = (-72, -32, 38)  # x0, x1, top z: the open slaughter door
DOOR_DEPTH = 10
SHOP = (6, 48, 21, 38)  # x0, x1, z0, z1: the counter window
AWNING = (0, 54, 82, 44)  # x0, x1, front y, z at the wall
HAMS = (12, 42)
SAUSAGES = (22, 32)
CHIMNEY = (48, 60, 100, 110, 78)
SMOKE_PUFFS = ((53, 106, 83, 5.5), (59, 110, 90, 4.5))
SIGN_X = -18
COIL = (72, 33, 11)  # x, z, radius of the coiled sausage sign
MERLON = (6, 10, 6)  # width, period, height of the battlements
MEAT_SIGN = (-50, -4, 58, 86)  # x0, x1, z0, z1 of the signboard on the roof

# The annex on the bottom left cell: a cold room in front, a cutting yard behind it
ANNEX = (-90, -10, -50, -28)  # x0, x1, y0, y1
ANNEX_WALL = 38
ARCH = (-80, -20, 30)  # x0, x1, top z
CARCASSES = (-68, -50, -32)
YARD = (-92, -6, -28, 87)
YARD_WALL = 10
BLOCK = (-30, 40)  # chopping block, x, y
RACK = (-84, -50, 58)  # x0, x1, y
BARRELS = ((-78, 18), (-66, 26), (-80, 32))

SHADOW_OFFSET = (0, -2)
SHADOW_JITTER = 0.25

(
    FOOTING_LABEL,
    PLINTH_LABEL,
    WALL_LABEL,
    QUOIN_LABEL,
    ROOF_LABEL,
    DARK_LABEL,
    WOOD_LABEL,
    AWNING_LABEL,
    STEEL_LABEL,
    MEAT_LABEL,
    FAT_LABEL,
    BLOOD_LABEL,
    CHIMNEY_LABEL,
    SMOKE_LABEL,
    SLATE_LABEL,
    PAVING_LABEL,
    COIL_LABEL,
    BLADE_LABEL,
    HILT_LABEL,
    HANDLE_LABEL,
    SAUSAGE_LABEL,
    TWINE_LABEL,
) = range(1, 23)


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


def cylinder_z(grid: VoxelGrid, cx: float, cy: float, z0: int, z1: int, r: float, label: int) -> None:
    for z in range(z0, z1):
        for y in range(math.floor(cy - r), math.ceil(cy + r) + 1):
            for x in range(math.floor(cx - r), math.ceil(cx + r) + 1):
                if math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r:
                    grid.set(x, y, z, label)


def roof_top(y: float) -> float:
    ridge = (HALL[2] + HALL[3]) / 2
    return WALL_TOP + ((HALL[3] - HALL[2]) / 2 + EAVE - abs(y + 0.5 - ridge)) * ROOF_SLOPE


def hanging_steak(grid: VoxelGrid, x: float, y: float, z: float, size: float = 1.0) -> None:
    """A steak hanging from an iron hook, its top at z: a flat red slab with a rim of fat and a bone."""
    grid.box(round(x), round(x) + 1, round(y), round(y) + 1, round(z), round(z) + 4, STEEL_LABEL)
    ellipsoid(grid, x, y, z - 8, 6.5 * size, 1.6, 8 * size, FAT_LABEL)
    ellipsoid(grid, x, y - 0.6, z - 8, 5.5 * size, 1.4, 7 * size, MEAT_LABEL)
    # A round marrow bone near its top
    ellipsoid(grid, x - 2 * size, y - 1.8, z - 5 * size, 1.6, 0.8, 1.6, FAT_LABEL)


def build_hall(grid: VoxelGrid) -> None:
    fx0, fx1, fy0, fy1 = FOOTING
    grid.box(fx0, fx1, fy0, fy1, 0, FOOTING_HEIGHT, FOOTING_LABEL)
    x0, x1, y0, y1 = HALL
    grid.box(x0, x1, y0, y1, FOOTING_HEIGHT, PLINTH_TOP, PLINTH_LABEL)
    grid.box(x0, x1, y0, y1, PLINTH_TOP, WALL_TOP, WALL_LABEL)
    # Quoins standing out at the corners and a cornice under the eave
    for qx in (x0 - 1, x1 - 5):
        for z in range(PLINTH_TOP, WALL_TOP, 8):
            wide = (z // 8) % 2 == 0
            grid.box(qx, qx + (6 if wide else 4) + (0 if qx < 0 else -(2 if wide else 0)), y0 - 1, y0, z, z + 7, QUOIN_LABEL)
    grid.box(x0 - 1, x1 + 1, y0 - 2, y0, WALL_TOP - 3, WALL_TOP, QUOIN_LABEL)
    # Flat stone roof behind battlements, like the Dwarf castle
    grid.box(x0 - 1, x1 + 1, y0 - 2, y1 + 1, WALL_TOP, WALL_TOP + 3, QUOIN_LABEL)
    grid.box(x0 + 3, x1 - 3, y0 + 2, y1 - 3, WALL_TOP + 2, WALL_TOP + 3, ROOF_LABEL)
    width, period, height = MERLON
    for mx in range(x0 - 1, x1 + 1, period):
        for my in (y0 - 2, y1 - 2):
            grid.box(mx, min(mx + width, x1 + 1), my, my + 3, WALL_TOP + 3, WALL_TOP + 3 + height, QUOIN_LABEL)
    for my in range(y0 + 6, y1 - 2, period):
        for mx in (x0 - 1, x1 - 2):
            grid.box(mx, mx + 3, my, my + width, WALL_TOP + 3, WALL_TOP + 3 + height, QUOIN_LABEL)
    cx0, cx1, cy0, cy1, ctop = CHIMNEY
    grid.box(cx0, cx1, cy0, cy1, WALL_TOP, ctop, CHIMNEY_LABEL)
    grid.box(cx0 + 3, cx1 - 3, cy0 + 3, cy1 - 3, ctop - 4, ctop, EMPTY)
    for sx, sy, sz, r in SMOKE_PUFFS:
        ellipsoid(grid, sx, sy, sz, r, r, r * 0.8, SMOKE_LABEL)
    build_meat_sign(grid)

    # The open slaughter door: a recess with a dark back, a stone arch, a stump with a bloody axe, a hooked steak
    dx0, dx1, dtop = DOOR
    grid.box(dx0, dx1, y0, y0 + DOOR_DEPTH, FOOTING_HEIGHT, dtop, EMPTY)
    grid.box(dx0, dx1, y0 + DOOR_DEPTH, y0 + DOOR_DEPTH + 1, FOOTING_HEIGHT, dtop, DARK_LABEL)
    grid.box(dx0, dx1, y0, y0 + DOOR_DEPTH, FOOTING_HEIGHT - 1, FOOTING_HEIGHT, DARK_LABEL)
    grid.box(dx0 - 3, dx1 + 3, y0 - 2, y0, dtop, dtop + 4, QUOIN_LABEL)
    for jx in (dx0 - 3, dx1):
        grid.box(jx, jx + 3, y0 - 2, y0, FOOTING_HEIGHT, dtop, QUOIN_LABEL)
    stump_x, stump_y = dx0 + 11, y0 + 4
    cylinder_z(grid, stump_x, stump_y, FOOTING_HEIGHT, FOOTING_HEIGHT + 9, 7, WOOD_LABEL)
    # The axe: handle leaning up to the right, a broad head bitten into the stump
    for i in range(18):
        hx, hz = stump_x + 1 + i * 0.6, FOOTING_HEIGHT + 12 + i
        grid.box(round(hx), round(hx) + 2, stump_y - 1, stump_y + 1, round(hz), round(hz) + 1, WOOD_LABEL)
    for x in range(stump_x - 9, stump_x + 3):
        for z in range(FOOTING_HEIGHT + 7, FOOTING_HEIGHT + 22):
            dx, dz = x - (stump_x + 2), z - (FOOTING_HEIGHT + 14)
            if (dx / 11) ** 2 + (dz / 7.5) ** 2 <= 1:
                grid.box(x, x + 1, stump_y - 2, stump_y + 1, z, z + 1, BLADE_LABEL)
    hanging_steak(grid, dx1 - 9, y0 + 3, dtop - 2, 1.2)
    # Blood running out of the door onto the plinth and the paving
    for bx, by, r in ((stump_x - 2, y0 - 2, 4), (stump_x + 6, y0 - 6, 3), (dx1 - 10, y0 - 3, 2.5)):
        for y in range(math.floor(by - r), math.ceil(by + r)):
            for x in range(math.floor(bx - r * 1.6), math.ceil(bx + r * 1.6)):
                if ((x - bx) / 1.6) ** 2 + (y - by) ** 2 <= r * r and grid.get(x, y, FOOTING_HEIGHT - 1):
                    grid.set(x, y, FOOTING_HEIGHT - 1, BLOOD_LABEL)

    # Shop: a dark counter window, a plank sill, an awning hung with hams and sausages
    sx0, sx1, sz0, sz1 = SHOP
    grid.box(sx0, sx1, y0 - 1, y0 + 3, sz0, sz1, DARK_LABEL)
    grid.box(sx0 - 3, sx1 + 3, y0 - 5, y0, sz0 - 3, sz0, WOOD_LABEL)
    ax0, ax1, afront, az = AWNING
    for y in range(afront, y0):
        z = az - round((y0 - y) * 0.45)
        grid.box(ax0, ax1, y, y + 1, z, z + 2, AWNING_LABEL)
    grid.box(sx0, sx1, afront + 2, afront + 3, az - 7, az - 6, STEEL_LABEL)
    hang_y = afront + 2.5
    for hx in HAMS:
        ellipsoid(grid, hx, hang_y, az - 16, 5, 3.5, 5.5, MEAT_LABEL)
        ellipsoid(grid, hx, hang_y, az - 11, 3, 2.4, 2.8, MEAT_LABEL)
        grid.box(hx - 1, hx + 1, math.floor(hang_y) - 1, math.floor(hang_y) + 1, az - 9, az - 7, FAT_LABEL)
    for sx in SAUSAGES:
        for i, z in enumerate(range(az - 11, az - 28, -6)):
            ellipsoid(grid, sx + (0.8 if i % 2 else -0.8), hang_y, z, 2.4, 2.2, 2.8, SAUSAGE_LABEL)
            grid.box(sx - 1, sx + 1, math.floor(hang_y) - 1, math.floor(hang_y) + 1, z + 3, z + 4, TWINE_LABEL)
    # Cleaver sign on an iron bracket, blood on its edge
    grid.box(SIGN_X - 1, SIGN_X + 1, y0 - 10, y0, 47, 49, STEEL_LABEL)
    grid.box(SIGN_X - 7, SIGN_X + 5, y0 - 9, y0 - 7, 32, 43, BLADE_LABEL)
    grid.box(SIGN_X + 5, SIGN_X + 12, y0 - 9, y0 - 7, 38, 41, WOOD_LABEL)
    grid.box(SIGN_X - 1, SIGN_X + 1, y0 - 9, y0 - 7, 43, 47, STEEL_LABEL)
    # Coiled sausage sign on the right of the shop
    cx, cz, r = COIL
    for z in range(cz - r - 2, cz + r + 2):
        for x in range(cx - r - 2, cx + r + 2):
            if math.hypot(x + 0.5 - cx, z + 0.5 - cz) <= r + 1.5:
                grid.box(x, x + 1, y0 - 2, y0, z, z + 1, WOOD_LABEL)
    grid.box(cx - 1, cx + 1, y0 - 1, y0, cz + r + 1, WALL_TOP - 3, STEEL_LABEL)
    # The sausage coiled in a spiral, a tube made of links, a tie of twine between two links
    t = 0.0
    link = 0
    while True:
        radius = 2.0 + t * 3.8 / (2 * math.pi)
        if radius > r - 1:
            break
        px, pz = cx + radius * math.cos(t), cz + radius * math.sin(t)
        tied = (t * radius) % 8 < 0.7
        ellipsoid(grid, px, y0 - 3.2, pz, 1.5, 1.4, 1.5, TWINE_LABEL if tied else SAUSAGE_LABEL)
        t += 0.35 / max(1.0, radius / 3)


def build_meat_sign(grid: VoxelGrid) -> None:
    """A wooden signboard on two posts behind the front battlements, a big T-bone steak carved on it."""
    sx0, sx1, sz0, sz1 = MEAT_SIGN
    y = HALL[2] + 4
    for px in (sx0 + 4, sx1 - 6):
        grid.box(px, px + 2, y + 1, y + 3, WALL_TOP + 3, sz0, HANDLE_LABEL)
    grid.box(sx0, sx1, y, y + 2, sz0, sz1, WOOD_LABEL)
    grid.box(sx0 - 1, sx1 + 1, y - 1, y, sz0 - 1, sz0 + 1, HANDLE_LABEL)
    grid.box(sx0 - 1, sx1 + 1, y - 1, y, sz1 - 1, sz1 + 1, HANDLE_LABEL)
    cx, cz = (sx0 + sx1) / 2, (sz0 + sz1) / 2
    # The steak: a kidney shaped slab, a thick fat cap along its top and left, marbled red, the T of a bone
    for x in range(sx0 + 1, sx1 - 1):
        for z in range(sz0 + 1, sz1 - 1):
            dx, dz = (x + 0.5 - cx) / 19, (z + 0.5 - cz) / 11.5
            angle = math.atan2(dz, dx)
            edge = 1 + 0.12 * math.cos(angle) - 0.16 * math.cos(2 * angle - 0.6) + 0.06 * math.sin(3 * angle)
            r = math.hypot(dx, dz) / edge
            if r > 1:
                continue
            cap = r > 0.74 and (dz > -0.2 or dx < -0.4)
            label = FAT_LABEL if cap or (r < 0.7 and noise(x, z, 51) > 0.93) else MEAT_LABEL
            grid.box(x, x + 1, y - 2, y, z, z + 1, label)
    bx, bz = round(cx) - 5, round(cz) + 1
    grid.box(bx - 6, bx + 6, y - 3, y - 2, bz + 1, bz + 3, FAT_LABEL)
    grid.box(bx - 1, bx + 1, y - 3, y - 2, bz - 7, bz + 1, FAT_LABEL)


def build_annex(grid: VoxelGrid) -> None:
    # Cutting yard: stone flags behind the cold room, a low wall on the left and the back, open on the right
    yx0, yx1, yy0, yy1 = YARD
    grid.box(yx0, yx1, yy0, yy1, 0, 2, PAVING_LABEL)
    grid.box(yx0, yx0 + 4, yy0, yy1, 0, YARD_WALL, WALL_LABEL)
    # Blood pools on the flags around the block and along the trail to the door
    for bx, by, r in ((BLOCK[0] + 4, BLOCK[1] - 5, 5), (BLOCK[0] - 6, BLOCK[1] + 6, 3), (-44, 72, 3.5), (-22, 12, 2.5)):
        for y in range(math.floor(by - r), math.ceil(by + r)):
            for x in range(math.floor(bx - r * 1.5), math.ceil(bx + r * 1.5)):
                if ((x - bx) / 1.5) ** 2 + (y - by) ** 2 <= r * r * (0.8 + 0.4 * noise(x, y)):
                    grid.set(x, y, 1, BLOOD_LABEL)
    # Chopping block with a cleaver bitten into it
    bx, by = BLOCK
    cylinder_z(grid, bx, by, 2, 14, 7, WOOD_LABEL)
    grid.box(bx - 3, bx + 5, by - 1, by + 1, 14, 22, BLADE_LABEL)
    grid.box(bx - 1, bx + 1, by - 1, by + 1, 22, 28, WOOD_LABEL)
    # Rack of steaks and sausages along the back
    rx0, rx1, ry = RACK
    for px in (rx0, rx1 - 3):
        grid.box(px, px + 3, ry, ry + 3, 2, 34, WOOD_LABEL)
    grid.box(rx0, rx1, ry, ry + 3, 31, 34, WOOD_LABEL)
    for i, sx in enumerate(range(rx0 + 7, rx1 - 4, 7)):
        if i % 2:
            for j, z in enumerate(range(28, 14, -3)):
                ellipsoid(grid, sx + (0.5 if j % 2 else -0.5), ry + 1, z, 1.8, 1.8, 1.7, MEAT_LABEL)
        else:
            hanging_steak(grid, sx, ry + 1, 30)
    for cx, cy in BARRELS:
        cylinder_z(grid, cx, cy, 2, 14, 5, WOOD_LABEL)
        cylinder_z(grid, cx, cy, 14, 15, 4, FAT_LABEL)

    # Cold room: stone walls, a slate shed roof sloping toward the camera, an open arch with sides of meat
    x0, x1, y0, y1 = ANNEX
    grid.box(x0, x1, y0, y1, 0, FOOTING_HEIGHT, FOOTING_LABEL)
    grid.box(x0, x1, y0, y1, FOOTING_HEIGHT, ANNEX_WALL, WALL_LABEL)
    # A flat stone roof behind a crenellated parapet, like the Dwarf castle's gatehouse
    grid.box(x0 - 1, x1 + 1, y0 - 1, y1 + 1, ANNEX_WALL - 3, ANNEX_WALL, QUOIN_LABEL)
    grid.box(x0 + 2, x1 - 2, y0 + 2, y1 - 2, ANNEX_WALL - 1, ANNEX_WALL, SLATE_LABEL)
    for mx in range(x0 - 1, x1 + 1, 10):
        grid.box(mx, min(mx + 6, x1 + 1), y0 - 1, y0 + 2, ANNEX_WALL, ANNEX_WALL + 5, QUOIN_LABEL)
    for qx in (x0 - 1, x1 - 5):
        for z in range(FOOTING_HEIGHT, ANNEX_WALL, 8):
            grid.box(qx, qx + 6, y0 - 1, y0, z, z + 7, QUOIN_LABEL)
    ax0, ax1, atop = ARCH
    mid, half = (ax0 + ax1) / 2, (ax1 - ax0) / 2
    for x in range(ax0, ax1):
        # A flattened arch: straight jambs, a curved head
        head = atop - 6 + 6 * math.sqrt(max(0.0, 1 - ((x + 0.5 - mid) / half) ** 2))
        grid.box(x, x + 1, y0, y1 - 3, FOOTING_HEIGHT, round(head), EMPTY)
        grid.box(x, x + 1, y1 - 3, y1 - 2, FOOTING_HEIGHT, round(head), DARK_LABEL)
        grid.box(x, x + 1, y0 - 2, y0, round(head), round(head) + 3, QUOIN_LABEL)
    grid.box(ax0, ax1, y0, y1 - 3, FOOTING_HEIGHT - 1, FOOTING_HEIGHT, DARK_LABEL)
    grid.box(ax0 + 2, ax1 - 2, y0 + 6, y0 + 7, atop - 4, atop - 3, STEEL_LABEL)
    # Sides of meat on hooks: a long red haunch with ribs of fat across it
    for cx in CARCASSES:
        grid.box(cx, cx + 1, y0 + 6, y0 + 7, atop - 8, atop - 4, STEEL_LABEL)
        ellipsoid(grid, cx + 0.5, y0 + 6.5, atop - 15, 5.5, 2.5, 8, MEAT_LABEL)
        ellipsoid(grid, cx + 0.5, y0 + 6.5, atop - 24, 3.2, 2, 3.5, MEAT_LABEL)
        for rz in (atop - 18, atop - 13):
            grid.box(cx - 2, cx + 3, y0 + 3, y0 + 4, rz, rz + 1, FAT_LABEL)


def build_model() -> VoxelGrid:
    grid = VoxelGrid(HALF_X, HALF_Y)
    build_hall(grid)
    build_annex(grid)
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


def bricks(hit: Hit, side: str, base: int, height: int = 7, width: int = 13) -> tuple[int, int, int, int]:
    """Rough Dwarf stone bricks: staggered courses, a mortar line one step down, each brick its own shade."""
    u = hit.mx if side in ("front", "top") else hit.my
    row = hit.z // height
    shift = (row % 2) * (width // 2) + round(noise(row, 17) * 3)
    brick = (u + 400 + shift) // width
    if hit.z % height == 0 or (u + 400 + shift) % width == 0:
        return step(STONE, base - 1)
    jitter = noise(row, brick, 5)
    index = base + (1 if jitter > 0.82 else -1 if jitter < 0.18 else 0)
    if noise(hit.mx, hit.z, 19) > 0.96:
        index -= 1
    return step(STONE, index)


def shade(hit: Hit) -> tuple[int, int, int, int]:
    side = face(hit)
    label = hit.label

    if label == FOOTING_LABEL:
        return ROCK[3] if side == "top" else ROCK[1]

    if label == PLINTH_LABEL:
        # Rough granite blocks
        if side == "top":
            return ROCK[4]
        base = 3 if side == "front" else 2 if side == "left" else 1
        row = (hit.z - FOOTING_HEIGHT) // 6
        u = hit.mx if side == "front" else hit.my
        if (hit.z - FOOTING_HEIGHT) % 6 == 5 or (u + 400 + (row % 2) * 9 + round(noise(row, 3) * 4)) % 18 == 0:
            base -= 1
        if hit.z >= PLINTH_TOP - 2:
            base -= 1
        return step(ROCK, base)

    if label == WALL_LABEL:
        if side == "top":
            return STONE[4]
        base = 3 if side == "front" else 2 if side == "left" else 1
        return bricks(hit, side, base)

    if label == QUOIN_LABEL:
        if side == "top":
            return TRIM[3]
        return TRIM[2] if side in ("front", "left") else TRIM[1]

    if label == ROOF_LABEL:
        # Square stone slabs on the flat roof
        if (hit.mx + 400) % 12 == 0 or hit.my % 10 == 0:
            return STONE[1]
        slab = noise((hit.mx + 400) // 12, hit.my // 10, 9)
        return STONE[3] if slab > 0.75 else STONE[1] if slab < 0.12 else STONE[2]

    if label == SLATE_LABEL:
        if hit.neighbor(0, 0, 1) != EMPTY and hit.neighbor(0, 0, -1) == EMPTY:
            return SLATE[0]
        if side == "left":
            return SLATE[2]
        index = 3
        course = hit.my // 4
        if hit.my % 4 == 0 or (hit.mx + 400 + course * 5) % 9 == 0:
            index -= 1
        return step(SLATE, index)

    if label == CHIMNEY_LABEL:
        if side == "top":
            return STONE[4]
        if hit.neighbor(0, 0, 1) == EMPTY or (hit.z > CHIMNEY[4] - 5 and side != "front"):
            return INTERIOR[0]
        return bricks(hit, side, 3 if side == "front" else 2 if side == "left" else 1, 5, 8)

    if label == SMOKE_LABEL:
        return lit(hit, SMOKE, 2)

    if label == DARK_LABEL:
        return INTERIOR[1] if side == "top" else INTERIOR[0]

    if label in (WOOD_LABEL, AWNING_LABEL):
        if side == "top":
            index = 3
            if label == AWNING_LABEL and (hit.mx + 200) % 6 == 0:
                index = 2
            return step(WOOD, index)
        return step(WOOD, 2 if side in ("front", "left") else 1)

    if label == SAUSAGE_LABEL:
        # A glossy casing: lit on the upper left, with a small highlight
        light = hit.light(hit.normal())
        if light > 0.8 and noise(hit.mx, hit.z, 41) > 0.5:
            return MEAT[3]
        return step(MEAT, 2 if light > 0.35 else 1 if light > -0.2 else 0)

    if label == TWINE_LABEL:
        return FAT[1] if side in ("top", "front", "left") else FAT[0]

    if label == HANDLE_LABEL:
        return WOOD[1] if side in ("top", "front", "left") else WOOD[0]

    if label == COIL_LABEL:
        # A sausage coiled in a spiral: bands by radius, twisted by the angle
        dx, dz = hit.mx + 0.5 - COIL[0], hit.z + 0.5 - COIL[1]
        turn = (math.hypot(dx, dz) + math.atan2(dz, dx) / (2 * math.pi) * 3) % 3
        return MEAT[3] if turn < 0.8 else MEAT[2] if turn < 2 else MEAT[0]

    if label in (STEEL_LABEL, HILT_LABEL):
        if side == "top":
            return STEEL[4] if label == STEEL_LABEL else TRIM[3]
        if label == HILT_LABEL:
            return TRIM[2] if side in ("front", "left") else TRIM[1]
        return STEEL[3] if side in ("front", "left") else STEEL[2]

    if label == BLADE_LABEL:
        # Steel with a bright edge; the lower half of a butcher's blade is stained with blood
        index = 4 if side == "top" else 3 if side in ("front", "left") else 2
        if noise(hit.mx // 2, hit.z // 2, 31) > 0.55 and hit.z % 7 < 4:
            return BLOOD[2] if index >= 3 else BLOOD[1]
        return step(STEEL, index)

    if label == MEAT_LABEL:
        return lit(hit, MEAT, 2)

    if label == FAT_LABEL:
        return FAT[1] if side == "top" else FAT[0]

    if label == BLOOD_LABEL:
        return BLOOD[2] if noise(hit.mx // 2, hit.my // 2, 4) > 0.7 else BLOOD[1]

    if label == PAVING_LABEL:
        row = hit.my // 9
        if hit.my % 9 == 0 or (hit.mx + 400 + (row % 2) * 6) % 12 == 0:
            return ROCK[1]
        return ROCK[3] if noise(row, (hit.mx + 400 + (row % 2) * 6) // 12, 8) > 0.6 else ROCK[2]

    return (255, 0, 255, 255)


SAME_MATERIAL = (
    {SMOKE_LABEL},
    {WOOD_LABEL, AWNING_LABEL},
    {PAVING_LABEL, BLOOD_LABEL},
    {FOOTING_LABEL, BLOOD_LABEL},
    {WALL_LABEL, CHIMNEY_LABEL},
    {QUOIN_LABEL, ROOF_LABEL},
    {SAUSAGE_LABEL, TWINE_LABEL},
    {MEAT_LABEL, FAT_LABEL},
)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    if label == other or any({label, other} <= group for group in SAME_MATERIAL):
        return None
    return INK


def footprint_shadow(x: float, y: float) -> float:
    """Distance outside the hall and the annex, in units of their margin: a rim around both, nothing on the empty
    bottom right cell."""
    x, y = x - SHADOW_OFFSET[0], y - SHADOW_OFFSET[1]

    def outside(box: tuple[int, int, int, int]) -> float:
        bx0, bx1, by0, by1 = box
        return max(bx0 - x, x - bx1, by0 - y, y - by1, 0)

    ax0, ax1, ay0, ay1 = ANNEX
    return min(outside(FOOTING) / 3, outside((ax0 - 2, ax1 + 2, ay0, ay1)) / 2.5, outside(YARD) / 1)


def main() -> None:
    grid = build_model()
    # shadow_radii is ignored, footprint_shadow gives the shape
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), SHADOW_JITTER, shadow_shape=footprint_shadow)
    # Hooks, handles and rack posts are thin: a 2px depth outline would turn them into ink bars
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
