#!/usr/bin/env python3
"""Generates the wooden fence around the shop offers (src/shared/traits/render/fence.ts).

Run from anywhere: python3 scripts/generate-fence.py [full.png]

With a path, it also writes the whole sample fence there, for a preview.

A rail fence seen from the towers' camera: square posts with a lit top and two rails between them, modeled as voxels
and rendered by voxel_sprite.py like the constructs, with the tower wood ramp, the 2px ink outline and a small ground
shadow. One art pixel is as big as the grass's (48 per grid cell, ART_PIXELS_PER_CELL in retail-grid.ts), so the fence
sits on the grass like the pieces do.

A sample fence of BAYS_X x BAYS_Y bays is rendered, then cut in nine pieces that fence.ts stretches to any size, like
the scroll and the wood panel, in public/resources/hud/fence/:
- top-left.png, top-right.png, bottom-left.png, bottom-right.png: the corners, with their corner post and the start
  of both rails.
- top.png, bottom.png: one bay of the back and front fences, centered on a post, BAY_X pixels wide. They repeat.
- left.png, right.png: one bay of the side fences, BAY_Y * DEPTH_SCALE pixels tall. They repeat.
The middle is the enclosed ground, left to the grass.

The fence's ground line (the middle of its posts) is the enclosed rectangle. It prints where that rectangle's corners
sit in the corner pieces: FENCE_INSET in fence.ts must match.
"""

import sys
from pathlib import Path

from voxel_sprite import DEPTH_SCALE, EMPTY, OUTLINE, Hit, VoxelGrid, outline, render, write_png

OUT = Path(__file__).resolve().parents[1] / "public" / "resources" / "hud" / "fence"

# Tower wood, dark to light, and the ink between parts.
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]

# Bays: distance between posts in voxels. Along y, BAY_Y * DEPTH_SCALE must be a whole number of pixels.
BAY_X = 32
BAY_Y = 40
BAYS_X = 5
BAYS_Y = 4
POST = 7
POST_HEIGHT = 26
RAIL_THICKNESS = 3
# Bottom and top of each rail.
RAILS = ((5, 9), (17, 21))
SHADOW_MARGIN = 1.5
SHADOW_OFFSET = 1
MARGIN = 8

HALF_W = BAYS_X * BAY_X // 2
HALF_D = BAYS_Y * BAY_Y // 2
WIDTH = 2 * (HALF_W + MARGIN)
ORIGIN_Y = round(HALF_D * DEPTH_SCALE) + POST_HEIGHT
HEIGHT = ORIGIN_Y + round(HALF_D * DEPTH_SCALE) + MARGIN

POST_LABEL, RAIL_X, RAIL_Y = 1, 2, 3


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def posts():
    half = POST // 2
    xs = [-HALF_W + i * BAY_X for i in range(BAYS_X + 1)]
    ys = [-HALF_D + j * BAY_Y for j in range(BAYS_Y + 1)]
    for x in xs:
        for y in (-HALF_D, HALF_D):
            yield x - half, x - half + POST, y - half, y - half + POST
    for y in ys[1:-1]:
        for x in (-HALF_W, HALF_W):
            yield x - half, x - half + POST, y - half, y - half + POST


def build_model() -> VoxelGrid:
    grid = VoxelGrid(half_x=HALF_W + MARGIN, half_y=HALF_D + MARGIN)
    half = RAIL_THICKNESS // 2
    for z0, z1 in RAILS:
        for y in (-HALF_D, HALF_D):
            grid.box(-HALF_W, HALF_W, y - half, y - half + RAIL_THICKNESS, z0, z1, RAIL_X)
        for x in (-HALF_W, HALF_W):
            grid.box(x - half, x - half + RAIL_THICKNESS, -HALF_D, HALF_D, z0, z1, RAIL_Y)
    for x0, x1, y0, y1 in posts():
        grid.box(x0, x1, y0, y1, 0, POST_HEIGHT, POST_LABEL)
        # A chamfered cap: the top voxel row is one voxel in on every side
        grid.box(x0, x1, y0, y1, POST_HEIGHT - 1, POST_HEIGHT, EMPTY)
        grid.box(x0 + 1, x1 - 1, y0 + 1, y1 - 1, POST_HEIGHT - 1, POST_HEIGHT, POST_LABEL)
    return grid


def shade(hit: Hit) -> tuple[int, int, int, int]:
    top = hit.neighbor(0, 0, 1) == EMPTY
    if hit.label == POST_LABEL:
        if top:
            return WOOD[3]
        local = (hit.mx + POST // 2) % BAY_X
        # Grain: a dark streak down part of the front face, and the cap's lip in shade
        if hit.z >= POST_HEIGHT - 2:
            return WOOD[2]
        if local in (1, 4) and noise(hit.mx // BAY_X, hit.my // BAY_Y, local, hit.z // 6) > 0.45:
            return WOOD[1]
        return WOOD[2]
    if top:
        return WOOD[3]
    along = hit.mx % BAY_X if hit.label == RAIL_X else hit.my % BAY_Y
    z0 = next(z0 for z0, z1 in RAILS if z0 <= hit.z < z1)
    # The rail's lower edge is in its own shade; grain streaks run along it
    if hit.z == z0:
        return WOOD[1]
    if hit.z == z0 + 2 and noise(along // 7, z0, hit.label) > 0.5:
        return WOOD[1]
    return WOOD[2]


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    """Ink where a rail goes into a post."""
    return OUTLINE if POST_LABEL in (label, other) else None


def shadow(x: float, y: float) -> float:
    """Distance outside the fence lines, in units of the margin, shifted toward the camera."""
    y += SHADOW_OFFSET
    dx = max(0.0, abs(abs(x) - HALF_W) - POST / 2) if abs(y) <= HALF_D else 1e9
    dy = max(0.0, abs(abs(y) - HALF_D) - POST / 2) if abs(x) <= HALF_W else 1e9
    corner = max(abs(abs(x) - HALF_W), abs(abs(y) - HALF_D)) - POST / 2
    return max(0.0, min(dx, dy, max(0.0, corner))) / SHADOW_MARGIN


def crop(pixels, x, y, w, h):
    return [row[x : x + w] for row in pixels[y : y + h]]


def main():
    sprite = render(build_model(), 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), shadow_shape=shadow)
    outline(sprite, crack, depth_gap=4, depth_width=1)
    pixels = sprite.pixels

    # The enclosed rectangle on screen: the ground line of the fence.
    left = WIDTH // 2 - HALF_W
    right = WIDTH // 2 + HALF_W
    top = ORIGIN_Y - round(HALF_D * DEPTH_SCALE)
    bottom = ORIGIN_Y + round(HALF_D * DEPTH_SCALE)
    period_y = round(BAY_Y * DEPTH_SCALE)

    # Cut where the image already repeats: half a bay past the corner posts across, past the back fence down.
    col0 = left + BAY_X // 2
    col1 = col0 + BAY_X
    row0 = top + POST
    row1 = row0 + period_y
    # The front fence rises above its ground line: start its pieces a whole number of bays down.
    front_top = bottom - POST_HEIGHT - POST
    row2 = row1 + period_y * ((front_top - row1) // period_y)
    col2 = col1 + BAY_X * ((right - BAY_X // 2 - col1) // BAY_X)

    pieces = {
        "top-left": crop(pixels, 0, 0, col0, row0),
        "top": crop(pixels, col0, 0, BAY_X, row0),
        "top-right": crop(pixels, col2, 0, WIDTH - col2, row0),
        "left": crop(pixels, 0, row0, col0, period_y),
        "right": crop(pixels, col2, row0, WIDTH - col2, period_y),
        "bottom-left": crop(pixels, 0, row2, col0, HEIGHT - row2),
        "bottom": crop(pixels, col0, row2, BAY_X, HEIGHT - row2),
        "bottom-right": crop(pixels, col2, row2, WIDTH - col2, HEIGHT - row2),
    }
    OUT.mkdir(parents=True, exist_ok=True)
    for name, piece in pieces.items():
        write_png(OUT / f"{name}.png", piece)
        print(f"wrote {(OUT / f'{name}.png').relative_to(OUT.parents[3])} ({len(piece[0])}x{len(piece)})")
    if len(sys.argv) > 1:
        write_png(Path(sys.argv[1]), pixels)
    print(f"FENCE_INSET = {{ left: {left}, top: {top}, right: {WIDTH - right}, bottom: {HEIGHT - bottom} }}")


if __name__ == "__main__":
    main()
