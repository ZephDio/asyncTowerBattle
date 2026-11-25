#!/usr/bin/env python3
"""Generates the Forest Cabin tower pixel art.

Run from anywhere: python3 scripts/generate-forest-cabin.py

Outputs public/resources/towers/forest-cabin.png, the single front view.

One big tree holding a log cabin in its branches: a trunk flaring into roots, a platform on two forked branches,
the cabin on it with a shingle roof and a door, a ladder down to the ground, a lumpy canopy above and around it,
and a ranger on the front right of the deck scouting through a long spyglass. Modeled as voxels and rendered by
voxel_sprite.py, which holds the camera, lighting and outlines (see the pixel-art-assets skill).
"""

import math
from pathlib import Path

from voxel_sprite import OUTLINE, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "towers" / "forest-cabin.png"
WIDTH = 106
HEIGHT = 133
ORIGIN_Y = 110

WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
# Bark: darker and greyer than the cabin logs so the tree and the cabin separate
BARK = [(62, 52, 64, 255), (94, 76, 78, 255), (128, 102, 92, 255), (160, 132, 110, 255)]
LEAVES = [(38, 58, 72, 255), (44, 94, 78, 255), (70, 136, 70, 255), (120, 178, 80, 255), (188, 214, 108, 255)]
# Red-brown shingles, away from the leaves' greens
SHINGLE = [(78, 50, 64, 255), (122, 66, 66, 255), (166, 92, 70, 255), (208, 132, 86, 255)]
# A dark teal cloak, so the ranger stands out from the cabin logs and the leaves
CLOAK = [(36, 44, 66, 255), (48, 72, 96, 255), (60, 106, 118, 255), (96, 150, 146, 255)]
SKIN = [(150, 92, 80, 255), (214, 146, 112, 255), (240, 196, 150, 255)]
BRASS = [(110, 72, 40, 255), (176, 124, 52, 255), (232, 184, 84, 255), (250, 230, 150, 255)]
GLASS = [(40, 52, 110, 255), (58, 124, 190, 255), (112, 182, 222, 255)]

TRUNK = (0, 0)
TRUNK_RADIUS = 8.0
ROOT_RADIUS = 13.5
ROOT_HEIGHT = 7
TRUNK_TOP = 84

DECK = (-23, 27, -19, 9, 29, 32)  # x0, x1, y0, y1, z0, z1
CABIN = (-14, 14, -13, 5, 32, 46)
RIDGE_Z = 63
ROOF_OVERHANG = 3
LADDER_X = -17
LADDER_Y = -21

# Canopy balls (x, y, z, radius): a wide crown of three lobes above the cabin and two low clumps hugging its sides
CANOPY = [(-17, 12, 80, 18), (17, 12, 81, 18), (0, 16, 90, 18), (-36, 8, 58, 11), (37, 7, 60, 11)]
CLUMPS = 12

RANGER = (19, -15)
SPYGLASS_FROM = (21.5, -16.5, 47.0)
SPYGLASS_TO = (38.0, -22.0, 49.5)

BARK_LABEL = 1
BRANCH_LABEL = 2
LEAF_LABEL = 3
DECK_LABEL = 4
LOG_LABEL = 5
ROOF_LABEL = 6
DOOR_LABEL = 7
LADDER_LABEL = 8
CLOAK_LABEL = 9
SKIN_LABEL = 10
BRASS_LABEL = 11
WINDOW_LABEL = 12


def noise(*values: int) -> float:
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def fill_ball(grid: VoxelGrid, bx: float, by: float, bz: float, radius: float, label: int, only_empty=False) -> None:
    reach = math.ceil(radius) + 1
    for z in range(max(0, math.floor(bz - reach)), math.ceil(bz + reach)):
        for y in range(math.floor(by - reach), math.ceil(by + reach)):
            for x in range(math.floor(bx - reach), math.ceil(bx + reach)):
                if math.hypot(x + 0.5 - bx, y + 0.5 - by, z + 0.5 - bz) <= radius:
                    if only_empty and grid.get(x, y, z):
                        continue
                    grid.set(x, y, z, label)


def fill_rod(grid: VoxelGrid, a, b, ra: float, rb: float, label: int) -> None:
    """A tapered cylinder from a to b, as balls along it."""
    length = math.dist(a, b)
    steps = max(2, math.ceil(length * 2))
    for i in range(steps + 1):
        t = i / steps
        p = [a[k] + (b[k] - a[k]) * t for k in range(3)]
        fill_ball(grid, p[0], p[1], p[2], ra + (rb - ra) * t, label)


def canopy_balls() -> list[tuple[float, float, float, float]]:
    balls = []
    for seed, (cx, cy, cz, radius) in enumerate(CANOPY):
        balls.append((cx, cy, cz, radius))
        count = CLUMPS if radius > 15 else 6
        for i in range(count):
            angle = 2 * math.pi * (i + noise(seed, i, 1) * 0.6) / count
            elevation = math.radians(-15 + 65 * noise(seed, i, 2))
            distance = radius * 0.8
            clump = radius * 0.5 * (0.8 + 0.4 * noise(seed, i, 3))
            balls.append(
                (
                    cx + math.cos(angle) * math.cos(elevation) * distance * 1.1,
                    cy + math.sin(angle) * math.cos(elevation) * distance,
                    cz + math.sin(elevation) * distance,
                    clump,
                )
            )
    return balls


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    tx, ty = TRUNK
    # Trunk, flaring into roots and thinning toward the crown
    for z in range(TRUNK_TOP):
        radius = TRUNK_RADIUS * (1 - 0.35 * z / TRUNK_TOP)
        radius += (ROOT_RADIUS - TRUNK_RADIUS) * max(0, 1 - z / ROOT_HEIGHT) ** 2
        # Root lobes: the flare bulges in four directions
        for y in range(ty - 14, ty + 14):
            for x in range(tx - 14, tx + 14):
                dx, dy = x + 0.5 - tx, y + 0.5 - ty
                lobe = 1 + (0.25 * math.cos(4 * math.atan2(dy, dx) + 0.6) if z < ROOT_HEIGHT else 0)
                if math.hypot(dx, dy) <= radius * lobe:
                    grid.set(x, y, z, BARK_LABEL)
    # Forked branches holding the deck, and limbs reaching into the side clumps
    for side in (-1, 1):
        fill_rod(grid, (tx + side * 3, ty - 3, 14), (side * 18, -13, 29), 3.4, 2.4, BRANCH_LABEL)
        fill_rod(grid, (tx + side * 3, ty, 50), (side * 32, 8, 58), 3.0, 2.0, BRANCH_LABEL)
    for bx, by, bz, radius in canopy_balls():
        fill_ball(grid, bx, by, bz, radius, LEAF_LABEL, only_empty=True)

    # Deck, then the cabin on it
    x0, x1, y0, y1, z0, z1 = DECK
    grid.box(x0, x1, y0, y1, z0, z1, DECK_LABEL)
    cx0, cx1, cy0, cy1, cz0, cz1 = CABIN
    grid.box(cx0, cx1, cy0, cy1, cz0, cz1, LOG_LABEL)
    # The gable faces the camera: the ridge runs front to back above x = 0
    half_width = (cx1 - cx0) / 2
    slope = (RIDGE_Z - cz1) / half_width
    for x in range(cx0, cx1):
        top = RIDGE_Z - slope * abs(x + 0.5)
        for z in range(cz1, math.ceil(top)):
            for y in range(cy0, cy1):
                grid.set(x, y, z, LOG_LABEL)
    # Roof: a 3 voxel shell over the walls, overhanging on every side
    for x in range(cx0 - ROOF_OVERHANG, cx1 + ROOF_OVERHANG):
        top = RIDGE_Z + 3 - slope * abs(x + 0.5)
        for z in range(math.floor(top) - 3, math.ceil(top)):
            for y in range(cy0 - ROOF_OVERHANG, cy1 + 1):
                grid.set(x, y, z, ROOF_LABEL)
    # Door in the middle of the front, a round-ish window in the gable, sunk one voxel in the front wall
    grid.box(-3, 4, cy0, cy0 + 1, cz0, cz0 + 11, DOOR_LABEL)
    grid.box(-3, 4, cy0, cy0 + 1, cz1 + 2, cz1 + 8, WINDOW_LABEL)

    # Ladder from the ground to the deck's front left corner: two rails and rungs
    for z in range(0, DECK[5]):
        for x in (LADDER_X - 3, LADDER_X + 3):
            grid.box(x, x + 2, LADDER_Y, LADDER_Y + 2, z, z + 1, LADDER_LABEL)
        if z % 5 == 2:
            grid.box(LADDER_X - 1, LADDER_X + 3, LADDER_Y, LADDER_Y + 2, z, z + 2, LADDER_LABEL)

    # Ranger: a cloaked body, a head under a hood, and a long brass spyglass held to the eye
    rx, ry = RANGER
    for z in range(DECK[5], DECK[5] + 13):
        radius = 4.2 - 0.12 * (z - DECK[5])
        fill_ball(grid, rx, ry, z, radius, CLOAK_LABEL)
    fill_ball(grid, rx + 0.5, ry, DECK[5] + 15.5, 3.6, CLOAK_LABEL)
    fill_ball(grid, rx + 1.5, ry - 2, DECK[5] + 15, 2.4, SKIN_LABEL)
    fill_rod(grid, (rx - 1, ry, DECK[5] + 9), SPYGLASS_FROM, 1.4, 1.4, CLOAK_LABEL)
    fill_rod(grid, SPYGLASS_FROM, SPYGLASS_TO, 1.5, 2.3, BRASS_LABEL)
    return grid


def step_from_light(hit: Hit, thresholds) -> int:
    normal = hit.normal()
    return sum(hit.light(normal) >= t for t in thresholds)


def shade(hit: Hit):
    label = hit.label
    if label in (BARK_LABEL, BRANCH_LABEL):
        step = step_from_light(hit, (-0.1, 0.35, 0.75))
        # Vertical bark furrows
        if label == BARK_LABEL and noise(hit.mx // 2, 31) < 0.3:
            step -= 1
        # Contact shadow under the deck
        if DECK[4] - 8 <= hit.z < DECK[4]:
            step -= 1
        return BARK[max(0, min(3, step))]
    if label == LEAF_LABEL:
        normal = hit.normal()
        light = hit.light(normal)
        step = 0 if normal[2] < -0.35 else sum(light >= t for t in (-0.05, 0.35, 0.62, 0.86))
        cluster = noise(hit.mx // 3, hit.my // 3, hit.z // 3, 7)
        if cluster < 0.18:
            step -= 1
        elif cluster > 0.82:
            step += 1
        return LEAVES[max(0, min(4, step))]
    if label == DECK_LABEL:
        normal = hit.normal()
        if normal[2] > 0.6:
            # Planks running left to right, with ink seams
            return OUTLINE if hit.my % 5 == 0 and noise(hit.mx // 6, hit.my, 3) < 0.7 else WOOD[3]
        return WOOD[1]
    if label == LOG_LABEL:
        normal = hit.normal()
        if normal[1] < -0.5:
            # Front wall: stacked logs, a shaded underside under each one, round log ends at the corners
            band = (hit.z - CABIN[4]) % 4
            step = 1 if band == 0 else 2
            if band == 3 and noise(hit.mx // 3, hit.z, 4) < 0.5:
                step = 3
            if hit.mx in (CABIN[0], CABIN[1] - 1) and hit.z < CABIN[5]:
                step = 3 if band in (1, 2) else 0
            return WOOD[step]
        return WOOD[1] if normal[0] > 0.3 else WOOD[2]
    if label == ROOF_LABEL:
        normal = hit.normal()
        if normal[2] < 0.2 or (hit.neighbor(0, -1, 0) == 0 and normal[1] < -0.6):
            return SHINGLE[0]
        # The left slope faces the light
        step = 2 if hit.mx < 0 else 1
        # Shingle rows down the slope, staggered seams across them
        row = abs(hit.mx) // 3
        if abs(hit.mx) % 3 == 0 or (hit.my + 2 * (row % 2)) % 5 == 0:
            step -= 1
        if abs(hit.mx + 0.5) < 2:
            step = 3
        return SHINGLE[max(0, step)]
    if label == DOOR_LABEL:
        return WOOD[0] if hit.mx == 0 or hit.z == CABIN[4] + 10 else WOOD[1]
    if label == WINDOW_LABEL:
        if hit.mx == 0 or hit.z == CABIN[5] + 5:
            return WOOD[2]
        return GLASS[2] if hit.mx < 0 and hit.z > CABIN[5] + 5 else GLASS[1]
    if label == LADDER_LABEL:
        return WOOD[3] if hit.neighbor(-1, 0, 0) == 0 or hit.neighbor(0, 0, 1) == 0 else WOOD[2]
    if label == CLOAK_LABEL:
        return CLOAK[max(0, min(3, step_from_light(hit, (-0.2, 0.3, 0.75))))]
    if label == SKIN_LABEL:
        return SKIN[max(0, min(2, step_from_light(hit, (0.0, 0.5))))]
    if label == BRASS_LABEL:
        step = step_from_light(hit, (-0.2, 0.3, 0.7))
        # Rings between the draw tubes
        if hit.mx in (27, 28, 33, 34):
            step = 0
        return BRASS[max(0, min(3, step))]
    return OUTLINE


def crack(label: int, other: int):
    if label == other:
        return None
    if {label, other} <= {BARK_LABEL, BRANCH_LABEL}:
        return None
    if {label, other} <= {DOOR_LABEL, WINDOW_LABEL, LOG_LABEL} and DOOR_LABEL not in (label, other) and WINDOW_LABEL not in (label, other):
        return None
    return OUTLINE


def ground_shadow(x: float, y: float) -> float:
    """The crown seen from above, dropped toward the camera, plus a rim around the roots and the ladder feet."""
    tx, ty = TRUNK
    crown = math.hypot((x - tx) / 42, (y - (ty - 6)) / 22)
    roots = math.hypot(x - tx, y - (ty - 2)) / (ROOT_RADIUS + 3)
    ladder = math.hypot((x - LADDER_X) / 7, (y - (LADDER_Y - 1)) / 3)
    return min(crown, roots, ladder)


def main() -> None:
    sprite = render(build_model(), 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), 0.12, shadow_shape=ground_shadow)
    outline(sprite, crack, depth_gap=9, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
