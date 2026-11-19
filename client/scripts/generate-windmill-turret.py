#!/usr/bin/env python3
"""Build a war-ready windmill with a mounted arbalest, using the windmill's voxel model.

Run from anywhere: python3 client/scripts/generate-windmill-turret.py
Writes public/resources/towers/windmill-turret.png. This is a visual resource, not a playable tower.
"""

import importlib.util
import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public/resources/towers/windmill-turret.png"
spec = importlib.util.spec_from_file_location("windmill", Path(__file__).with_name("generate-windmill.py"))
assert spec and spec.loader
mill = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mill)

WIDTH, HEIGHT, ORIGIN_Y = 104, 142, 106
TIMBER, IRON, BOLT, STRING, DEBRIS, AMMO = range(40, 46)


def rod(grid: VoxelGrid, a: tuple[int, int, int], b: tuple[int, int, int], radius: int, label: int) -> None:
    """A continuous square-section beam between two model-space points."""
    steps = max(abs(v - u) for u, v in zip(a, b)) * 2
    for i in range(steps + 1):
        x, y, z = (round(u + (v - u) * i / steps) for u, v in zip(a, b))
        grid.box(x - radius, x + radius + 1, y - radius, y + radius + 1, z - radius, z + radius + 1, label)


def damage_sails(grid: VoxelGrid) -> None:
    """Break both upper arms near the hub and leave two unequal, ragged lower sails.

    Coordinates follow the original mill's four arms (45, 135, 225, 315 degrees).
    Only sail voxels are removed: the hub and the structure behind them stay intact.
    """
    lengths = (10, 12, 27, 43)
    sail_labels = (mill.STOCK_LABEL, mill.FRAME_LABEL, mill.CLOTH_LABEL)
    for x in range(-mill.SAIL_REACH - 2, mill.SAIL_REACH + 2):
        for z in range(mill.HUB_Z - mill.SAIL_REACH - 2, mill.HUB_Z + mill.SAIL_REACH + 2):
            coordinates = mill.sail_coordinates(x + 0.5, z + 0.5 - mill.HUB_Z)
            for index, (along, across) in enumerate(coordinates):
                if along < 0 or not (-mill.STOCK_HALF <= across <= mill.STOCK_HALF + mill.SAIL_WIDTH):
                    continue
                # Uneven splinters along the broken edge, rather than a neat square cut.
                cutoff = lengths[index] + (int(across * 2) % 5 - 2)
                # A torn corner on the longer lower sail makes the loss obvious at game scale.
                torn = index == 3 and along > 27 and across > mill.STOCK_HALF + 8
                if along > cutoff or torn:
                    for y in range(mill.SAIL_FRONT, mill.SAIL_FRONT + mill.SAIL_DEPTH):
                        if grid.get(x, y, z) in sail_labels:
                            grid.set(x, y, z, EMPTY)
                break


def damage_structure(grid: VoxelGrid) -> None:
    """A splintered wall breach and missing sections of gallery and thatch."""
    # Gouge through the front-left weatherboards, with dark recessed wood behind it.
    for z in range(27, 40):
        for x in range(-18, -7):
            if abs(x + 13) + abs(z - 33) * 0.65 > 5 + (z % 3 == 0):
                continue
            for y in range(-32, -14):
                if grid.get(x, y, z) == mill.TOWER_LABEL:
                    grid.set(x, y, z, EMPTY)
            grid.set(x, -14, z, mill.HUB_LABEL)
    # Knock a jagged chunk out of the right side of the gallery.
    for x in range(19, 32):
        for y in range(-21, -3):
            for z in range(mill.GALLERY_Z, mill.GALLERY_Z + mill.GALLERY_THICKNESS):
                if x + y > 8 + (z % 2) and grid.get(x, y, z) == mill.GALLERY_LABEL:
                    grid.set(x, y, z, EMPTY)
    # Tear away the roof peak and irregular chunks of the thatch, exposing the rafters.
    # The varying cutoff leaves jagged, uneven fragments around the circumference.
    for x in range(-26, 27):
        for y in range(-26, 27):
            cutoff = 91 + ((x // 4 + y // 5) % 3) * 2
            if x > 4 and y < 5:
                cutoff -= 5
            for z in range(cutoff, 115):
                if grid.get(x, y, z) in (mill.CAP_LABEL, mill.FINIAL_LABEL):
                    grid.set(x, y, z, EMPTY)
            # Two wide tears run down the front of the roof, with splintered edges.
            for z in range(83, 98):
                left_tear = -13 <= x <= -6 and z >= 83 + (x + 13) // 2
                right_tear = 5 <= x <= 14 and z >= 84 + (14 - x) // 3
                if y < 6 and (left_tear or right_tear) and grid.get(x, y, z) == mill.CAP_LABEL:
                    grid.set(x, y, z, EMPTY)
    # Exposed broken rafters jut out of the torn roof; they also cradle the weapon.
    rod(grid, (-19, -9, 87), (-4, 4, 102), 1, DEBRIS)
    rod(grid, (18, -9, 86), (4, 4, 100), 1, DEBRIS)
    rod(grid, (-15, 13, 90), (3, 2, 102), 1, DEBRIS)
    rod(grid, (15, 12, 90), (1, -2, 101), 1, DEBRIS)
    rod(grid, (-13, -4, 94), (13, 3, 96), 1, DEBRIS)


def battlefield_remains(grid: VoxelGrid) -> None:
    """A fallen sail spar and a rack of spare crossbow bolts, instead of the mill's grain sacks."""
    # The heavy broken sail spar lies diagonally on the ground to the left of the mill.
    rod(grid, (-39, -29, 2), (-19, -40, 2), 2, DEBRIS)
    # Crossbars and a jagged splinter make it read as wreckage from the lattice sail.
    rod(grid, (-34, -32, 3), (-38, -39, 3), 1, TIMBER)
    rod(grid, (-25, -37, 3), (-28, -43, 3), 1, TIMBER)
    rod(grid, (-20, -40, 2), (-15, -43, 2), 0, DEBRIS)

    # Open-fronted wooden rack with three oversized upright bolts, silhouettes readable at game scale.
    grid.box(20, 36, -36, -26, 0, 3, TIMBER)
    grid.box(20, 23, -36, -26, 3, 11, TIMBER)
    grid.box(33, 36, -36, -26, 3, 11, TIMBER)
    grid.box(20, 36, -28, -26, 3, 11, TIMBER)
    grid.box(20, 36, -37, -35, 4, 7, IRON)
    for x, top in ((23, 25), (28, 31), (33, 24)):
        grid.box(x, x + 2, -35, -32, 7, top - 5, DEBRIS)
        # Broad steel arrowhead tapers to a point above a visible wooden shaft.
        for z in range(top - 5, top):
            half = 2 if z < top - 2 else 1
            grid.box(x + 1 - half, x + 1 + half, -35, -32, z, z + 1, AMMO)


def build_model() -> VoxelGrid:
    # Build the mill without its food-themed sacks; the ordinary windmill remains unchanged.
    grid = VoxelGrid()
    mill.build_tower(grid)
    mill.build_cap(grid)
    mill.build_sails(grid)
    damage_sails(grid)
    damage_structure(grid)
    battlefield_remains(grid)
    # The crossbow stock sits directly on the surviving rafters, pointing toward the camera (-y).
    grid.box(-3, 4, -19, 15, 102, 106, TIMBER)
    grid.box(-2, 3, -22, 13, 106, 108, IRON)
    # Curved steel prod: arms sweep back toward their tips. The taut string returns to the nut.
    for sign in (-1, 1):
        points = [(0, -12, 107), (sign * 12, -11, 107), (sign * 22, -6, 108), (sign * 27, 1, 109)]
        for a, b in zip(points, points[1:]):
            rod(grid, a, b, 1, IRON)
        rod(grid, points[-1], (0, 13, 108), 0, STRING)
    # Loaded bolt, with a broad, pale metal point at the front.
    grid.box(-1, 2, -27, 10, 108, 110, TIMBER)
    for y in range(-33, -26):
        half = max(1, (y + 33) // 2)
        grid.box(-half, half + 1, y, y + 1, 108, 111, BOLT)
    # Iron bands brace the wooden tower for recoil.
    for z in (22, 24, 52, 54):
        for x in range(-27, 28):
            for y in range(-27, 28):
                d = mill.octagon(x + 0.5, y + 0.5)
                r = mill.tower_apothem(z + 0.5)
                if r - 0.5 <= d <= r + 1:
                    grid.set(x, y, z, IRON)
    return grid


def shade(hit: Hit) -> tuple[int, int, int, int]:
    if hit.label == DEBRIS:
        return mill.WOOD[3] if mill.is_top(hit) else mill.WOOD[1] if hit.mx > 0 else mill.WOOD[2]
    if hit.label == TIMBER:
        return mill.WOOD[3] if mill.is_top(hit) else mill.WOOD[2] if hit.mx < 0 else mill.WOOD[1]
    if hit.label == IRON:
        return mill.IRON[3] if mill.is_top(hit) else mill.IRON[2] if hit.mx < 0 else mill.IRON[1]
    if hit.label in (BOLT, STRING, AMMO):
        return mill.IRON[3]
    return mill.shade(hit)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    if label >= TIMBER and other >= TIMBER:
        return None
    return mill.crack(label, other)


def footprint_shadow(x: float, y: float) -> float:
    """Shadow follows the mill, fallen spar and ammunition rack, not the airborne sails."""
    x, y = x - mill.SHADOW_OFFSET[0], y - mill.SHADOW_OFFSET[1]
    mill_distance = max(0, mill.octagon(x, y) - mill.PLINTH_APOTHEM) / mill.SHADOW_MARGIN
    rack_distance = max(20 - x, x - 36, -37 - y, y + 26, 0) / 3
    # Distance to the fallen spar's center line, with a small ground-level margin.
    ax, ay, bx, by = -39, -29, -19, -40
    t = max(0, min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)))
    spar_distance = max(0, math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay))) - 4) / 2
    return min(mill_distance, rack_distance, spar_distance)


def main() -> None:
    sprite = render(build_model(), 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), mill.SHADOW_JITTER,
                    shadow_shape=footprint_shadow)
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
