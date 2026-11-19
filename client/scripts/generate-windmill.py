#!/usr/bin/env python3
"""Generates the windmill totem pixel art.

Run from anywhere: python3 scripts/generate-windmill.py

Outputs public/resources/totem/windmill.png, the single front view cropped to the art.

A smock mill: an octagonal tower of horizontal weatherboards tapering up from a low stone plinth, a reefing gallery
ringing it halfway up, and a thatched conical cap with a wooden finial. Four lattice sails of cloth on wooden frames
turn in front of the cap around an iron hub, set as an X. A planked door opens under the sails and two sacks of
flour wait beside it. It is modeled as voxels and rendered by voxel_sprite.py, which holds the camera, lighting and
outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, OUTLINE, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "windmill.png"
WIDTH = 104
HEIGHT = 127
ORIGIN_Y = 91

# Shared ramps, from dark to light
STONE = [(72, 63, 97, 255), (67, 91, 125, 255), (68, 142, 159, 255), (90, 185, 187, 255), (143, 226, 185, 255)]
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
THATCH = [(94, 71, 78, 255), (138, 103, 99, 255), (175, 140, 121, 255), (227, 193, 140, 255), (245, 239, 169, 255)]
IRON = [(48, 44, 68, 255), (66, 64, 92, 255), (92, 94, 124, 255), (136, 142, 168, 255)]

# Octagons are given by their apothem (center to the middle of a side)
PLINTH_APOTHEM = 30
PLINTH_HEIGHT = 9
TOWER_BOTTOM = 26
TOWER_TOP = 18
TOWER_HEIGHT = 82
BOARD = 4  # weatherboard height
GALLERY_Z = 44
GALLERY_OVERHANG = 3
GALLERY_THICKNESS = 3
# Thatched cone, overhanging the tower top
CAP_RADIUS = 24
CAP_HEIGHT = 26
FINIAL_HEIGHT = 6
# Sails: hub on the front of the cap, sails in a vertical plane in front of it
HUB_Z = 91
HUB_RADIUS = 4
SAIL_FRONT = -27  # y of the sail plane
SAIL_DEPTH = 3
SAIL_REACH = 54
SAIL_START = 9
SAIL_WIDTH = 14
LATTICE = 7
STOCK_HALF = 1.5
SAIL_ANGLES = (45, 135, 225, 315)
# Door in the front side of the tower
DOOR_HALF = 6
DOOR_HEIGHT = 20
# Flour sacks beside the door: x, y, radius, height
SACKS = ((19, -36, 6, 13), (30, -27, 5, 11))

SHADOW_MARGIN = 9
SHADOW_OFFSET = (0, -3)
SHADOW_JITTER = 0.15

(
    SACK_LABEL,
    PLINTH_LABEL,
    TOWER_LABEL,
    GALLERY_LABEL,
    CAP_LABEL,
    FINIAL_LABEL,
    HUB_LABEL,
    STOCK_LABEL,
    FRAME_LABEL,
    CLOTH_LABEL,
    DOOR_LABEL,
) = range(len(SACKS), len(SACKS) + 11)
# One label per sack, 1..len(SACKS), so neighbor sacks get an ink seam
SACK_LABEL = 1


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def octagon(x: float, y: float) -> float:
    """Octagon distance: 1 apothem away from the center on every side."""
    return max(abs(x), abs(y), (abs(x) + abs(y)) / math.sqrt(2))


def tower_apothem(z: float) -> float:
    t = (z - PLINTH_HEIGHT) / (TOWER_HEIGHT - PLINTH_HEIGHT)
    return TOWER_BOTTOM + (TOWER_TOP - TOWER_BOTTOM) * t


def side_of(x: float, y: float) -> int:
    """Octagon side facing (x, y): 0 front, 1 front right, 2 right, 3 back right, ... -1 front left."""
    angle = math.degrees(math.atan2(x, -y))
    return round(angle / 45)


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    build_tower(grid)
    build_cap(grid)
    build_sails(grid)
    for index, sack in enumerate(SACKS):
        build_sack(grid, *sack, SACK_LABEL + index)
    return grid


def build_tower(grid: VoxelGrid) -> None:
    span = PLINTH_APOTHEM + GALLERY_OVERHANG + 2
    for y in range(-span, span):
        for x in range(-span, span):
            d = octagon(x + 0.5, y + 0.5)
            if d <= PLINTH_APOTHEM:
                grid.box(x, x + 1, y, y + 1, 0, PLINTH_HEIGHT, PLINTH_LABEL)
            for z in range(PLINTH_HEIGHT, TOWER_HEIGHT):
                if d <= tower_apothem(z + 0.5):
                    grid.set(x, y, z, TOWER_LABEL)
            if d <= tower_apothem(GALLERY_Z) + GALLERY_OVERHANG:
                grid.box(x, x + 1, y, y + 1, GALLERY_Z, GALLERY_Z + GALLERY_THICKNESS, GALLERY_LABEL)
    # Door recessed in the front side, square topped under a lintel
    front = -math.floor(tower_apothem(PLINTH_HEIGHT))
    for z in range(PLINTH_HEIGHT, PLINTH_HEIGHT + DOOR_HEIGHT):
        for x in range(-DOOR_HALF, DOOR_HALF):
            grid.box(x, x + 1, front - 2, front + 2, z, z + 1, EMPTY)
            grid.set(x, front + 2, z, DOOR_LABEL)


def build_cap(grid: VoxelGrid) -> None:
    for z in range(TOWER_HEIGHT, TOWER_HEIGHT + CAP_HEIGHT):
        t = (z + 0.5 - TOWER_HEIGHT) / CAP_HEIGHT
        # Slightly bulging cone, with a ragged eave
        radius = CAP_RADIUS * (1 - t) ** 0.85
        for y in range(-CAP_RADIUS - 2, CAP_RADIUS + 2):
            for x in range(-CAP_RADIUS - 2, CAP_RADIUS + 2):
                r = math.hypot(x + 0.5, y + 0.5)
                tuft = 1.2 * noise(math.floor(math.degrees(math.atan2(y, x)) / 9), 7) if z < TOWER_HEIGHT + 3 else 0
                if r <= radius + tuft:
                    grid.set(x, y, z, CAP_LABEL)
    top = TOWER_HEIGHT + CAP_HEIGHT - 2
    grid.box(-1, 1, -1, 1, top, top + FINIAL_HEIGHT, FINIAL_LABEL)
    grid.box(-2, 2, -2, 2, top + FINIAL_HEIGHT - 3, top + FINIAL_HEIGHT, FINIAL_LABEL)


def build_sails(grid: VoxelGrid) -> None:
    # Windshaft from inside the cap to the hub in front of the sails
    for y in range(SAIL_FRONT - 2, -8):
        for z in range(HUB_Z - HUB_RADIUS, HUB_Z + HUB_RADIUS):
            for x in range(-HUB_RADIUS, HUB_RADIUS):
                if math.hypot(x + 0.5, z + 0.5 - HUB_Z) <= (HUB_RADIUS if y < SAIL_FRONT + 1 else 2.6):
                    grid.set(x, y, z, HUB_LABEL)
    reach = SAIL_REACH + 2
    for z in range(HUB_Z - reach, HUB_Z + reach):
        for x in range(-reach, reach):
            label = sail_label(x + 0.5, z + 0.5 - HUB_Z)
            if label:
                grid.box(x, x + 1, SAIL_FRONT, SAIL_FRONT + SAIL_DEPTH, z, z + 1, label)


def sail_coordinates(x: float, dz: float) -> list[tuple[float, float]]:
    """(along, across) coordinates of a point in the sail plane for every arm."""
    result = []
    for angle in SAIL_ANGLES:
        a = math.radians(angle)
        along = x * math.cos(a) + dz * math.sin(a)
        across = -x * math.sin(a) + dz * math.cos(a)
        result.append((along, across))
    return result


def sail_label(x: float, dz: float) -> int:
    for along, across in sail_coordinates(x, dz):
        if along < 0 or along > SAIL_REACH:
            continue
        if abs(across) <= STOCK_HALF:
            return STOCK_LABEL
        # Every sail hangs on the same side of its stock, so they read as turning
        if SAIL_START <= along and STOCK_HALF < across <= STOCK_HALF + SAIL_WIDTH:
            edge = across > STOCK_HALF + SAIL_WIDTH - 1.2 or along < SAIL_START + 1.2 or along > SAIL_REACH - 1.2
            # Lattice: crossbars every LATTICE voxels and a bar along the middle of the sail, two rows of cloth cells
            middle = abs(across - STOCK_HALF - SAIL_WIDTH / 2) < 0.75
            bar = (along - SAIL_START) % LATTICE < 1.2 or middle
            return FRAME_LABEL if edge or bar else CLOTH_LABEL
    return EMPTY


def build_sack(grid: VoxelGrid, cx: int, cy: int, radius: int, height: int, label: int) -> None:
    for z in range(height + 3):
        t = z / height
        # A plump bag, rounded at the shoulders, narrowing to a tied neck with a flared top
        if t <= 0.55:
            r = radius * (0.9 + 0.1 * math.sin(math.pi * t / 0.55))
        elif t <= 1:
            r = (radius - 1.2) * math.sqrt(max(0.0, 1 - ((t - 0.55) / 0.48) ** 2)) + 1.2
        else:
            r = 2.4
        for y in range(cy - radius - 1, cy + radius + 1):
            for x in range(cx - radius - 1, cx + radius + 1):
                if math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r:
                    grid.set(x, y, z, label)


def step(ramp: list[tuple[int, int, int, int]], index: int) -> tuple[int, int, int, int]:
    return ramp[max(0, min(len(ramp) - 1, index))]


def is_top(hit: Hit) -> bool:
    return hit.neighbor(0, 0, 1) == EMPTY


def shade(hit: Hit) -> tuple[int, int, int, int]:
    x, y, z = hit.mx + 0.5, hit.my + 0.5, hit.z

    if hit.label == PLINTH_LABEL:
        if is_top(hit):
            index = 4
        else:
            index = {-2: 3, -1: 3, 0: 3, 1: 2, 2: 1}.get(side_of(x, y), 1)
            # Staggered blocks, mortar one step lower
            row = z // 4
            along = x + y * 0.4
            if z % 4 == 0 or (math.floor(along) + row * 4 + 64) % 9 == 0:
                index -= 1
        return step(STONE, index)

    if hit.label == TOWER_LABEL:
        side = side_of(x, y)
        index = {-2: 2, -1: 3, 0: 2, 1: 1, 2: 1}.get(side, 0)
        # Contact shadow under the gallery and the cap eave
        if GALLERY_Z - 6 <= z < GALLERY_Z or z >= TOWER_HEIGHT - 6:
            index -= 1
        # Weatherboards: the lower edge of each board one step darker, a few butt joints
        if z % BOARD == 0:
            index -= 1
        elif noise(math.floor((x - y) / 7), z // BOARD) > 0.8 and math.floor(x - y) % 7 == 0:
            index -= 1
        return step(WOOD, index)

    if hit.label == GALLERY_LABEL:
        if is_top(hit):
            return WOOD[3] if (math.floor(x) + 64) % 5 else WOOD[2]
        return WOOD[1] if side_of(x, y) > 0 else WOOD[2]

    if hit.label == CAP_LABEL:
        r = math.hypot(x, y) or 1
        across = x / r
        # A cone: light on the left of the middle, a step darker toward both edges
        index = 4 if -0.55 < across < 0.1 else 3 if -0.85 < across < 0.5 else 2 if across < 0.85 else 1
        # Strands: vertical streaks one step off the base
        strand = noise(math.floor(math.degrees(math.atan2(y, x)) / 4), z // 5)
        if strand > 0.78:
            index -= 1
        elif strand < 0.1:
            index += 1
        # The eave in tufts, darker at the bottom
        if z < TOWER_HEIGHT + 2:
            index -= 1
        return step(THATCH, index)

    if hit.label == FINIAL_LABEL:
        return WOOD[3] if hit.neighbor(-1, 0, 0) == EMPTY or is_top(hit) else WOOD[1]

    if hit.label == HUB_LABEL:
        if hit.my < SAIL_FRONT + 1:
            light = (-(x) + (z + 0.5 - HUB_Z)) / HUB_RADIUS
            return step(IRON, 3 if light > 0.6 else 2 if light > -0.6 else 1)
        return IRON[1]

    if hit.label in (STOCK_LABEL, FRAME_LABEL):
        # Upper left arms catch the light, lower right ones are in the shade
        lit = (-x + (z + 0.5 - HUB_Z)) > 0
        if is_top(hit) and hit.label == STOCK_LABEL:
            return WOOD[3]
        if hit.label == STOCK_LABEL:
            return WOOD[2] if lit else WOOD[1]
        return WOOD[1] if lit else WOOD[0]

    if hit.label == CLOTH_LABEL:
        lit = (-x + (z + 0.5 - HUB_Z)) > 0
        index = 4 if lit else 3
        return step(THATCH, index)

    if hit.label == DOOR_LABEL:
        index = 1 if (hit.mx + 64) % 4 == 0 else 2
        if z >= PLINTH_HEIGHT + DOOR_HEIGHT - 4:
            index -= 1
        return step(WOOD, index)

    if SACK_LABEL <= hit.label < SACK_LABEL + len(SACKS):
        cx, _, radius, height = SACKS[hit.label - SACK_LABEL]
        if z >= height - 1:
            # Rope tying the neck, then the flared top
            return WOOD[1] if z < height + 1 else THATCH[3]
        # Shaded like a cylinder, lit on the left, so the bag doesn't read as a mushroom cap on a stem
        across = (x - cx) / radius
        index = 4 if across < -0.25 else 3 if across < 0.45 else 2
        # A seam down the front of the bag and a darker bottom
        if abs(x - cx) < 0.6 and z < height - 3:
            index -= 1
        if z < 2:
            index -= 1
        return step(THATCH, index)

    return (255, 0, 255, 255)


SAIL_LABELS = {HUB_LABEL, STOCK_LABEL, FRAME_LABEL, CLOTH_LABEL}


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    # A material switch has ink between the two materials, the sail lattice is one piece
    if label == other or {label, other} <= SAIL_LABELS - {HUB_LABEL}:
        return None
    return OUTLINE


def footprint_shadow(x: float, y: float) -> float:
    """Distance outside the plinth and the sacks, in units of the margin, 1 or less inside the shadow.

    The light is overhead: the shadow rims the plinth evenly and drops a little toward the camera. The sails up in
    the air don't count.
    """
    x, y = x - SHADOW_OFFSET[0], y - SHADOW_OFFSET[1]
    distances = [max(0, octagon(x, y) - PLINTH_APOTHEM) / SHADOW_MARGIN]
    for sx, sy, radius, _ in SACKS:
        distances.append(max(0, math.hypot(x - sx, y - sy) - radius) / 3)
    return min(distances)


def main() -> None:
    grid = build_model()
    # shadow_radii is ignored, footprint_shadow gives the shape
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), SHADOW_JITTER, shadow_shape=footprint_shadow)
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
