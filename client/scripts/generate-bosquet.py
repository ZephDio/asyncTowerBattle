#!/usr/bin/env python3
"""Generates the Bosquet totem pixel art.

Run from anywhere: python3 scripts/generate-bosquet.py

Outputs public/resources/totem/bosquet.png, the single front view.

A small grove on one cell, from the user's sketch: three trees across the back (the right one lighter and bigger),
a pond in front on the left with a lily pad and a pink lotus, a fruit bush on the right, and a carved owl statue
in the front middle and a boulder on the front left shore. It follows the forest tile for the trees (wood
trunk flaring into roots, lumpy canopy of clumps) and the tower art for the stone (see the pixel-art-assets skill).
It is modeled as voxels and rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
from pathlib import Path

from voxel_sprite import OUTLINE, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "bosquet.png"
WIDTH = 112
HEIGHT = 116
ORIGIN_Y = 84

# Ramps from dark to light. Wood and stone are shared with the towers, leaves with the forest tile
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
LEAVES = [(38, 58, 72, 255), (44, 94, 78, 255), (70, 136, 70, 255), (120, 178, 80, 255), (188, 214, 108, 255)]
STONE = [(72, 63, 97, 255), (67, 91, 125, 255), (68, 142, 159, 255), (90, 185, 187, 255), (143, 226, 185, 255)]
# Grey granite for the boulder and the pebbles, leaning violet in the dark like the other ramps
GRANITE = [(58, 54, 72, 255), (88, 86, 102, 255), (124, 122, 134, 255), (164, 162, 166, 255), (204, 202, 194, 255)]
# Weathered sandstone for the owl statue, from the user's photo
SANDSTONE = [(76, 64, 74, 255), (114, 100, 100, 255), (156, 142, 130, 255), (196, 184, 162, 255), (228, 220, 194, 255)]
WATER = [(40, 52, 110, 255), (44, 82, 150, 255), (58, 124, 190, 255), (112, 182, 222, 255), (196, 236, 240, 255)]
FRUIT = [(110, 34, 62, 255), (190, 48, 58, 255), (232, 86, 70, 255), (250, 170, 130, 255)]
LOTUS = [(150, 84, 140, 255), (214, 136, 204, 255), (240, 188, 236, 255), (252, 232, 248, 255)]


class Tree:
    def __init__(
        self, x: int, y: int, trunk_height: int, canopy_radius: float, seed: int, light_shift: int
    ) -> None:
        self.x, self.y = x, y
        self.trunk_height = trunk_height
        self.canopy_radius = canopy_radius
        self.canopy_z = trunk_height + canopy_radius * 0.7
        self.seed = seed
        # The sketch's right tree is a lighter green than the two on the left
        self.light_shift = light_shift


# Back row, left to right, as in the sketch: two dark trees and a bigger light one on the right
TREES = [
    Tree(-31, 30, 23, 18, 1, 0),
    Tree(-5, 37, 29, 17, 2, 0),
    Tree(25, 29, 24, 19, 3, 1),
]
TRUNK_RADIUS = 4.5
ROOT_RADIUS = 7.5
ROOT_HEIGHT = 5
CLUMPS = 10
CLUMP_RADIUS = 0.5
CLUMP_DISTANCE = 0.8
CLUSTER_SIZE = 3
CLUSTER_CHANCE = 0.18

# Pond: a wobbly ellipse in front on the left
POND = (-13, -12, 28, 19)  # center x, y, radii x, y
# A second lobe reaching back toward the middle tree, behind the owl
POND_LOBE = (3, 6, 12, 15)
# The water lies almost flush with the ground: no rim, so it reads as a pond and not a pool
WATER_Z = 1
# The shoreline wobbles around the ellipse: (frequency, amplitude, phase) waves around the pond
SHORE_WAVES = [(2, 0.08, 0.4), (3, 0.09, 1.7), (5, 0.06, 4.1), (8, 0.03, 2.2)]
# A few loose pebbles on the bank (angle in degrees, -90 facing the camera, radius) and grass tufts (angle)
PEBBLES = [(-20, 2.0), (150, 2.2)]
GRASS_TUFTS = [(-115, 5), (-62, 4), (10, 6), (110, 5)]
# Lily pads on the water (center x, y, radius, notch angle), the first one carrying the lotus
PADS = [(-22, -12, 7.5, 0), (-4, -4, 4.5, 140), (-6, -20, 3.5, 60), (-28, 0, 3.5, -40)]
LOTUS_CENTER = (-23, -12)
# Reeds at the back left of the pond: (x, y, height), each with a cattail on top
REEDS = [(-39, -8, 14), (-34, -1, 18), (-29, 4, 12), (-2, 19, 13), (3, 21, 17), (8, 18, 11)]
# Boulder on the front left shore: lumps (x, y, z, radius)
BOULDER = [(-37, -26, 3.5, 6.5), (-31, -29, 2.5, 4.5), (-41, -22, 2.5, 4.2), (-35, -24, 7, 4.0)]
CATTAIL_LENGTH = 5

# Fruit bush on the right, between the light tree and the stone
BUSH = (30, -8, 10)  # center x, y, core radius
# Clumps bulging out of the core, like the canopies, so the bush is lumpy instead of a ball
BUSH_CLUMPS = 9
# Fruits as (angle around the bush, elevation) in degrees, -90 facing the camera, spread so they never touch
FRUITS = [(-150, 12), (-95, 8), (-40, 14), (-122, 55), (-62, 52)]
FRUIT_RADIUS = 2.6

# Owl statue in the front middle, from the user's photo: a square pedestal, an egg shaped body and a wide head
# with ear tufts, big round eyes, a beak ridge and wings carved in
OWL_CENTER = (6, -32)
PEDESTAL_HALF = (8, 5)
PEDESTAL_HEIGHT = 4
OWL_HEIGHT = 40  # top of the ear tufts
OWL_DEPTH = 0.75  # depth of the body as a fraction of its width
EYE_Z = 32
EYE_SPACING = 4.3
EYE_RADIUS = 3.9

SHADOW_OFFSET = -3
# Ignored by the renderer since shadow_shape replaces the ellipse
SHADOW_RADII = (1, 1)

TRUNK_LABELS = [1, 2, 3]
CANOPY_LABELS = [4, 5, 6]
WATER_LABEL = 7
PEBBLE_LABEL = 8
PAD_LABEL = 9
LOTUS_LABEL = 10
BUSH_LABEL = 11
FRUIT_LABEL = 12
OWL_LABEL = 13
PEDESTAL_LABEL = 16
BOULDER_LABEL = 17
REED_LABEL = 14
CATTAIL_LABEL = 15


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def clumps(tree: Tree) -> list[tuple[float, float, float, float]]:
    """The canopy as balls (x, y, z, radius): the main ball and clumps spread over its upper and side surface."""
    balls = [(tree.x, tree.y, tree.canopy_z, tree.canopy_radius)]
    for i in range(CLUMPS):
        angle = 2 * math.pi * (i + noise(tree.seed, i, 1) * 0.6) / CLUMPS
        elevation = math.radians(-10 + 60 * noise(tree.seed, i, 2))
        distance = tree.canopy_radius * CLUMP_DISTANCE
        radius = tree.canopy_radius * CLUMP_RADIUS * (0.8 + 0.4 * noise(tree.seed, i, 3))
        balls.append(
            (
                tree.x + math.cos(angle) * math.cos(elevation) * distance,
                tree.y + math.sin(angle) * math.cos(elevation) * distance,
                tree.canopy_z + math.sin(elevation) * distance,
                radius,
            )
        )
    return balls


def fill_ball(grid: VoxelGrid, bx: float, by: float, bz: float, radius: float, label: int) -> None:
    reach = math.ceil(radius) + 1
    for z in range(max(0, math.floor(bz - reach)), math.ceil(bz + reach)):
        for y in range(math.floor(by - reach), math.ceil(by + reach)):
            for x in range(math.floor(bx - reach), math.ceil(bx + reach)):
                if math.hypot(x + 0.5 - bx, y + 0.5 - by, z + 0.5 - bz) <= radius:
                    grid.set(x, y, z, label)


def shore_scale(angle: float) -> float:
    """How far the shore reaches at this angle around the pond, around 1."""
    return 1 + sum(amplitude * math.sin(frequency * angle + phase) for frequency, amplitude, phase in SHORE_WAVES)


def pond_distance(x: float, y: float) -> float:
    cx, cy, rx, ry = POND
    u, v = (x - cx) / rx, (y - cy) / ry
    return math.hypot(u, v) / shore_scale(math.atan2(v, u))


def shore_point(angle_degrees: float, outward: float) -> tuple[float, float]:
    """A point on the shore at this angle, pushed `outward` voxels out of the water."""
    cx, cy, rx, ry = POND
    angle = math.radians(angle_degrees)
    scale = shore_scale(angle)
    return (
        cx + math.cos(angle) * (rx * scale + outward),
        cy + math.sin(angle) * (ry * scale + outward),
    )


def fruit_positions() -> list[tuple[float, float, float]]:
    """Fruits on the front and top of the bush, where the camera sees them."""
    balls = bush_balls()
    cx, cy, cz, _ = balls[0]
    fruits = []
    for angle_degrees, elevation_degrees in FRUITS:
        angle, elevation = math.radians(angle_degrees), math.radians(elevation_degrees)
        direction = (math.cos(angle) * math.cos(elevation), math.sin(angle) * math.cos(elevation), math.sin(elevation))
        # Walk out from the center to the lumpy surface, then sink the fruit halfway in
        distance = 0.0
        while any(
            math.hypot(cx + direction[0] * distance - bx, cy + direction[1] * distance - by, cz + direction[2] * distance - bz) <= r
            for bx, by, bz, r in balls
        ):
            distance += 0.5
        distance -= FRUIT_RADIUS * 0.2
        fruits.append((cx + direction[0] * distance, cy + direction[1] * distance, cz + direction[2] * distance))
    return fruits


def bush_balls() -> list[tuple[float, float, float, float]]:
    """The bush as balls (x, y, z, radius): a low core and clumps of different sizes around and on top of it."""
    cx, cy, radius = BUSH
    cz = radius * 0.9
    balls = [(cx, cy, cz, radius)]
    for i in range(BUSH_CLUMPS):
        angle = 2 * math.pi * (i + noise(i, 21) * 0.7) / BUSH_CLUMPS
        elevation = math.radians(-15 + 70 * noise(i, 22))
        distance = radius * (0.65 + 0.35 * noise(i, 23))
        clump = radius * (0.4 + 0.3 * noise(i, 24))
        balls.append(
            (
                cx + math.cos(angle) * math.cos(elevation) * distance * 1.25,
                cy + math.sin(angle) * math.cos(elevation) * distance,
                max(clump * 0.8, cz + math.sin(elevation) * distance),
                clump,
            )
        )
    return balls


def owl_half_width(z: float) -> float:
    """Half width of the owl above its pedestal: an egg shaped body, a wider head, then a rounded crown."""
    h = z - PEDESTAL_HEIGHT
    if h < 0:
        return 0.0
    if h < 19:
        # Body: narrow at the feet, widest at the belly
        return 6.0 + 1.8 * math.sin(math.pi * min(1.0, h / 21))
    top = OWL_HEIGHT - PEDESTAL_HEIGHT - 2
    if h < top - 4:
        return 8.6
    # Crown rounding off between the tufts
    t = (h - (top - 4)) / 4
    return 8.6 * math.sqrt(max(0.0, 1 - t * t))


def is_water(x: float, y: float) -> bool:
    if pond_distance(x, y) <= 1:
        return True
    cx, cy, rx, ry = POND_LOBE
    u, v = (x - cx) / rx, (y - cy) / ry
    return math.hypot(u, v) / shore_scale(math.atan2(v, u) + 1.3) <= 1


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    for tree, trunk_label, canopy_label in zip(TREES, TRUNK_LABELS, CANOPY_LABELS):
        reach = math.ceil(ROOT_RADIUS) + 1
        for z in range(round(tree.canopy_z)):
            radius = TRUNK_RADIUS + (ROOT_RADIUS - TRUNK_RADIUS) * max(0, 1 - z / ROOT_HEIGHT) ** 2
            for y in range(tree.y - reach, tree.y + reach):
                for x in range(tree.x - reach, tree.x + reach):
                    if math.hypot(x + 0.5 - tree.x, y + 0.5 - tree.y) <= radius:
                        grid.set(x, y, z, trunk_label)
        for bx, by, bz, radius in clumps(tree):
            fill_ball(grid, bx, by, bz, radius, canopy_label)

    # Bush, then its fruits bulging out of it
    for bx, by, bz, radius in bush_balls():
        fill_ball(grid, bx, by, bz, radius, BUSH_LABEL)
    for fx, fy, fz in fruit_positions():
        fill_ball(grid, fx, fy, fz, FRUIT_RADIUS, FRUIT_LABEL)

    # Pond: water inside the wobbly shoreline, then a few pebbles and grass tufts scattered on the bank
    px, py, prx, pry = POND
    for y in range(py - 2 * pry, py + 2 * pry):
        for x in range(px - 2 * prx, px + 2 * prx):
            if is_water(x + 0.5, y + 0.5):
                for z in range(WATER_Z):
                    grid.set(x, y, z, WATER_LABEL)
    for angle, radius in PEBBLES:
        bx, by = shore_point(angle, radius * 0.4)
        fill_ball(grid, bx, by, radius * 0.5, radius, PEBBLE_LABEL)
    for angle, height in GRASS_TUFTS:
        gx, gy = shore_point(angle, 1.5)
        # Three blades fanning out, 2 voxels thick so the outline doesn't turn them into ink
        for blade, lean in ((-2, -0.35), (0, 0.0), (2, 0.35)):
            blade_height = height - abs(blade) // 2
            for z in range(blade_height):
                bx = round(gx + blade + lean * z)
                for dx, dy in ((0, 0), (1, 0), (0, 1), (1, 1)):
                    grid.set(bx + dx, round(gy) + dy, z, REED_LABEL)

    # Lily pads: thin disks on the water with a wedge cut out, then the lotus cup on the first one
    for lx, ly, lr, notch in PADS:
        for y in range(math.floor(ly - lr), math.ceil(ly + lr) + 1):
            for x in range(math.floor(lx - lr), math.ceil(lx + lr) + 1):
                dx, dy = x + 0.5 - lx, y + 0.5 - ly
                if math.hypot(dx, dy) > lr:
                    continue
                angle = (math.degrees(math.atan2(dy, dx)) - notch + 180) % 360 - 180
                if -18 < angle < 18 and math.hypot(dx, dy) > 1.5:
                    continue
                grid.set(x, y, WATER_Z, PAD_LABEL)
    # Reeds: thin stems standing in the water at the back left, a brown cattail near the top of each
    for rx, ry, height in REEDS:
        # 2 voxels thick, or the outline turns a 1 voxel stem into solid ink
        for z in range(height):
            for dx, dy in ((0, 0), (1, 0), (0, 1), (1, 1)):
                grid.set(rx + dx, ry + dy, z, REED_LABEL)
        for z in range(height - CATTAIL_LENGTH - 2, height - 1):
            for dx in range(-1, 3):
                for dy in range(-1, 3):
                    if (dx in (-1, 2)) and (dy in (-1, 2)):
                        continue
                    grid.set(rx + dx, ry + dy, z, CATTAIL_LABEL)
    fx, fy = LOTUS_CENTER
    for z in range(WATER_Z + 1, WATER_Z + 6):
        # A cup: narrow at the base, open at the top, with petal tips sticking up
        h = z - WATER_Z - 1
        radius = 1.6 + 0.7 * h
        for y in range(fy - 6, fy + 7):
            for x in range(fx - 6, fx + 7):
                dx, dy = x + 0.5 - fx, y + 0.5 - fy
                r = math.hypot(dx, dy)
                petal = math.cos(5 * math.atan2(dy, dx)) > 0.1
                if r <= radius and (h < 3 or petal) and (h < 2 or r > radius - 2.2):
                    grid.set(x, y, z, LOTUS_LABEL)

    # Boulder
    for bx, by, bz, radius in BOULDER:
        fill_ball(grid, bx, by, bz, radius, BOULDER_LABEL)

    # Owl statue: the pedestal, then the body and head as rounded slices, then the ear tufts
    ox, oy = OWL_CENTER
    grid.box(ox - PEDESTAL_HALF[0], ox + PEDESTAL_HALF[0], oy - PEDESTAL_HALF[1], oy + PEDESTAL_HALF[1], 0, PEDESTAL_HEIGHT, PEDESTAL_LABEL)
    for z in range(PEDESTAL_HEIGHT, OWL_HEIGHT):
        hw = owl_half_width(z + 0.5)
        if hw <= 0:
            continue
        hd = hw * OWL_DEPTH
        for y in range(oy - 8, oy + 9):
            for x in range(ox - 9, ox + 10):
                u, v = abs(x + 0.5 - ox) / hw, abs(y + 0.5 - oy) / hd
                # A V notch in the crown between the ear tufts, so they stand out in the silhouette
                notch = z - (OWL_HEIGHT - 7)
                if notch > 0 and abs(x + 0.5 - ox) < notch * 1.1:
                    continue
                if u ** 2.6 + v ** 2.6 <= 1:
                    grid.set(x, y, z, OWL_LABEL)
    for side in (-1, 1):
        # Ear tufts: small pointed bumps on the head's top corners
        for z in range(OWL_HEIGHT - 6, OWL_HEIGHT + 4):
            radius = 3.6 * (OWL_HEIGHT + 4 - z) / 10
            # Leaning out a little as they rise
            tx = ox + side * (6.0 + 0.15 * (z - OWL_HEIGHT + 6))
            for y in range(oy - 3, oy + 4):
                for x in range(round(tx) - 4, round(tx) + 5):
                    if math.hypot(x + 0.5 - tx, (y + 0.5 - oy) * 1.2) <= radius:
                        grid.set(x, y, z, OWL_LABEL)
    return grid


def owl_carving(hit: Hit) -> int | None:
    """The sandstone step of the carving on the owl's front at this hit, or None for the plain stone.

    Big round eyes (a lit rim, a shaded socket and a dark pupil), a beak ridge between them, the V of the facial
    disc rising to the ear tufts, and a wing line down each side of the body.
    """
    ox, _ = OWL_CENTER
    u = hit.mx + 0.5 - ox
    z = hit.z + 0.5
    for side in (-1, 1):
        d = math.hypot(u - side * EYE_SPACING, z - EYE_Z)
        if d <= 1.2:
            return 0
        if d <= EYE_RADIUS - 1.1:
            return 1
        if d <= EYE_RADIUS:
            return 4
    # Beak: a lit ridge with a dark tip, between and below the eyes
    if abs(u) <= 1.0 and EYE_Z - 5 <= z <= EYE_Z + 1:
        return 0 if z < EYE_Z - 4 else 3
    # Facial disc: the brow line rising from the beak to the tufts
    if abs(u) >= 1.5 and abs(z - (EYE_Z + 3 + 0.5 * abs(u))) < 0.8:
        return 1
    # Wings: a line down each side of the body, curving in toward the feet
    if PEDESTAL_HEIGHT + 2 <= z <= EYE_Z - 6:
        wing = 4.6 - 0.12 * (EYE_Z - 6 - z)
        if abs(abs(u) - wing) < 0.55:
            return 1
    return None


def shade(hit: Hit) -> tuple[int, int, int, int]:
    label = hit.label
    if label in TRUNK_LABELS:
        tree = TREES[TRUNK_LABELS.index(label)]
        normal = hit.normal()
        light = hit.light(normal)
        if hit.z > tree.trunk_height - 4:
            return WOOD[0]
        step = 2 if light > 0.35 else 1
        if noise(hit.mx, hit.my, 5) < 0.25:
            step -= 1
        return WOOD[max(0, step)]

    if label in CANOPY_LABELS or label == BUSH_LABEL:
        normal = hit.normal()
        light = hit.light(normal)
        if normal[2] < -0.35:
            step = 0
        else:
            step = sum(light >= threshold for threshold in (-0.05, 0.35, 0.62, 0.86))
        if label in CANOPY_LABELS:
            step += TREES[CANOPY_LABELS.index(label)].light_shift
        else:
            step += 1  # the bush is the lightest green, like in the sketch
        cluster = noise(hit.mx // CLUSTER_SIZE, hit.my // CLUSTER_SIZE, hit.z // CLUSTER_SIZE, label)
        if cluster < CLUSTER_CHANCE:
            step -= 1
        elif cluster > 1 - CLUSTER_CHANCE:
            step += 1
        return LEAVES[max(0, min(4, step))]

    if label == FRUIT_LABEL:
        light = hit.light(hit.normal())
        normal = hit.normal()
        light = hit.light(normal)
        step = 1 if light > -0.1 else 0
        # A highlight on the top left of each fruit
        if light > 0.7:
            step = 2
        if light > 0.92:
            step = 3
        return FRUIT[step]

    if label == WATER_LABEL:
        _, py, _, pry = POND
        x, y = hit.mx + 0.5, hit.my + 0.5
        depth = (hit.my - py) / pry
        step = 2 if depth < 0.25 else 1
        # Along the back shore the water is darker, shaded by the bank and reflecting the trees
        if not is_water(x, y + 4 + 2 * noise(hit.mx // 2, 18)):
            step = 0
        # Shallow water along the front shore, one step lighter, in a ragged band
        elif not is_water(x, y - 2 - 2 * noise(hit.mx // 2, 16)):
            step = 3
        # Ripples: short horizontal glints
        if noise(hit.mx // 4, hit.my, 11) < 0.12 and depth < 0.55:
            step = 3
        if noise(hit.mx // 3, hit.my, 12) < 0.03 and depth < 0.2:
            step = 4
        return WATER[step]

    if label == PAD_LABEL:
        step = 3 if noise(hit.mx, hit.my, 13) < 0.15 else 2
        # A darker vein from the center
        for lx, ly, lr, notch in PADS:
            # A darker vein from the center, opposite the notch
            if math.hypot(hit.mx + 0.5 - lx, hit.my + 0.5 - ly) <= lr:
                angle = (math.degrees(math.atan2(hit.my + 0.5 - ly, hit.mx + 0.5 - lx)) - notch) % 360
                if abs(angle - 180) < 12:
                    step = 1
        return LEAVES[step]

    if label == LOTUS_LABEL:
        normal = hit.normal()
        light = hit.light(normal)
        step = 1 if light < 0.2 else 2
        if hit.z >= WATER_Z + 4 or normal[2] > 0.7:
            step = 3
        return LOTUS[step]

    if label == REED_LABEL:
        # Thin stems: lit on the left, from their empty neighbors
        return LEAVES[3] if hit.neighbor(-1, 0, 0) == 0 else LEAVES[2]

    if label == CATTAIL_LABEL:
        return WOOD[2] if hit.neighbor(-1, 0, 0) != CATTAIL_LABEL and hit.neighbor(0, -1, 0) == 0 else WOOD[1]

    if label in (PEBBLE_LABEL, BOULDER_LABEL):
        normal = hit.normal()
        light = hit.light(normal)
        if normal[2] > 0.6:
            step = 3
        else:
            step = sum(light >= threshold for threshold in (-0.2, 0.3, 0.7))
        # Speckles of the granite
        if label == BOULDER_LABEL and noise(hit.mx // 2, hit.my // 2, hit.z // 2, 17) < 0.15:
            step -= 1
        return GRANITE[max(0, min(4, step))]

    if label in (OWL_LABEL, PEDESTAL_LABEL):
        normal = hit.normal()
        light = hit.light(normal)
        if normal[2] > 0.6:
            step = 4 if label == PEDESTAL_LABEL else 3
        else:
            step = sum(light >= threshold for threshold in (-0.2, 0.25, 0.6))
        if label == OWL_LABEL and normal[1] < -0.3:
            carving = owl_carving(hit)
            if carving is not None:
                return SANDSTONE[carving]
            # The front in light gets a flat middle-high step, darker toward the right edge
            step = 3 if normal[0] < -0.25 else 1 if normal[0] > 0.4 else 2
            return SANDSTONE[step]
        # Pitted sandstone, as in the photo: dark pores away from the face
        if noise(hit.mx, hit.my, hit.z, 15) < 0.1:
            step -= 1
        return SANDSTONE[max(0, min(4, step))]

    return OUTLINE


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    """Ink between parts, except inside the small lotus, where a seam would eat the flower."""
    if label == other:
        return None
    if LOTUS_LABEL in (label, other) and PAD_LABEL in (label, other):
        return None
    if {label, other} <= {REED_LABEL, CATTAIL_LABEL}:
        return None
    return OUTLINE


def ground_shadow(x: float, y: float) -> float:
    """Blobs under the canopies, the bush, the owl and the boulder, dropped toward the camera. The flat pond casts none."""
    distances = [
        math.hypot(x - tree.x, y - (tree.y + SHADOW_OFFSET)) / (tree.canopy_radius * 0.8) for tree in TREES
    ]
    for bx, by, _, radius in bush_balls():
        distances.append(math.hypot(x - bx, y - (by - 2)) / (radius + 2))
    ox, oy = OWL_CENTER
    distances.append(math.hypot((x - ox) / (PEDESTAL_HALF[0] + 3), (y - (oy - 2)) / (PEDESTAL_HALF[1] + 3)))
    for bx, by, _, radius in BOULDER:
        distances.append(math.hypot(x - bx, y - (by - 1.5)) / (radius + 1.5))
    return min(distances)


def main() -> None:
    grid = build_model()
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, SHADOW_RADII, 0.12, shadow_shape=ground_shadow)
    # A large gap keeps the bumpy canopy from being outlined at every clump; thin lotus petals use a 1px depth edge
    outline(sprite, crack, depth_gap=9, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
