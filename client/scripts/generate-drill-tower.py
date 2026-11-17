#!/usr/bin/env python3
"""Generates the drill tower pixel art.

Run from anywhere: python3 scripts/generate-drill-tower.py

Outputs public/resources/towers/drill-tower.png, a 196x196 front view. The drill tower is an L shaped three-cell
piece drawn over its 2x2 cell box, so each 98px quadrant of the image is one cell: the shed in the top left, the
tower rising through the top right, the tower base and the drill in the bottom right. The bottom left quadrant
is the empty cell and stays transparent.

The layout is set in screen space first, then the model is placed so the camera lands each part in its quadrant:
the shed stands far back, the tower stands on the front right cell and is tall enough to reach the top of the
image. A long plank shed with a pile of ore rocks in front, its roof running into a square stone tower with a
shingled pyramid roof. The tower stands on wooden stilts under a flared skirt; a shaft comes out from between
the stilts and ends in a big spiral drill bit pointing toward the bottom of the board. It is modeled as voxels
and rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "towers" / "drill-tower.png"
# One cell is CELL px: the image is the 2x2 cell box
CELL = 98
WIDTH = 2 * CELL
HEIGHT = 2 * CELL
# Screen row of the ground at model y 0; model x 0 is the column between the two cells
ORIGIN_Y = 150
HALF_X = CELL
HALF_Y = 160

# Shared ramps, from dark to light
STONE = [(72, 63, 97, 255), (67, 91, 125, 255), (68, 142, 159, 255), (90, 185, 187, 255), (143, 226, 185, 255)]
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
SHINGLE = [(72, 40, 52, 255), (110, 52, 58, 255), (150, 72, 64, 255), (190, 106, 78, 255)]
IRON = [(48, 44, 68, 255), (66, 64, 92, 255), (92, 94, 124, 255), (136, 142, 168, 255), (190, 196, 214, 255)]
# New ramp: brass bands and ore flecks, the darkest step leans toward violet
BRASS = [(110, 64, 52, 255), (170, 104, 30, 255), (214, 150, 40, 255), (240, 196, 70, 255), (250, 228, 130, 255)]
INTERIOR = STONE[0]

# Shed in the top left quadrant: its front wall stands on the row just above the empty bottom left cell, and it
# runs right behind the tower so its roof joins it
SHED = (-90, 26, 94, 140)  # x0, x1, y0, y1
FOOTING_HEIGHT = 3
SHED_WALL = 40
SHED_EAVE = 4
SHED_SLOPE = 0.9
SHED_DOOR = (-30, -12, 30)  # x0, x1, height
ROCKS = (  # x, y, z, radius, all on the footing in front of the shed
    (-78, 86, 3, 7),
    (-66, 85, 3, 8),
    (-54, 86, 3, 7),
    (-72, 89, 11, 6),
    (-60, 89, 11, 6),
)
FOOTING = (-94, 30, 80, 144)

# Tower on the front right cell, rising through the top right quadrant
TOWER = (24, 76, 10, 62)  # x0, x1, y0, y1 of the body
STILT_TOP = 24
STILT = 5
SKIRT = 3  # how far the skirt flares past the body
SKIRT_HEIGHT = 10
TOWER_TOP = 106
ROOF_EAVE = 6
ROOF_HEIGHT = 34
WINDOWS = ((44, 56, 80, 94), (44, 56, 46, 60))  # x0, x1, z0, z1

# Drill under the tower: a shaft along y from between the stilts, then the bit pointing at the camera
AXIS_X = 50
AXIS_Z = 15
SHAFT_RADIUS = 4
SHAFT_FRONT = -20
COLLAR = (-24, -20)
COLLAR_RADIUS = 11
DRILL_RADIUS = 17
DRILL_TIP = -70
GROOVE_PITCH = 10

# Light from above: the shadow rims the pieces evenly on both sides and drops a bit toward the camera
SHADOW_OFFSET = (0, -2)
SHADOW_MARGIN = 3
SHADOW_JITTER = 0.3

(
    FOOTING_LABEL,
    SHED_LABEL,
    SHED_ROOF_LABEL,
    DOOR_LABEL,
    ROCK_LABEL,
    ROCK_ALT_LABEL,
    TOWER_LABEL,
    TOWER_ROOF_LABEL,
    WINDOW_LABEL,
    SKIRT_LABEL,
    STILT_LABEL,
    SHAFT_LABEL,
    BAND_LABEL,
    DRILL_LABEL,
) = range(1, 15)
ROCK_LABELS = (ROCK_LABEL, ROCK_ALT_LABEL)


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


def build_model() -> VoxelGrid:
    grid = VoxelGrid(HALF_X, HALF_Y)
    build_shed(grid)
    build_tower(grid)
    build_drill(grid)
    return grid


def build_shed(grid: VoxelGrid) -> None:
    fx0, fx1, fy0, fy1 = FOOTING
    grid.box(fx0, fx1, fy0, fy1, 0, FOOTING_HEIGHT, FOOTING_LABEL)
    x0, x1, y0, y1 = SHED
    base = FOOTING_HEIGHT
    grid.box(x0, x1, y0, y1, base, base + SHED_WALL, SHED_LABEL)
    # Gable roof, ridge along x
    ridge = (y0 + y1) / 2
    half_depth = (y1 - y0) / 2 + SHED_EAVE
    for y in range(y0 - SHED_EAVE, y1 + SHED_EAVE):
        top = base + SHED_WALL + round(SHED_SLOPE * (half_depth - abs(y + 0.5 - ridge)))
        grid.box(x0 - SHED_EAVE, x1 + SHED_EAVE, y, y + 1, top - 3, top, SHED_ROOF_LABEL)
        if y0 <= y < y1:
            grid.box(x0, x1, y, y + 1, base + SHED_WALL, top - 3, SHED_LABEL)
    # Wide open doorway, carved a few voxels deep
    dx0, dx1, height = SHED_DOOR
    grid.box(dx0, dx1, y0, y0 + 6, base, base + height, EMPTY)
    grid.box(dx0, dx1, y0 + 6, y0 + 7, base, base + height, DOOR_LABEL)
    # Ore rocks piled in front of the shed
    for index, (rx, ry, rz, radius) in enumerate(ROCKS):
        for z in range(rz - radius, rz + radius + 1):
            for y in range(ry - radius, ry + radius + 1):
                for x in range(rx - radius - 2, rx + radius + 3):
                    # Squashed and lumpy so they read as rocks, not balls
                    lump = 1 + 0.18 * (noise(index, x // 3, y // 3, z // 3) - 0.5)
                    d = ((x + 0.5 - rx) / 1.15) ** 2 + (y + 0.5 - ry) ** 2 + ((z + 0.5 - rz) / 0.85) ** 2
                    if d <= (radius * lump) ** 2 and z >= FOOTING_HEIGHT:
                        grid.set(x, y, z, ROCK_LABELS[index % 2])


def build_tower(grid: VoxelGrid) -> None:
    x0, x1, y0, y1 = TOWER
    # Stilts at the corners, under the skirt
    for sx in (x0, x1 - STILT):
        for sy in (y0, y1 - STILT):
            grid.box(sx, sx + STILT, sy, sy + STILT, 0, STILT_TOP, STILT_LABEL)
    # Flared skirt: wider at the bottom, narrowing up to the body
    for dz in range(SKIRT_HEIGHT):
        flare = round(SKIRT * (1 - dz / SKIRT_HEIGHT))
        grid.box(x0 - flare, x1 + flare, y0 - flare, y1 + flare, STILT_TOP + dz, STILT_TOP + dz + 1, SKIRT_LABEL)
    grid.box(x0, x1, y0, y1, STILT_TOP + SKIRT_HEIGHT, TOWER_TOP, TOWER_LABEL)
    # Window slits, recessed in the front face
    for wx0, wx1, wz0, wz1 in WINDOWS:
        grid.box(wx0, wx1, y0, y0 + 3, wz0, wz1, EMPTY)
        grid.box(wx0, wx1, y0 + 3, y0 + 4, wz0, wz1, WINDOW_LABEL)
    # Pyramid roof overhanging the walls
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    half_x = (x1 - x0) / 2 + ROOF_EAVE
    half_y = (y1 - y0) / 2 + ROOF_EAVE
    for dz in range(ROOF_HEIGHT):
        shrink = 1 - dz / ROOF_HEIGHT
        hx, hy = half_x * shrink, half_y * shrink
        grid.box(
            math.floor(cx - hx), math.ceil(cx + hx), math.floor(cy - hy), math.ceil(cy + hy),
            TOWER_TOP - 4 + dz, TOWER_TOP - 3 + dz, TOWER_ROOF_LABEL,
        )


def build_drill(grid: VoxelGrid) -> None:
    for y in range(SHAFT_FRONT, TOWER[3] - STILT):
        disc(grid, y, SHAFT_RADIUS, SHAFT_LABEL)
    for y in range(*COLLAR):
        disc(grid, y, COLLAR_RADIUS, BAND_LABEL)
    # Drill bit: a cone narrowing to the tip
    for y in range(DRILL_TIP, COLLAR[0]):
        t = (y - DRILL_TIP) / (COLLAR[0] - DRILL_TIP)
        disc(grid, y, max(0.8, DRILL_RADIUS * t), DRILL_LABEL)


def disc(grid: VoxelGrid, y: int, radius: float, label: int) -> None:
    r = math.ceil(radius)
    for z in range(AXIS_Z - r, AXIS_Z + r + 1):
        for x in range(AXIS_X - r, AXIS_X + r + 1):
            if math.hypot(x + 0.5 - AXIS_X, z + 0.5 - AXIS_Z) <= radius:
                grid.set(x, y, z, label)


def face(hit: Hit) -> str:
    if hit.neighbor(0, 0, 1) == EMPTY:
        return "top"
    if hit.neighbor(0, -1, 0) == EMPTY:
        return "front"
    if hit.neighbor(-1, 0, 0) == EMPTY:
        return "left"
    return "right"


def cylinder_index(hit: Hit, base: int) -> int:
    """Light on a cylinder along y: lit on the upper left, darker over both edges."""
    angle = math.atan2(hit.z + 0.5 - AXIS_Z, hit.mx + 0.5 - AXIS_X)
    lit = math.cos(angle - math.radians(120))
    return base + (1 if lit > 0.55 else 0 if lit > -0.1 else -1 if lit > -0.6 else -2)


def shade(hit: Hit) -> tuple[int, int, int, int]:
    side = face(hit)

    if hit.label == FOOTING_LABEL:
        if side == "top":
            # Flag stones with mortar joints in the next lower step
            row = hit.my // 7
            if hit.my % 7 == 0 or (hit.mx + (row % 2) * 5) % 10 == 0:
                return STONE[0]
            return STONE[2] if noise(row, (hit.mx + (row % 2) * 5) // 10) > 0.7 else STONE[1]
        return STONE[0]

    if hit.label == SHED_LABEL:
        if side == "front":
            # Vertical planks with grain
            index = 1 if (hit.mx + 128) % 6 == 0 else 2
            if index == 2 and noise(hit.mx, hit.z // 5, 3) > 0.85:
                index = 3
            if hit.z >= FOOTING_HEIGHT + SHED_WALL - 5:
                # Contact shadow under the eave
                index -= 1
            return step(WOOD, index)
        return step(WOOD, 1 if side == "left" else 0 if hit.z % 6 == 0 else 1)

    if hit.label == DOOR_LABEL:
        return INTERIOR

    if hit.label == SHED_ROOF_LABEL:
        if hit.neighbor(0, 0, 1) != EMPTY and hit.neighbor(0, -1, 0) == EMPTY and hit.neighbor(0, 0, -1) == EMPTY:
            return SHINGLE[0]
        ridge = (SHED[2] + SHED[3]) // 2
        index = 3 if hit.my >= ridge - 2 else 2
        course = (hit.my - ridge) // 4
        if (hit.my - ridge) % 4 == 0 or (hit.mx + course * 5) % 10 == 0:
            index -= 1
        return step(SHINGLE, index)

    if hit.label in ROCK_LABELS:
        # Grey ore, lit on the upper left, with gold flecks
        light = hit.light(hit.normal())
        index = 3 if light > 0.6 else 2 if light > 0.2 else 1 if light > -0.2 else 0
        if noise(hit.mx // 2, hit.my // 2, hit.z // 2, 5) > 0.92:
            return step(BRASS, index + 1)
        return step(IRON, index)

    if hit.label == TOWER_LABEL:
        x1 = TOWER[1]
        if side == "front":
            base, u = 3, hit.mx
        else:
            base, u = (2 if side == "left" else 1), hit.my
        index = base
        # Darker toward the right edge of the front, contact shadow under the eave
        if side == "front" and hit.mx > x1 - 8:
            index -= 1
        if hit.z >= TOWER_TOP - 10:
            index -= 1
        row = hit.z // 5
        if hit.z % 5 == 0 or (u + (row % 2) * 4 + (3 if noise(row, 1) > 0.5 else 0)) % 9 == 0:
            index -= 1
        for wx0, wx1, wz0, wz1 in WINDOWS:
            if side == "front" and wx0 - 2 <= hit.mx < wx1 + 2 and wz0 - 2 <= hit.z < wz1 + 2:
                return WOOD[3] if hit.z >= wz1 else WOOD[1]
        return step(STONE, index)

    if hit.label == WINDOW_LABEL:
        top = next(wz1 for wx0, wx1, wz0, wz1 in WINDOWS if wz0 <= hit.z < wz1)
        return BRASS[3] if hit.z >= top - 5 else BRASS[2]

    if hit.label == SKIRT_LABEL:
        # Boards hanging under the body, lit on top
        if side == "top":
            return WOOD[3]
        if side == "front":
            return WOOD[1] if (hit.mx + 128) % 6 == 0 else WOOD[2]
        return WOOD[1] if side == "left" else WOOD[0]

    if hit.label == STILT_LABEL:
        if side == "front":
            return WOOD[2] if hit.neighbor(-1, 0, 0) == EMPTY else WOOD[1]
        return WOOD[2] if side == "left" else WOOD[0]

    if hit.label == TOWER_ROOF_LABEL:
        if hit.neighbor(0, 0, 1) != EMPTY and hit.neighbor(0, 0, -1) == EMPTY:
            return SHINGLE[0]
        cx = (TOWER[0] + TOWER[1]) / 2
        # The front slope is lit, the right slope shaded, with shingle courses
        right = hit.neighbor(1, 0, 0) == EMPTY and hit.neighbor(0, -1, 0) != EMPTY
        index = 1 if right else 3 if hit.mx < cx - 4 else 2
        if hit.z % 4 == 0 or (hit.mx + (hit.z // 4) * 5) % 9 == 0:
            index -= 1
        return step(SHINGLE, index)

    if hit.label == SHAFT_LABEL:
        return step(IRON, cylinder_index(hit, 2))

    if hit.label == BAND_LABEL:
        return step(BRASS, cylinder_index(hit, 3) if side != "front" else 2)

    if hit.label == DRILL_LABEL:
        index = cylinder_index(hit, 3)
        # Spiral groove: the angle around the axis plus the distance along it
        angle = math.atan2(hit.z + 0.5 - AXIS_Z, hit.mx + 0.5 - AXIS_X) / (2 * math.pi)
        if (angle + (hit.my - DRILL_TIP) / GROOVE_PITCH) % 1 < 0.22:
            index -= 2
        return step(IRON, index)

    return (255, 0, 255, 255)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    # A material switch always has ink between the two materials
    if label == other or {label, other} <= {SHED_LABEL, DOOR_LABEL}:
        return None
    return (22, 28, 46, 255)


def footprint_shadow(x: float, y: float) -> float:
    """Distance outside the shed footing and the tower skirt, in units of the margin, 1 or less inside the shadow.

    The drill up in the air casts none, and the shadow stays off the empty bottom left cell.
    """
    x, y = x - SHADOW_OFFSET[0], y - SHADOW_OFFSET[1]
    x0, x1, y0, y1 = TOWER
    boxes = (FOOTING, (x0 - SKIRT, x1 + SKIRT, y0 - SKIRT, y1 + SKIRT))
    distance = min(max(bx0 - x, x - bx1, by0 - y, y - by1, 0) for bx0, bx1, by0, by1 in boxes)
    return distance / SHADOW_MARGIN


def main() -> None:
    grid = build_model()
    # shadow_radii is ignored, footprint_shadow gives the shape
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), SHADOW_JITTER, shadow_shape=footprint_shadow)
    # The stilts and the shaft are thin: a 2px depth outline would swallow them
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
