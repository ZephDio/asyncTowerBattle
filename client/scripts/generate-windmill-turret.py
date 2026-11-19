#!/usr/bin/env python3
"""Build a war-ready windmill with a mounted arbalest, using the windmill's voxel model.

Run from anywhere: python3 client/scripts/generate-windmill-turret.py
Writes public/resources/towers/windmill-turret.png. This is a visual resource, not a playable tower.
"""

import importlib.util
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public/resources/towers/windmill-turret.png"
spec = importlib.util.spec_from_file_location("windmill", Path(__file__).with_name("generate-windmill.py"))
assert spec and spec.loader
mill = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mill)

WIDTH, HEIGHT, ORIGIN_Y = 104, 142, 106
TIMBER, IRON, BOLT, STRING, DEBRIS = range(40, 45)


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


def build_model() -> VoxelGrid:
    grid = mill.build_model()
    damage_sails(grid)
    damage_structure(grid)
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
    if hit.label in (BOLT, STRING):
        return mill.IRON[3]
    return mill.shade(hit)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    if label >= TIMBER and other >= TIMBER:
        return None
    return mill.crack(label, other)


def main() -> None:
    sprite = render(build_model(), 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), mill.SHADOW_JITTER,
                    shadow_shape=mill.footprint_shadow)
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
