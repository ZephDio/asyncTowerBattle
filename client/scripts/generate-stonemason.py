#!/usr/bin/env python3
"""Generates the Stonemason totem pixel art.

Run from anywhere: python3 scripts/generate-stonemason.py

Outputs public/resources/totem/stonemason.png, a front view cropped to the art. The Stonemason is a vertical
two-cell piece (1 wide, 2 tall), so the model is deeper than a square one, like the Red Obelisk.

A mountain temple carved into a natural crag on a rough rock slab with three steps. The front cell holds an arched
doorway with a carving station: a stone block with a mallet and a chisel on it. Two big stone shields with bronze
rims hang on the shoulders of the crag, and a dwarf statue with a horned helmet and a hammer stands on its crown.
Moss grows on the ledges. It is modeled as voxels and rendered by voxel_sprite.py.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "stonemason.png"
WIDTH = 102
HEIGHT = 188
ORIGIN_Y = 108
HALF_Y = 112

# Grey granite for the crag, sandstone for the carved work (statue, shields, block), as on the Bosquet
GRANITE = [(58, 54, 72, 255), (88, 86, 102, 255), (124, 122, 134, 255), (164, 162, 166, 255), (204, 202, 194, 255)]
SANDSTONE = [(76, 64, 74, 255), (114, 100, 100, 255), (156, 142, 130, 255), (196, 184, 162, 255), (228, 220, 194, 255)]
MOSS = [(38, 58, 72, 255), (44, 94, 78, 255), (70, 136, 70, 255), (120, 178, 80, 255)]
BRONZE = [(94, 65, 69, 255), (166, 116, 80, 255), (226, 179, 110, 255)]
IRON = [(56, 58, 78, 255), (96, 100, 120, 255), (150, 156, 168, 255)]
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
INTERIOR = [(34, 30, 50, 255), (50, 44, 68, 255), (70, 62, 86, 255)]

# Rock slab and steps
SLAB_HALF_X = 43
SLAB_FRONT = -84
SLAB_BACK = 36
SLAB_HEIGHT = 12
STEPS = 3
STEP_DEPTH = 7

# Crag: its front face leans back above the doorway, its crown is flat under the statue and slopes to the shoulders
CRAG_HALF_X = 42
CRAG_BACK = 34
CRAG_FRONT_LOW = -30
CRAG_FRONT_HIGH = -14
LEAN_FROM, LEAN_TO = 70, 100
CROWN = 93
CROWN_HALF = 15
SHOULDER_SLOPE = 0.75
# The top slopes down toward the back so the camera sees the face more than the top
TOP_BACK_SLOPE = 0.35

# Doorway
ARCH_HALF = 19
ARCH_SPRING = 42  # z where the round top starts
ARCH_DEPTH = 22

# Carving station in the doorway
BLOCK = (-21, 21, -74, -50, SLAB_HEIGHT, SLAB_HEIGHT + 15)

# Shields on the shoulders: center x, z, and how far they turn outward
SHIELD_X = 33
SHIELD_Z = 80
SHIELD_HALF_W = 14
SHIELD_HALF_H = 21
SHIELD_TURN = 14

# Statue on the crown
STATUE_Y = -4
STATUE_SCALE = 1.7

(
    ROCK_LABEL,
    SLAB_LABEL,
    BLOCK_LABEL,
    SHIELD_LABEL,
    RIM_LABEL,
    STATUE_LABEL,
    BEARD_LABEL,
    HORN_LABEL,
    WOOD_LABEL,
    IRON_LABEL,
    MOSS_LABEL,
    EMBLEM_LABEL,
    EYE_LABEL,
    WORK_LABEL,
    ROUGH_LABEL,
    HEAD_LABEL,
    CHIP_LABEL,
) = range(1, 18)


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def smooth_noise(u: float, v: float, seed: int) -> float:
    """Value noise in 0..1, smoothly interpolated between integer lattice points."""
    iu, iv = math.floor(u), math.floor(v)
    fu, fv = u - iu, v - iv
    fu, fv = fu * fu * (3 - 2 * fu), fv * fv * (3 - 2 * fv)
    a, b = noise(iu, iv, seed), noise(iu + 1, iv, seed)
    c, d = noise(iu, iv + 1, seed), noise(iu + 1, iv + 1, seed)
    return a + (b - a) * fu + (c - a) * fv + (a - b - c + d) * fu * fv


def crag_front(z: float) -> float:
    t = max(0.0, min(1.0, (z - LEAN_FROM) / (LEAN_TO - LEAN_FROM)))
    return CRAG_FRONT_LOW + (CRAG_FRONT_HIGH - CRAG_FRONT_LOW) * t * t


def crag_top(x: float, y: float) -> float:
    back = max(0.0, y - STATUE_Y - 12) * TOP_BACK_SLOPE
    return min(CROWN, CROWN + (CROWN_HALF - abs(x)) * SHOULDER_SLOPE) - back


def arch_top(x: float) -> float:
    return ARCH_SPRING + math.sqrt(max(0.0, ARCH_HALF * ARCH_HALF - x * x))


def in_doorway(x: float, y: float, z: float) -> bool:
    return abs(x + 0.5) < ARCH_HALF and z < arch_top(x + 0.5) and y < CRAG_FRONT_LOW + ARCH_DEPTH


def build_model() -> VoxelGrid:
    grid = VoxelGrid(half_y=HALF_Y)
    build_slab(grid)
    build_crag(grid)
    build_station(grid)
    for side in (-1, 1):
        build_shield(grid, side)
    build_statue(grid)
    return grid


def build_slab(grid: VoxelGrid) -> None:
    for y in range(SLAB_FRONT, SLAB_BACK):
        for x in range(-SLAB_HALF_X - 2, SLAB_HALF_X + 2):
            # Rough natural edge
            reach = SLAB_HALF_X - 3 + 5 * smooth_noise(y / 7, 0, 1)
            if abs(x + 0.5) < reach:
                height = SLAB_HEIGHT - (1 if noise(x // 5, y // 5, 2) > 0.8 else 0)
                grid.box(x, x + 1, y, y + 1, 0, height, SLAB_LABEL)
    for i in range(STEPS):
        y0 = SLAB_FRONT - (STEPS - i) * STEP_DEPTH
        half = 36 - 2 * (STEPS - i)
        for x in range(-half - 3, half + 3):
            if abs(x + 0.5) < half + 3 * smooth_noise(x / 5, i, 3):
                grid.box(x, x + 1, y0, SLAB_FRONT, 0, round((i + 1) * SLAB_HEIGHT / (STEPS + 1)) + 1, SLAB_LABEL)


def build_crag(grid: VoxelGrid) -> None:
    for z in range(SLAB_HEIGHT - 1, CROWN + 4):
        front = crag_front(z)
        for y in range(round(front) - 6, CRAG_BACK + 1):
            for x in range(-CRAG_HALF_X - 6, CRAG_HALF_X + 6):
                fx = x + 0.5
                # Lumpy rock: the faces bulge in and out with low frequency noise
                bump_front = 5 * smooth_noise(fx / 8, z / 7, 4) - 2.5
                bump_side = 6 * smooth_noise(y / 9, z / 8, 5 if x < 0 else 6) - 3
                bump_top = 5 * smooth_noise(fx / 6, y / 8, 7) - 2
                if y < front - bump_front:
                    continue
                # Rounded corners in plan
                half = CRAG_HALF_X + bump_side
                corner = 12
                dx = abs(fx) - (half - corner)
                dy = (front - bump_front + corner) - y
                if dx > 0 and dy > 0 and math.hypot(dx, dy) > corner:
                    continue
                if abs(fx) > half:
                    continue
                if z > crag_top(fx, y) + bump_top:
                    continue
                if in_doorway(fx, y, z):
                    continue
                grid.set(x, y, z, ROCK_LABEL)
    # Moss on top faces of the ledges
    for y in range(-HALF_Y, HALF_Y):
        for x in range(-CRAG_HALF_X - 6, CRAG_HALF_X + 6):
            if smooth_noise(x / 5, y / 5, 8) < 0.68:
                continue
            for z in range(CROWN + 6, SLAB_HEIGHT, -1):
                if grid.get(x, y, z) == ROCK_LABEL:
                    if grid.get(x, y, z + 1) == EMPTY:
                        grid.set(x, y, z, MOSS_LABEL)
                        if noise(x, y, 9) > 0.7:
                            grid.set(x, y, z + 1, MOSS_LABEL)
                    break


def build_station(grid: VoxelGrid) -> None:
    x0, x1, y0, y1, z0, z1 = BLOCK
    # Stone workbench: a thick top over a narrower base, the top's front corner chipped
    grid.box(x0 + 3, x1 - 3, y0 + 3, y1 - 2, z0, z1 - 4, BLOCK_LABEL)
    grid.box(x0, x1, y0, y1, z1 - 4, z1, BLOCK_LABEL)
    grid.box(x1 - 4, x1, y0, y0 + 3, z1 - 3, z1, EMPTY)
    # Unfinished stone shield propped up on the back of the bench, facing the camera.
    # Its left half is dressed and carved with the mountain chevron, its right half still rough
    sx, sy = -6, -58
    for v in range(-11, 7):
        for u in range(-9, 10):
            k = kite_small(u, v)
            if k > 1:
                continue
            rough = u > 1 and noise(u, v, 21) > 0.4
            chevron = -9 < v < -1 and u <= 1 and abs(abs(u) - (-v - 1) * 0.8) < 1.2
            depth = 3 if rough else 2
            for t in range(depth):
                y = sy - t + (1 if chevron and t == depth - 1 else 0)
                label = ROUGH_LABEL if rough else (EMBLEM_LABEL if chevron else WORK_LABEL)
                grid.set(sx + u, y + depth - 1, z1 + v + 11, label)
    # Mallet on the right: handle toward the camera, a barrel head bound with iron
    grid.box(12, 15, -73, -59, z1, z1 + 3, WOOD_LABEL)
    for y in range(-59, -50):
        for x in range(8, 20):
            for z in range(z1, z1 + 9):
                if math.hypot(x + 0.5 - 13.5, z + 0.5 - z1 - 4.5) <= 4.6:
                    band = y in (-58, -52)
                    grid.set(x, y, z, IRON_LABEL if band else HEAD_LABEL)
    # Flat chisel and a point chisel in front of the shield: iron blades, wooden grips
    grid.box(-19, -12, -71, -68, z1, z1 + 2, IRON_LABEL)
    grid.box(-12, -2, -72, -67, z1, z1 + 3, WOOD_LABEL)
    grid.box(1, 7, -73, -71, z1, z1 + 2, IRON_LABEL)
    grid.box(7, 10, -74, -70, z1, z1 + 3, WOOD_LABEL)
    # Chips on the bench and at its foot
    for cx, cy, cz in ((-16, -54, z1), (5, -66, z1), (-25, -76, SLAB_HEIGHT), (23, -72, SLAB_HEIGHT),
                       (26, -66, SLAB_HEIGHT), (-24, -60, SLAB_HEIGHT), (15, -80, SLAB_HEIGHT)):
        grid.box(cx, cx + 2, cy, cy + 2, cz, cz + 2, CHIP_LABEL)


def kite_small(u: float, v: float) -> float:
    """The bench shield's outline, point down. Returns <= 1 inside."""
    if v >= 0:
        return max(abs(u) / 9, ((abs(u) / 9) ** 4 + (v / 6) ** 4) ** 0.25)
    t = -v / 11
    return 2.0 if t >= 1 else abs(u) / max(9 * (1 - t ** 1.7), 0.01)


def kite(u: float, v: float) -> float:
    """Kite shield outline: rounded top, sides narrowing to a point below. Returns <= 1 inside."""
    if v > 0:
        return max(abs(u) / SHIELD_HALF_W, (abs(u) ** 4 / SHIELD_HALF_W ** 4 + (v / (SHIELD_HALF_H * 0.45)) ** 4) ** 0.25)
    t = -v / SHIELD_HALF_H
    if t >= 1:
        return 2.0
    width = SHIELD_HALF_W * (1 - t ** 1.7)
    return abs(u) / max(width, 0.01)


def build_shield(grid: VoxelGrid, side: int) -> None:
    turn = math.radians(SHIELD_TURN * side)
    ux, uy = math.cos(turn), math.sin(turn)
    nx, ny = uy, -ux  # facing the camera, turned outward
    cx = SHIELD_X * side
    cz = SHIELD_Z
    cy = crag_front(cz) - 7
    for v in range(-SHIELD_HALF_H - 1, round(SHIELD_HALF_H * 0.45) + 2):
        for u in range(-SHIELD_HALF_W - 1, SHIELD_HALF_W + 2):
            k = kite(u, v)
            if k > 1:
                continue
            rim = k > 0.78
            boss = math.hypot(u, v - 1) < 3.5
            # A mountain chevron carved below the boss
            chevron = -15 < v < -4 and abs(abs(u) - (-v - 4) * 0.9) < 1.6
            thickness = 5 if rim or boss else 3 if chevron else 4
            for t in range(thickness):
                for sub in (0.0, 0.5):
                    x = cx + (u + sub) * ux + (t - 3) * nx
                    y = cy + (u + sub) * uy + (t - 3) * ny
                    label = (RIM_LABEL if rim or (boss and t == thickness - 1)
                             else EMBLEM_LABEL if chevron and t == thickness - 1 else SHIELD_LABEL)
                    grid.set(math.floor(x), math.floor(y), cz + v, label)


def ellipsoid(grid: VoxelGrid, cx: float, cy: float, cz: float, rx: float, ry: float, rz: float, label: int) -> None:
    for z in range(math.floor(cz - rz), math.ceil(cz + rz) + 1):
        for y in range(math.floor(cy - ry), math.ceil(cy + ry) + 1):
            for x in range(math.floor(cx - rx), math.ceil(cx + rx) + 1):
                if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 + ((z + 0.5 - cz) / rz) ** 2 <= 1:
                    grid.set(x, y, z, label)


def build_statue(grid: VoxelGrid) -> None:
    k = STATUE_SCALE
    sy = STATUE_Y
    base = CROWN - 1
    grid.box(-12, 12, sy - 9, sy + 9, base, base + 3, ROCK_LABEL)
    z = base + 3
    # Boots and stout body
    for bx in (-7, 2):
        grid.box(bx, bx + 6, sy - 6, sy + 4, z, z + round(4 * k), STATUE_LABEL)
    ellipsoid(grid, 0, sy, z + 11 * k, 8.5 * k, 6 * k, 8 * k, STATUE_LABEL)
    head_z = z + 21 * k
    ellipsoid(grid, 0, sy - 1, head_z, 5.5 * k, 5 * k, 5 * k, STATUE_LABEL)
    # Big beard down the chest, toward the camera
    top, bottom = round(head_z - 4), round(z + 7 * k)
    for zz in range(bottom, top):
        t = (top - zz) / (top - bottom)
        half = (5.5 - 2.5 * t) * k
        for x in range(-10, 10):
            if abs(x + 0.5) < half:
                front = round(sy - 6 * k - 1 + t * 2)
                grid.box(x, x + 1, front, sy - 2, zz, zz + 1, BEARD_LABEL)
    # Helmet dome with a bronze brim, horns curving out and up
    ellipsoid(grid, 0, sy - 1, head_z + 2.5 * k, 5.8 * k, 5.2 * k, 3.2 * k, IRON_LABEL)
    brim = round(head_z + 1)
    for y in range(sy - 12, sy + 8):
        for x in range(-11, 11):
            if ((x + 0.5) / (6.2 * k)) ** 2 + ((y + 0.5 - sy + 1) / (5.3 * k)) ** 2 <= 1:
                grid.box(x, x + 1, y, y + 1, brim, brim + 2, RIM_LABEL)
    # Deep set eyes and a big nose between the brim and the beard
    face = sy - round(5 * k) - 2
    for ex in (-5, 2):
        for y in range(face - 2, face + 4):
            for x in range(ex, ex + 3):
                for zz in (brim - 5, brim - 4, brim - 3):
                    if grid.get(x, y, zz) == STATUE_LABEL:
                        grid.set(x, y, zz, EYE_LABEL)
    grid.box(-1, 2, face - 3, face + 2, brim - 8, brim - 3, STATUE_LABEL)
    for side in (-1, 1):
        for i in range(12):
            hx = side * (5.5 + i * 0.75) * k
            hz = head_z + 2 * k + (i * i * 0.045 + i * 0.1) * k
            r = (2.1 - i * 0.13) * k
            ellipsoid(grid, hx, sy - 1, hz, r, r, r, HORN_LABEL)
    # Hammer upright at its right side, an arm resting on it
    hx = round(11 * k)
    grid.box(hx, hx + 3, sy - 4, sy - 1, z, round(z + 20 * k), WOOD_LABEL)
    grid.box(hx - 4, hx + 7, sy - 7, sy + 2, round(z + 17 * k), round(z + 24 * k), IRON_LABEL)
    ellipsoid(grid, 8.5 * k, sy - 2, z + 14 * k, 3 * k, 3 * k, 3 * k, STATUE_LABEL)


def step(ramp: list[tuple[int, int, int, int]], index: int) -> tuple[int, int, int, int]:
    return ramp[max(0, min(len(ramp) - 1, index))]


def lit(hit: Hit, levels: tuple[float, float, float] = (0.7, 0.35, 0.0)) -> int:
    light = hit.light(hit.normal())
    return 4 if light > levels[0] else 3 if light > levels[1] else 2 if light > levels[2] else 1


def in_doorway_shade(hit: Hit) -> bool:
    return abs(hit.mx + 0.5) < ARCH_HALF + 1 and hit.z < arch_top(hit.mx + 0.5) + 1 and \
        hit.my < CRAG_FRONT_LOW + ARCH_DEPTH + 1 and hit.my > CRAG_FRONT_LOW + 1


def shade(hit: Hit) -> tuple[int, int, int, int]:
    if hit.label == ROCK_LABEL:
        if in_doorway_shade(hit):
            # Dark recess, darkest under the vault
            depth = arch_top(hit.mx + 0.5) - hit.z
            return INTERIOR[0] if depth < 8 else INTERIOR[1] if depth < 22 or abs(hit.mx) > 11 else INTERIOR[2]
        index = lit(hit)
        # Strata: ragged horizontal seams one step lower
        if (hit.z + round(3 * smooth_noise(hit.mx / 6, 0, 10))) % 11 == 0 and index > 1:
            index -= 1
        elif noise(hit.mx // 3, hit.z // 2, 11) > 0.93:
            index += 1
        # Contact shadow on the face just above the slab and around the arch
        if hit.z < SLAB_HEIGHT + 3 and index > 1:
            index -= 1
        return step(GRANITE, index)
    if hit.label == SLAB_LABEL:
        if hit.neighbor(0, 0, 1) == EMPTY and hit.my < SLAB_FRONT and hit.neighbor(0, -1, 0) == EMPTY:
            return GRANITE[4]  # lit nosing of each step
        if hit.neighbor(0, 0, 1) == EMPTY:
            value = 3 if noise(hit.mx // 6, hit.my // 4, 12) > 0.3 else 2
            if (hit.mx + 3 * (hit.my // 8)) % 13 == 0:
                value = 2
            return step(GRANITE, value)
        if hit.neighbor(0, -1, 0) == EMPTY:
            return step(GRANITE, 1 if hit.my < SLAB_FRONT + 1 else 2)
        return step(GRANITE, 1)
    if hit.label == MOSS_LABEL:
        index = lit(hit, (0.7, 0.4, 0.1))
        if noise(hit.mx, hit.my, 13) > 0.8:
            index -= 1
        return step(MOSS, index - 1)
    if hit.label == BLOCK_LABEL:
        # Dark granite bench, so the sandstone work on it stands out
        if hit.neighbor(0, 0, 1) == EMPTY:
            return GRANITE[3] if hit.neighbor(0, -1, 0) == EMPTY or hit.neighbor(-1, 0, 0) == EMPTY else GRANITE[2]
        if hit.z < BLOCK[5] - 4:
            return GRANITE[0]
        return GRANITE[1] if hit.neighbor(-1, 0, 0) != EMPTY else GRANITE[2]
    if hit.label in (STATUE_LABEL, BEARD_LABEL, SHIELD_LABEL):
        index = lit(hit)
        if hit.label == BEARD_LABEL:
            index = max(index, 3) + (1 if hit.mx < 0 else 0) - (1 if hit.mx % 4 == 0 else 0)
        elif hit.label == STATUE_LABEL:
            index = min(index, 3)
        if hit.label == SHIELD_LABEL:
            index = max(index, 2)
        return step(SANDSTONE, index)
    if hit.label == WORK_LABEL:
        # The carved face: smooth and light, rim lit on top
        if hit.neighbor(0, 0, 1) == EMPTY or hit.neighbor(-1, 0, 0) == EMPTY:
            return SANDSTONE[4]
        return SANDSTONE[3]
    if hit.label == ROUGH_LABEL:
        return SANDSTONE[3 if noise(hit.mx, hit.my, 22) > 0.5 else 2] if hit.neighbor(0, 0, 1) == EMPTY else SANDSTONE[1]
    if hit.label == HEAD_LABEL:
        light = hit.light(hit.normal())
        return WOOD[3] if light > 0.6 else WOOD[2] if light > 0.2 else WOOD[1]
    if hit.label == CHIP_LABEL:
        return SANDSTONE[4] if hit.neighbor(0, 0, 1) == EMPTY else SANDSTONE[2]
    if hit.label == EYE_LABEL:
        return INTERIOR[0]
    if hit.label == EMBLEM_LABEL:
        return SANDSTONE[1]
    if hit.label == RIM_LABEL:
        return step(BRONZE, min(2, lit(hit) - 1))
    if hit.label == HORN_LABEL:
        return step(SANDSTONE, 4 if hit.light(hit.normal()) > 0.3 else 3)
    if hit.label == IRON_LABEL:
        light = hit.light(hit.normal())
        if hit.neighbor(0, 0, 1) == EMPTY and hit.neighbor(-1, 0, 0) == EMPTY and light > 0.6:
            return (198, 204, 210, 255)
        return step(IRON, 2 if light > 0.55 else 1 if light > 0.1 else 0)
    if hit.label == WOOD_LABEL:
        if hit.neighbor(0, 0, 1) == EMPTY:
            return WOOD[3]
        return WOOD[2] if hit.neighbor(-1, 0, 0) == EMPTY or hit.neighbor(0, -1, 0) == EMPTY else WOOD[1]
    return (255, 0, 255, 255)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    natural = {ROCK_LABEL, SLAB_LABEL, MOSS_LABEL}
    if label == other or {label, other} <= natural:
        return None
    if {label, other} <= {STATUE_LABEL, EYE_LABEL}:
        return None
    if {label, other} <= {SHIELD_LABEL, RIM_LABEL, EMBLEM_LABEL} or {label, other} <= {WORK_LABEL, ROUGH_LABEL}:
        return None
    return (22, 28, 46, 255)


def footprint_shadow(x: float, y: float) -> float:
    """Distance outside the slab and steps, in units of the margin, 1 or less inside the shadow."""
    y += 2
    boxes = (
        (-SLAB_HALF_X, SLAB_HALF_X, SLAB_FRONT, SLAB_BACK),
        (-36, 36, SLAB_FRONT - STEPS * STEP_DEPTH, SLAB_FRONT),
    )
    distance = min(max(x0 - x, x - x1, y0 - y, y - y1, 0) for x0, x1, y0, y1 in boxes)
    return distance / 3


def main() -> None:
    grid = build_model()
    # shadow_radii is ignored, footprint_shadow gives the shape
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), 0.3, shadow_shape=footprint_shadow)
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
