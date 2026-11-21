#!/usr/bin/env python3
"""Generates the Bakery ("Bakery Wryy") totem pixel art.

Run from anywhere: python3 client/scripts/generate-bakery.py

Outputs public/resources/totem/bakery.png, an 88x118 one-cell front view. The roof
reaches into the cell above.

A gingerbread cottage: chocolate walls studded with sprinkles, pink icing licking up from the base and framing
a round wooden door on the right, a glowing window on the left with a lattice cherry pie cooling on its sill, and a steep gable roof of scalloped tiles baked dark along the ridge
and pale toward the eaves. A big croissant sits on the front of the ridge, above a golden sign crossed by two
baguettes. It is modeled as voxels and rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "bakery.png"
WIDTH = 88
# The tall roof reaches into the cell above. Images are drawn centered, so the canvas keeps the earlier ground
# anchor (ORIGIN_Y - HEIGHT / 2 = 25) with transparent padding at the bottom, and the house stays on its cell.
HEIGHT = 118
ORIGIN_Y = 84

INK = (22, 28, 46, 255)
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
# New ramps: the darkest step leans toward violet, lighter steps get warmer
CHOCOLATE = [(62, 42, 62, 255), (98, 60, 60, 255), (136, 84, 64, 255), (170, 112, 78, 255)]
CRUST = [(84, 50, 60, 255), (132, 70, 52, 255), (182, 104, 60, 255), (222, 152, 92, 255), (244, 204, 146, 255),
         (250, 236, 206, 255)]
BREAD = [(110, 62, 56, 255), (170, 98, 54, 255), (214, 144, 66, 255), (240, 190, 100, 255), (250, 228, 156, 255)]
ICING = [(140, 64, 96, 255), (206, 104, 128, 255), (240, 158, 162, 255), (252, 214, 204, 255)]
CHERRY = [(90, 30, 56, 255), (156, 40, 62, 255), (210, 66, 70, 255), (240, 128, 108, 255)]
GLASS = [(67, 91, 125, 255), (68, 142, 159, 255), (90, 185, 187, 255)]
GOLD = [(150, 96, 52, 255), (218, 162, 60, 255), (246, 212, 96, 255), (252, 242, 172, 255)]
SPRINKLES = [(218, 181, 112, 255), (240, 158, 162, 255)]

# Walls
HOUSE_HALF_X = 32
HOUSE_FRONT = -22
HOUSE_BACK = 24
WALL_TOP = 32
# Steep gable roof, ridge along y, overhanging the walls
EAVE_HALF_X = 41
EAVE_Z = 28
ROOF_SLOPE = 1.25
ROOF_FRONT = -27
ROOF_BACK = 29
ROOF_THICKNESS = 5
# Fish-scale tiles laid in courses that read level on screen, like the original painting
TILE_ROW = 6  # screen pixels
TILE_WIDTH = 9
# Round door framed with icing
# Round door on the right, framed with icing
DOOR_X = 16
DOOR_HALF = 8
DOOR_SPRING = 13  # height where the round top starts
DIAMOND_Z = 16
DIAMOND_HALF = 3.5
# Window on the left with a pie cooling on its sill
WINDOW_X = -16
WINDOW_HALF = 11
WINDOW_Z = (15, 31)
SILL_Z = 12
SILL_DEPTH = 15
PIE_RADIUS = 9
PIE_HEIGHT = 4
# Golden sign on the gable and the bread on it
SIGN_Z = 47
SIGN_RADIUS = 9
BAGUETTE_LENGTH = 12  # half length
BAGUETTE_RADIUS = 1.9
BAGUETTE_ANGLE = 35
# A U, horns up, sitting on the front of the ridge
CROISSANT_Z = 90
CROISSANT_RADIUS = 15
CROISSANT_TUBE = 7
CROISSANT_SQUASH = 0.8
CROISSANT_START = 155  # degrees, the left horn
CROISSANT_SPAN = 230
CROISSANT_SEGMENTS = 7

SHADOW_MARGIN = 4
SHADOW_OFFSET = (0, -3)

(
    CHOCOLATE_LABEL,
    ICING_LABEL,
    ROOF_LABEL,
    WOOD_LABEL,
    DOOR_LABEL,
    WINDOW_LABEL,
    SIGN_LABEL,
    BAGUETTE_LABEL,
    CROISSANT_LABEL,
    KNOB_LABEL,
    RIDGE_LABEL,
    PANE_LABEL,
    PIE_CRUST_LABEL,
    PIE_FILLING_LABEL,
) = range(1, 15)


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def roof_height(x: float) -> float:
    return EAVE_Z + (EAVE_HALF_X - abs(x)) * ROOF_SLOPE


def door_top(x: float) -> float:
    """Top of the door at x, measured from the door's center."""
    if abs(x) >= DOOR_HALF:
        return -1
    return DOOR_SPRING + math.sqrt(DOOR_HALF**2 - x * x)


def icing_height(along: float) -> float:
    """Licks of icing rising from the base, like the original's frosting flames."""
    t = (along % 9) / 9
    tongue = 1 - abs(t * 2 - 1)
    return 3 + 7 * tongue**2 + 2 * noise(int(along // 9), 3)


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    build_walls(grid)
    build_roof(grid)
    build_sign(grid)
    build_croissant(grid)
    return grid


def build_walls(grid: VoxelGrid) -> None:
    grid.box(-HOUSE_HALF_X, HOUSE_HALF_X, HOUSE_FRONT, HOUSE_BACK, 0, WALL_TOP, CHOCOLATE_LABEL)
    # Icing licks: a 1 voxel coat over the front and the sides
    for x in range(-HOUSE_HALF_X - 1, HOUSE_HALF_X + 1):
        for z in range(0, round(icing_height(x + 40))):
            grid.set(x, HOUSE_FRONT - 1, z, ICING_LABEL)
    for y in range(HOUSE_FRONT - 1, HOUSE_BACK):
        for sign in (-1, 1):
            x = HOUSE_HALF_X if sign > 0 else -HOUSE_HALF_X - 1
            for z in range(0, round(icing_height(y + 7))):
                grid.set(x, y, z, ICING_LABEL)
    # Round door, recessed, in an icing frame
    for z in range(0, DOOR_SPRING + DOOR_HALF + 4):
        for x in range(DOOR_X - DOOR_HALF - 4, DOOR_X + DOOR_HALF + 4):
            cx = x + 0.5 - DOOR_X
            inner = door_top(cx)
            frame = DOOR_SPRING + math.sqrt(max(0, (DOOR_HALF + 3) ** 2 - cx * cx))
            if z < inner:
                grid.box(x, x + 1, HOUSE_FRONT - 1, HOUSE_FRONT + 2, z, z + 1, EMPTY)
                grid.set(x, HOUSE_FRONT + 2, z, DOOR_LABEL)
                if abs(cx) + abs(z + 0.5 - DIAMOND_Z) <= DIAMOND_HALF:
                    grid.set(x, HOUSE_FRONT + 2, z, WINDOW_LABEL)
            elif z < frame and abs(cx) < DOOR_HALF + 3:
                grid.box(x, x + 1, HOUSE_FRONT - 2, HOUSE_FRONT, z, z + 1, ICING_LABEL)
    grid.box(DOOR_X - 6, DOOR_X - 4, HOUSE_FRONT + 1, HOUSE_FRONT + 2, 8, 10, KNOB_LABEL)
    build_window(grid)


def build_window(grid: VoxelGrid) -> None:
    x0, x1 = WINDOW_X - WINDOW_HALF, WINDOW_X + WINDOW_HALF
    z0, z1 = WINDOW_Z
    # Wooden frame standing out of the wall, a recessed glowing pane, a cross of mullions
    grid.box(x0 - 2, x1 + 2, HOUSE_FRONT - 1, HOUSE_FRONT, z0 - 2, z1 + 2, WOOD_LABEL)
    grid.box(x0, x1, HOUSE_FRONT - 1, HOUSE_FRONT + 1, z0, z1, EMPTY)
    grid.box(x0, x1, HOUSE_FRONT + 1, HOUSE_FRONT + 2, z0, z1, PANE_LABEL)
    grid.box(WINDOW_X - 1, WINDOW_X + 1, HOUSE_FRONT, HOUSE_FRONT + 1, z0, z1, WOOD_LABEL)
    grid.box(x0, x1, HOUSE_FRONT, HOUSE_FRONT + 1, (z0 + z1) // 2, (z0 + z1) // 2 + 2, WOOD_LABEL)
    # Sill sticking out toward the camera
    grid.box(x0 - 3, x1 + 3, HOUSE_FRONT - SILL_DEPTH + 3, HOUSE_FRONT, SILL_Z, z0 - 1, WOOD_LABEL)
    # The pie: a crust dish, a cherry filling and a raised crust rim
    cy = HOUSE_FRONT - SILL_DEPTH / 2 + 1
    base = z0 - 1
    for z in range(base, base + PIE_HEIGHT):
        for y in range(math.floor(cy - PIE_RADIUS) - 1, math.ceil(cy + PIE_RADIUS) + 1):
            for x in range(math.floor(WINDOW_X - PIE_RADIUS) - 1, math.ceil(WINDOW_X + PIE_RADIUS) + 1):
                d = math.hypot(x + 0.5 - WINDOW_X, y + 0.5 - cy)
                # The dish flares out from its foot
                if d > PIE_RADIUS - (1 if z == base else 0):
                    continue
                top = z == base + PIE_HEIGHT - 1
                filling = top and d < PIE_RADIUS - 1.5
                grid.set(x, y, z, PIE_FILLING_LABEL if filling else PIE_CRUST_LABEL)


def build_roof(grid: VoxelGrid) -> None:
    for x in range(-EAVE_HALF_X, EAVE_HALF_X):
        cx = x + 0.5
        top = roof_height(cx)
        for y in range(ROOF_FRONT, ROOF_BACK):
            bottom = top - ROOF_THICKNESS
            # The eave hangs in scallops, one per tile
            if abs(cx) > EAVE_HALF_X - 3:
                f = ((y + 64) % TILE_WIDTH + 0.5) / TILE_WIDTH - 0.5
                bottom -= round(2.5 * (1 - 4 * f * f))
            grid.box(x, x + 1, y, y + 1, round(bottom), round(top) + 1, ROOF_LABEL)
        # Gable wall under the roof
        if abs(cx) < HOUSE_HALF_X:
            for z in range(WALL_TOP, round(top) - ROOF_THICKNESS + 1):
                grid.box(x, x + 1, HOUSE_FRONT, HOUSE_BACK, z, z + 1, CHOCOLATE_LABEL)
        # Barge boards under the front edge of the roof
        if abs(cx) > 3:
            grid.box(x, x + 1, ROOF_FRONT - 1, ROOF_FRONT + 3, round(top) - ROOF_THICKNESS - 3,
                     round(top) - ROOF_THICKNESS + 2, WOOD_LABEL)
    # Ridge cap
    apex = roof_height(0)
    grid.box(-3, 3, ROOF_FRONT - 1, ROOF_BACK, round(apex) - 2, round(apex) + 2, RIDGE_LABEL)


def build_sign(grid: VoxelGrid) -> None:
    for z in range(SIGN_Z - SIGN_RADIUS - 1, SIGN_Z + SIGN_RADIUS + 1):
        for x in range(-SIGN_RADIUS - 1, SIGN_RADIUS + 1):
            if math.hypot(x + 0.5, z + 0.5 - SIGN_Z) <= SIGN_RADIUS:
                grid.box(x, x + 1, HOUSE_FRONT - 2, HOUSE_FRONT, z, z + 1, SIGN_LABEL)
    # Two baguettes crossed in front of the sign
    for sign in (-1, 1):
        angle = math.radians(BAGUETTE_ANGLE) * sign
        dx, dz = math.cos(angle), math.sin(angle)
        y_center = HOUSE_FRONT - 4 + (sign + 1) / 2  # the right one lies over the left one
        for step in range(-BAGUETTE_LENGTH * 4, BAGUETTE_LENGTH * 4 + 1):
            t = step / 4
            radius = BAGUETTE_RADIUS * math.sqrt(max(0.15, 1 - (t / BAGUETTE_LENGTH) ** 4))
            px, pz = t * dx, SIGN_Z + t * dz
            reach = math.ceil(radius) + 1
            for z in range(math.floor(pz) - reach, math.floor(pz) + reach + 1):
                for y in range(math.floor(y_center) - reach, math.floor(y_center) + reach + 1):
                    for x in range(math.floor(px) - reach, math.floor(px) + reach + 1):
                        if math.dist((x + 0.5, y + 0.5, z + 0.5), (px, y_center, pz)) <= radius:
                            grid.set(x, y, z, BAGUETTE_LABEL)


def build_croissant(grid: VoxelGrid) -> None:
    """A crescent sitting on the front of the ridge, its horns curling up."""
    y_center = ROOF_FRONT - 2
    for step in range(0, 181):
        angle = math.radians(CROISSANT_START + step * CROISSANT_SPAN / 180)
        t = step / 180
        radius = CROISSANT_TUBE * (0.3 + 0.7 * math.sin(math.pi * t) ** 0.6)
        # Each rolled layer bulges, pinched at the seams, so the rolls show in the silhouette
        layer = t * CROISSANT_SEGMENTS
        radius *= 0.82 + 0.18 * math.sin(math.pi * (layer - math.floor(layer)))
        px = CROISSANT_RADIUS * math.cos(angle)
        pz = CROISSANT_Z + CROISSANT_RADIUS * CROISSANT_SQUASH * math.sin(angle)
        reach = math.ceil(radius) + 1
        for z in range(math.floor(pz) - reach, math.floor(pz) + reach + 1):
            for y in range(y_center - reach, y_center + reach + 1):
                for x in range(math.floor(px) - reach, math.floor(px) + reach + 1):
                    if math.dist((x + 0.5, y + 0.5, z + 0.5), (px, y_center, pz)) <= radius:
                        grid.set(x, y, z, CROISSANT_LABEL)


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


def shade_roof(hit: Hit, normal: tuple[float, float, float]) -> tuple[int, int, int, int]:
    cx = hit.mx + 0.5
    if hit.my <= ROOF_FRONT or normal[2] < 0.2 and abs(normal[1]) > 0.6:
        # Front edge of the tiles
        return CRUST[1]
    u = EAVE_HALF_X - abs(cx)  # distance up the slope from the eave
    v = 0.7 * hit.my + 0.75 * roof_height(cx) + 200  # height on screen
    row = math.floor(v / TILE_ROW)
    fu = v / TILE_ROW - row
    fy = ((cx + 64 + (row % 2) * TILE_WIDTH / 2) % TILE_WIDTH) / TILE_WIDTH - 0.5
    # Baked dark along the ridge, pale at the eaves; the left slope catches the light
    base = 4 if u < 12 else 3 if u < 26 else 2
    if cx > 0:
        base -= 1
    edge = fu - 0.75 * (4 * fy * fy)
    if edge < 0.1:
        return step(CRUST, base - 2)
    if edge < 0.28:
        return step(CRUST, base + 1)
    # The top of each scale sits in the shade of the row above
    if fu > 0.8:
        return step(CRUST, base - 1)
    return step(CRUST, base)


def shade(hit: Hit) -> tuple[int, int, int, int]:
    normal = hit.normal()
    light = hit.light(normal)

    if hit.label == CHOCOLATE_LABEL:
        index = face_index(hit, light, 3, 2)
        # Contact shadow under the eave and the barge boards
        if hit.z > WALL_TOP - 8 and hit.my <= HOUSE_FRONT and abs(hit.mx) > 6:
            index -= 1
        if hit.my > HOUSE_FRONT and hit.z >= WALL_TOP - 6:
            index = 0
        # Sprinkles: chunky 2x2 dots on a jittered grid
        along = hit.mx if abs(normal[0]) < 0.5 else hit.my
        cell_a, cell_z = (along + 64) // 5, hit.z // 5
        pick = noise(cell_a, cell_z, 11)
        ox = 1 + int(noise(cell_a, cell_z, 12) * 2)
        oz = 1 + int(noise(cell_a, cell_z, 13) * 2)
        if pick > 0.55 and 0 <= (along + 64) % 5 - ox < 2 and 0 <= hit.z % 5 - oz < 2:
            color = SPRINKLES[0] if pick > 0.78 else SPRINKLES[1]
            return color if index >= 2 else step(CHOCOLATE, 3)
        return step(CHOCOLATE, index)

    if hit.label == ICING_LABEL:
        if hit.neighbor(0, 0, 1) == EMPTY or normal[2] > 0.5:
            return ICING[3]
        index = 2 if light > 0.3 else 1
        return step(ICING, index)

    if hit.label == ROOF_LABEL:
        return shade_roof(hit, normal)

    if hit.label == RIDGE_LABEL:
        # A row of dark crust tiles with chevrons pointing down the ridge
        chevron = (hit.my + 64 + abs(hit.mx + 0.5) * 0.8) % 5
        return CRUST[0] if chevron < 1 else CRUST[2] if hit.mx < 0 else CRUST[1]

    if hit.label == WOOD_LABEL:
        index = face_index(hit, light, 3, 2)
        # Grain along the board
        if noise(hit.mx // 4, hit.z // 1, 21) > 0.85:
            index -= 1
        return step(WOOD, index)

    if hit.label == DOOR_LABEL:
        # Vertical planks, seams in the lowest step, shaded under the arch
        index = 1 if hit.mx > DOOR_X + 4 else 2
        if hit.z > door_top(hit.mx + 0.5 - DOOR_X) - 3:
            index = 1
        return WOOD[0] if (hit.mx - DOOR_X + 64) % 5 == 2 else WOOD[index]

    if hit.label == WINDOW_LABEL:
        return GOLD[3] if hit.z >= DIAMOND_Z else GOLD[1]
    if hit.label == KNOB_LABEL:
        return GOLD[2]
    if hit.label == PANE_LABEL:
        # Warm light from the oven, brighter in the upper panes
        # Glass in the shared stone ramp with a light streak: cool, so the warm pie stands out against it
        if (hit.mx - hit.z + 64) % 7 in (0, 1) and hit.z > WINDOW_Z[0] + 4:
            return GLASS[2]
        return GLASS[1] if hit.z >= WINDOW_Z[1] - 4 else GLASS[0]

    if hit.label == PIE_CRUST_LABEL:
        if hit.neighbor(0, 0, 1) == EMPTY:
            return BREAD[4] if hit.mx < WINDOW_X else BREAD[3]
        return BREAD[2] if light > 0.3 else BREAD[1]
    if hit.label == PIE_FILLING_LABEL:
        # Lattice of crust strips over the cherries
        if (hit.mx - WINDOW_X + 64) % 4 == 1 or (hit.my + 64) % 4 == 1:
            return BREAD[3]
        return CHERRY[2] if hit.mx < WINDOW_X else CHERRY[1]

    if hit.label == SIGN_LABEL:
        # A pale board in a wooden rim
        if math.hypot(hit.mx + 0.5, hit.z + 0.5 - SIGN_Z) > SIGN_RADIUS - 1.6:
            return WOOD[2] if hit.mx < 0 and hit.z > SIGN_Z else WOOD[1]
        return CRUST[5]

    if hit.label == BAGUETTE_LABEL:
        index = 2 if light > 0.45 else 1
        # Diagonal scores across the loaf
        along = (hit.mx + hit.z * 0.4) if hit.mx * (hit.z - SIGN_Z) >= 0 else (hit.mx - hit.z * 0.4)
        if index >= 2 and (round(along) + 64) % 5 == 0:
            index += 1
        return step(BREAD, index)

    if hit.label == CROISSANT_LABEL:
        # Lighter than the roof crust so it pops against it
        index = 4 if light > 0.6 else 3 if light > 0.2 else 2
        # Rolled layers: bands across the crescent
        angle = math.degrees(math.atan2((hit.z + 0.5 - CROISSANT_Z) / CROISSANT_SQUASH, hit.mx + 0.5))
        segment = ((angle - CROISSANT_START) % 360) / (CROISSANT_SPAN / CROISSANT_SEGMENTS)
        f = segment - math.floor(segment)
        if f < 0.14:
            return BREAD[0]
        if f < 0.26:
            return BREAD[1]
        if f > 0.8:
            index -= 1
        return step(BREAD, index)

    return (255, 0, 255, 255)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    # A material switch always has ink between the two materials
    if label == other:
        return None
    if {label, other} == {DOOR_LABEL, KNOB_LABEL}:
        return None
    if {label, other} == {PIE_CRUST_LABEL, PIE_FILLING_LABEL}:
        return None
    return INK


def footprint_shadow(x: float, y: float) -> float:
    x, y = x - SHADOW_OFFSET[0], y - SHADOW_OFFSET[1]
    boxes = ((-EAVE_HALF_X + 4, EAVE_HALF_X - 4, ROOF_FRONT + 2, ROOF_BACK),
             (-HOUSE_HALF_X, HOUSE_HALF_X, HOUSE_FRONT, HOUSE_BACK))
    distance = min(max(x0 - x, x - x1, y0 - y, y - y1, 0) for x0, x1, y0, y1 in boxes)
    return distance / SHADOW_MARGIN


def main() -> None:
    grid = build_model()
    # shadow_radii is ignored when shadow_shape is passed
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), shadow_jitter=0.3,
                    shadow_shape=footprint_shadow)
    outline(sprite, crack, depth_gap=5, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
