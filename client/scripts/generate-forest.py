#!/usr/bin/env python3
"""Generates the forest (trees) environment pixel art.

Run from anywhere: python3 scripts/generate-forest.py

Outputs public/resources/environment/forest.png, the single front view.

Five trees filling one cell, one near each corner and one in the middle, so the tile reads as unbuildable, following the crops field and the tower art (see the
pixel-art-assets skill): a wood trunk flaring into roots, and a lumpy canopy made of one big ball with smaller clumps
bulging out of it. Leaves are shaded in flat steps by the light, with 2x2 clusters one step up or down for texture,
a dark underside where the canopy hangs over the trunk, and ink seams where canopies overlap.
It is modeled as voxels and rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, OUTLINE, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "environment" / "forest.png"
WIDTH = 112
HEIGHT = 112
ORIGIN_Y = 80

# Ramps from dark to light. Wood is shared with the towers; leaves start from a blue leaning shade next to the ink
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
LEAVES = [(38, 58, 72, 255), (44, 94, 78, 255), (70, 136, 70, 255), (120, 178, 80, 255), (188, 214, 108, 255)]


class Tree:
    def __init__(self, x: int, y: int, trunk_height: int, canopy_radius: float, seed: int) -> None:
        self.x, self.y = x, y
        self.trunk_height = trunk_height
        self.canopy_radius = canopy_radius
        self.canopy_z = trunk_height + canopy_radius * 0.7
        self.seed = seed


# One tree near each corner of the cell and one in the middle, back row first, so the leaves fill the square tile out
# to its corners instead of bunching into a round clump. Heights vary so the crowns don't line up
TREES = [
    Tree(-29, 26, 30, 17, 1),
    Tree(29, 28, 32, 17, 2),
    Tree(1, 6, 28, 18, 4),
    Tree(-28, -20, 22, 18, 3),
    Tree(29, -22, 23, 18, 5),
]
TRUNK_RADIUS = 5.5
ROOT_RADIUS = 9
ROOT_HEIGHT = 6
# Clumps bulging out of each canopy ball: count, radius as a fraction of the canopy, and how far out they sit
CLUMPS = 10
CLUMP_RADIUS = 0.5
CLUMP_DISTANCE = 0.8
# Leaves step up or down in clusters of CLUSTER_SIZE voxels this often
CLUSTER_SIZE = 3
CLUSTER_CHANCE = 0.18
# Shadow: a round blob under each canopy, shifted toward the camera, in voxels
SHADOW_SCALE = 0.85
SHADOW_OFFSET = -3
# Ignored by the renderer since shadow_shape replaces the ellipse
SHADOW_RADII = (1, 1)

# Labels: trunk then canopy, per tree
TRUNK_LABELS = [1 + 2 * i for i in range(len(TREES))]
CANOPY_LABELS = [2 + 2 * i for i in range(len(TREES))]


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
        # Most clumps sit around the sides, a few higher up to break the top
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


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    for tree, trunk_label, canopy_label in zip(TREES, TRUNK_LABELS, CANOPY_LABELS):
        reach = math.ceil(ROOT_RADIUS) + 1
        for z in range(round(tree.canopy_z)):
            # The trunk flares into roots at the ground
            radius = TRUNK_RADIUS + (ROOT_RADIUS - TRUNK_RADIUS) * max(0, 1 - z / ROOT_HEIGHT) ** 2
            for y in range(tree.y - reach, tree.y + reach):
                for x in range(tree.x - reach, tree.x + reach):
                    if math.hypot(x + 0.5 - tree.x, y + 0.5 - tree.y) <= radius:
                        grid.set(x, y, z, trunk_label)
        for bx, by, bz, radius in clumps(tree):
            reach = math.ceil(radius) + 1
            for z in range(math.floor(bz - reach), math.ceil(bz + reach)):
                for y in range(math.floor(by - reach), math.ceil(by + reach)):
                    for x in range(math.floor(bx - reach), math.ceil(bx + reach)):
                        if math.hypot(x + 0.5 - bx, y + 0.5 - by, z + 0.5 - bz) <= radius:
                            grid.set(x, y, z, canopy_label)
    return grid


def shade(hit: Hit) -> tuple[int, int, int, int]:
    normal = hit.normal()
    light = hit.light(normal)
    if hit.label in TRUNK_LABELS:
        tree = TREES[TRUNK_LABELS.index(hit.label)]
        # Contact shadow right under the canopy, then the cylinder lit on the left
        if hit.z > tree.trunk_height - 4:
            return WOOD[0]
        step = 2 if light > 0.35 else 1
        # Bark: vertical streaks one step darker
        if noise(hit.mx, hit.my, 5) < 0.25:
            step -= 1
        return WOOD[max(0, step)]

    if normal[2] < -0.35:
        # The underside of the canopy, over the trunk and the ground
        step = 0
    else:
        step = sum(light >= threshold for threshold in (-0.05, 0.35, 0.62, 0.86))
    cluster = noise(hit.mx // CLUSTER_SIZE, hit.my // CLUSTER_SIZE, hit.z // CLUSTER_SIZE, hit.label)
    if cluster < CLUSTER_CHANCE:
        step -= 1
    elif cluster > 1 - CLUSTER_CHANCE and step < 4:
        step += 1
    return LEAVES[max(0, min(4, step))]


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    """Ink between one tree and another, and between a canopy and its trunk."""
    if label != other:
        return OUTLINE
    return None


def canopy_shadow(x: float, y: float) -> float:
    """Normalized distance to the nearest blob under a canopy, 1 or less in shadow."""
    return min(
        math.hypot(x - tree.x, y - (tree.y + SHADOW_OFFSET)) / (tree.canopy_radius * SHADOW_SCALE) for tree in TREES
    )


def main() -> None:
    grid = build_model()
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, SHADOW_RADII, 0.12, shadow_shape=canopy_shadow)
    # A large gap keeps the bumpy canopy from being outlined at every clump
    outline(sprite, crack, depth_gap=9)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
