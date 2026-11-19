#!/usr/bin/env python3
"""Build a war-ready windmill with a mounted arbalest, using the windmill's voxel model.

Run from anywhere: python3 client/scripts/generate-windmill-turret.py
Writes public/resources/towers/windmill-turret.png. This is a visual resource, not a playable tower.
"""

import importlib.util
from pathlib import Path

from voxel_sprite import Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public/resources/towers/windmill-turret.png"
spec = importlib.util.spec_from_file_location("windmill", Path(__file__).with_name("generate-windmill.py"))
assert spec and spec.loader
mill = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mill)

WIDTH, HEIGHT, ORIGIN_Y = 104, 142, 106
PLATFORM, TIMBER, IRON, BOLT, STRING = range(40, 45)


def rod(grid: VoxelGrid, a: tuple[int, int, int], b: tuple[int, int, int], radius: int, label: int) -> None:
    """A continuous square-section beam between two model-space points."""
    steps = max(abs(v - u) for u, v in zip(a, b)) * 2
    for i in range(steps + 1):
        x, y, z = (round(u + (v - u) * i / steps) for u, v in zip(a, b))
        grid.box(x - radius, x + radius + 1, y - radius, y + radius + 1, z - radius, z + radius + 1, label)


def build_model() -> VoxelGrid:
    grid = mill.build_model()
    # A stout octagonal firing platform bolted onto the mill's roof.
    for x in range(-17, 18):
        for y in range(-17, 18):
            if mill.octagon(x + 0.5, y + 0.5) <= 16:
                grid.box(x, x + 1, y, y + 1, 107, 111, PLATFORM)
    # Pedestal and the crossbow's stock, pointing toward the camera (-y).
    grid.box(-3, 4, -2, 5, 111, 119, IRON)
    grid.box(-3, 4, -19, 15, 118, 122, TIMBER)
    grid.box(-2, 3, -22, 13, 122, 124, IRON)
    # Curved steel prod: arms sweep back toward their tips. The taut string returns to the nut.
    for sign in (-1, 1):
        points = [(0, -12, 123), (sign * 12, -11, 123), (sign * 22, -6, 124), (sign * 27, 1, 125)]
        for a, b in zip(points, points[1:]):
            rod(grid, a, b, 1, IRON)
        rod(grid, points[-1], (0, 13, 124), 0, STRING)
    # Loaded bolt, with a broad, pale metal point at the front.
    grid.box(-1, 2, -27, 10, 124, 126, TIMBER)
    for y in range(-33, -26):
        half = max(1, (y + 33) // 2)
        grid.box(-half, half + 1, y, y + 1, 124, 127, BOLT)
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
    if hit.label == PLATFORM:
        return mill.WOOD[3] if mill.is_top(hit) else mill.WOOD[1]
    if hit.label == TIMBER:
        return mill.WOOD[3] if mill.is_top(hit) else mill.WOOD[2] if hit.mx < 0 else mill.WOOD[1]
    if hit.label == IRON:
        return mill.IRON[3] if mill.is_top(hit) else mill.IRON[2] if hit.mx < 0 else mill.IRON[1]
    if hit.label in (BOLT, STRING):
        return mill.IRON[3]
    return mill.shade(hit)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    if label >= PLATFORM and other >= PLATFORM:
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
