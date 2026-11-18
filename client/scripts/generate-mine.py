#!/usr/bin/env python3
"""Generates the gold mine totem pixel art, its front view facing the camera.

Run from anywhere: python3 scripts/generate-mine.py [output.png]

Outputs public/resources/totem/mine.png, or the path given as argument.

A mound of faceted grey boulders flecked with gold, with a timber framed tunnel dug in its front. Rails come out of
the dark tunnel toward the camera and carry a minecart heaped with gold nuggets. It is modeled as voxels and rendered
by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
import random
import sys
from collections import deque
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "mine.png"
WIDTH = 120
HEIGHT = 120
ORIGIN_Y = 75

# Ramps from dark to light
ROCK = [(48, 46, 64, 255), (74, 72, 92, 255), (104, 102, 120, 255), (140, 138, 150, 255), (180, 178, 184, 255)]
GOLD = [(124, 76, 38, 255), (184, 126, 50, 255), (226, 176, 74, 255), (246, 216, 120, 255)]
IRON = [(38, 42, 58, 255), (58, 64, 86, 255), (84, 92, 116, 255), (120, 128, 152, 255)]
# Wood shared with the towers and houses
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
# Inside of the tunnel, darkest at the back
DARK = [(26, 22, 34, 255), (40, 34, 48, 255), (56, 48, 62, 255)]

# Boulders: center x, y, z, radii x, y, z. Each is a convex polyhedron cut by random planes, so faces stay flat
BOULDERS = [
    (0, 10, 30, 30, 26, 34),
    (-28, 4, 18, 22, 22, 22),
    (28, 6, 18, 22, 22, 22),
    (-14, 22, 44, 20, 18, 20),
    (16, 20, 40, 18, 18, 20),
    (-40, -10, 8, 13, 13, 11),
    (40, -8, 9, 14, 14, 12),
    (-26, -16, 10, 12, 12, 12),
]
FACETS = 11
SEED = 7
# Share of the rock surface flecked with gold, in 3 voxel cells
GOLD_FLECKS = 0.03
FLECK_CELL = 4

# Tunnel dug into the mound and its timber frame
TUNNEL_HALF_X = 14
TUNNEL_HEIGHT = 26
ARCH_RISE = 8
TUNNEL_BACK_Y = 6
FRAME_Y = (-30, -24)
POST_WIDTH = 5
LINTEL = (TUNNEL_HEIGHT + ARCH_RISE, TUNNEL_HEIGHT + ARCH_RISE + 6)
LINTEL_HALF_X = TUNNEL_HALF_X + POST_WIDTH + 4

# Rails: x of each rail center, from the tunnel back to the front end
RAIL_X = 6
RAIL_FRONT_Y = -60
SLEEPER_SPACING = 7

# Minecart parked beside the rails: center x, y range, half widths at the bottom and top, height
CART_X = 34
CART_Y = (-46, -32)
CART_HALF_X = (10, 13)
CART_BOTTOM = 3
CART_TOP = 17
GOLD_HEAP = 8

# Pickaxe leaning on the rock left of the tunnel: handle foot and top (x, y, z), head half length
PICK_FOOT = (-38, -40, 0)
PICK_TOP = (-28, -30, 30)
PICK_HEAD_HALF = 10

SHADOW_MARGIN = 3
SHADOW_OFFSET = (0, -2)

TUNNEL_BACK, FRAME, LINTEL_LABEL, RAIL, SLEEPER, CART, CART_IRON, NUGGET, WHEEL, HANDLE, PICK_HEAD = range(1, 12)
BOULDER = 20


def build_boulders() -> list[tuple[tuple[float, ...], list[tuple[float, float, float, float]]]]:
    rng = random.Random(SEED)
    boulders = []
    for center in BOULDERS:
        planes = []
        for _ in range(FACETS):
            # Bias the facets upward and toward the camera, where they show
            theta = rng.uniform(0, 2 * math.pi)
            nz = rng.uniform(-0.2, 1)
            r = math.sqrt(1 - nz * nz)
            planes.append((r * math.cos(theta), r * math.sin(theta), nz, rng.uniform(0.82, 1)))
        for direction in [(1, 0, 0), (-1, 0, 0), (0, -1, 0), (0, 1, 0), (0, 0, 1)]:
            planes.append((*direction, 1.05))
        boulders.append((center, planes))
    return boulders


def in_tunnel(x: float, y: float, z: float) -> bool:
    if y > TUNNEL_BACK_Y or abs(x) >= TUNNEL_HALF_X:
        return False
    return z < TUNNEL_HEIGHT + ARCH_RISE * math.sqrt(max(0, 1 - (x / TUNNEL_HALF_X) ** 2))


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    for index, ((cx, cy, cz, rx, ry, rz), planes) in enumerate(build_boulders()):
        for z in range(max(0, int(cz - rz) - 1), int(cz + rz) + 2):
            for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
                for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                    q = ((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry, (z + 0.5 - cz) / rz)
                    if all(q[0] * a + q[1] * b + q[2] * c <= d for a, b, c, d in planes):
                        if grid.get(x, y, z) == EMPTY:
                            grid.set(x, y, z, BOULDER + index)

    for z in range(0, LINTEL[1] + 2):
        for y in range(-64, TUNNEL_BACK_Y + 1):
            for x in range(-TUNNEL_HALF_X, TUNNEL_HALF_X):
                if in_tunnel(x + 0.5, y + 0.5, z + 0.5):
                    grid.set(x, y, z, EMPTY)
    grid.box(-TUNNEL_HALF_X, TUNNEL_HALF_X, TUNNEL_BACK_Y, TUNNEL_BACK_Y + 3, 0, LINTEL[0], TUNNEL_BACK)
    grid.box(-TUNNEL_HALF_X, TUNNEL_HALF_X, FRAME_Y[0], TUNNEL_BACK_Y, 0, 1, TUNNEL_BACK)
    # Clear the rock in front of the frame so it stands out of the mound
    grid.box(-LINTEL_HALF_X, LINTEL_HALF_X, -64, FRAME_Y[0], 0, LINTEL[0], EMPTY)

    for side in (-1, 1):
        x0 = TUNNEL_HALF_X if side > 0 else -TUNNEL_HALF_X - POST_WIDTH
        grid.box(x0, x0 + POST_WIDTH, FRAME_Y[0], FRAME_Y[1], 0, LINTEL[0], FRAME)
    grid.box(-LINTEL_HALF_X, LINTEL_HALF_X, FRAME_Y[0] - 1, FRAME_Y[1] + 1, LINTEL[0], LINTEL[1], LINTEL_LABEL)

    for y in range(RAIL_FRONT_Y, TUNNEL_BACK_Y, SLEEPER_SPACING):
        grid.box(-RAIL_X - 4, RAIL_X + 4, y, y + 3, 0, 1, SLEEPER)
    for side in (-1, 1):
        grid.box(side * RAIL_X - 1, side * RAIL_X + 1, RAIL_FRONT_Y, TUNNEL_BACK_Y, 1, 3, RAIL)

    build_cart(grid)
    build_pickaxe(grid)
    return grid


def build_cart(grid: VoxelGrid) -> None:
    y0, y1 = CART_Y
    for z in range(CART_BOTTOM, CART_TOP):
        t = (z - CART_BOTTOM) / (CART_TOP - CART_BOTTOM)
        half = round(CART_HALF_X[0] + (CART_HALF_X[1] - CART_HALF_X[0]) * t)
        inset = round(2 * (1 - t))
        band = z in (CART_BOTTOM + 3, CART_TOP - 3, CART_TOP - 2)
        for y in range(y0 + inset, y1 - inset):
            for x in range(-half, half):
                wall = x in (-half, half - 1) or y in (y0 + inset, y1 - inset - 1) or z == CART_BOTTOM
                if wall or z < CART_BOTTOM + 2:
                    grid.set(CART_X + x, y, z, CART_IRON if band or abs(x) >= half - 1 and abs(y - (y0 + y1) / 2) > 5 else CART)
    # Heap of nuggets: a dome over the cart opening
    cy = (y0 + y1) / 2
    for z in range(CART_TOP - 2, CART_TOP + GOLD_HEAP):
        for y in range(y0 + 1, y1 - 1):
            for x in range(-CART_HALF_X[1] + 1, CART_HALF_X[1] - 1):
                d = (x / (CART_HALF_X[1] + 1)) ** 2 + ((y - cy) / ((y1 - y0) / 2 + 1)) ** 2
                lump = 1.5 * math.sin(x * 1.3) * math.cos(y * 1.1)
                if z - (CART_TOP - 2) < (GOLD_HEAP + 2) * (1 - d) + lump:
                    grid.set(CART_X + x, y, z, NUGGET)
    for side in (-1, 1):
        for wy in (y0 + 4, y1 - 4):
            for y in range(wy - 4, wy + 4):
                for z in range(0, 8):
                    if (y + 0.5 - wy) ** 2 + (z + 0.5 - 4) ** 2 <= 16:
                        grid.box(CART_X + side * CART_HALF_X[0] - (2 if side > 0 else 0), CART_X + side * CART_HALF_X[0] + (0 if side > 0 else 2), y, y + 1, z, z + 1, WHEEL)


def build_pickaxe(grid: VoxelGrid) -> None:
    steps = 80
    for i in range(steps + 1):
        t = i / steps
        x, y, z = (PICK_FOOT[k] + (PICK_TOP[k] - PICK_FOOT[k]) * t for k in range(3))
        grid.box(math.floor(x) - 1, math.floor(x) + 2, math.floor(y) - 1, math.floor(y) + 2, math.floor(z), math.floor(z) + 2, HANDLE)
    # The head crosses the handle top, perpendicular to it in the x z plane, and curves down at both tips
    hx, hy, hz = PICK_TOP
    dx, dz = PICK_TOP[0] - PICK_FOOT[0], PICK_TOP[2] - PICK_FOOT[2]
    length = math.hypot(dx, dz)
    ux, uz = dz / length, -dx / length
    for i in range(-PICK_HEAD_HALF * 4, PICK_HEAD_HALF * 4 + 1):
        s = i / 4
        bend = -0.05 * s * s
        x = hx + ux * s + dx / length * bend
        z = hz + uz * s + dz / length * bend
        thick = 2 if abs(s) < PICK_HEAD_HALF - 3 else 1
        grid.box(math.floor(x) - thick + 1, math.floor(x) + thick, hy - 2, hy + 1, math.floor(z) - thick + 1, math.floor(z) + thick, PICK_HEAD)


def hash01(*values: int) -> float:
    h = math.sin(sum(v * k for v, k in zip(values, (12.9898, 78.233, 37.719)))) * 43758.5453
    return h - math.floor(h)


def ramp_index(light: float, top: bool, steps: int) -> int:
    if top:
        return steps - 1
    return 0 if light < -0.3 else 1 if light < 0.2 else 2 if light < 0.6 or steps < 5 else 3


def shade(hit: Hit) -> tuple[int, int, int, int]:
    label, mx, my, z = hit.label, hit.mx, hit.my, hit.z
    top = hit.neighbor(0, 0, 1) == EMPTY

    if label >= BOULDER:
        if abs(mx) <= TUNNEL_HALF_X + 1 and my > FRAME_Y[0] and in_tunnel(mx + 0.5, FRAME_Y[1], z - 1.5):
            return DARK[1] if my < FRAME_Y[1] + 6 else DARK[0]
        normal = hit.normal(bevel=lambda _: 0.35)
        light = hit.light(normal)
        index = 0 if light < -0.35 else 1 if light < 0.1 else 2 if light < 0.5 else 3 if light < 0.85 else 4
        if hash01(mx // FLECK_CELL, my // FLECK_CELL, z // FLECK_CELL) < GOLD_FLECKS and index >= 2:
            return GOLD[min(3, index)]
        return ROCK[index]

    if label == TUNNEL_BACK:
        return DARK[0]

    if label in (RAIL, SLEEPER) and my > FRAME_Y[0]:
        return DARK[2] if label == RAIL else DARK[1]

    if label == NUGGET:
        light = hit.light(hit.normal())
        # Nuggets are 3 voxel cells, each a little brighter or darker than its neighbors
        cell = hash01(mx // 3, my // 3, z // 3)
        index = 1 if light < 0 else 2 if light < 0.55 else 3
        if cell < 0.2:
            index -= 1
        elif cell > 0.85:
            index = min(3, index + 1)
        return GOLD[max(0, index)]

    if label in (RAIL, CART_IRON, WHEEL, PICK_HEAD):
        light = hit.light(hit.normal())
        return IRON[3 if top else 0 if light < -0.2 else 1 if light < 0.3 else 2]

    light = hit.light(hit.normal())
    if top:
        return WOOD[3]
    index = 0 if light < -0.2 else 1 if light < 0.35 else 2
    # Grain: vertical streaks on posts and cart planks, horizontal on the lintel and sleepers
    if label in (FRAME, CART) and index == 2 and hash01(mx, 0, z // 6) < 0.2:
        index = 1
    if label in (LINTEL_LABEL, SLEEPER) and index == 2 and hash01(0, my, z // 2 + mx // 8) < 0.15:
        index = 1
    if label == CART and (z - CART_BOTTOM) % 5 == 0:
        index = 0
    return WOOD[index]


def crack(label: int, neighbor: int) -> tuple[int, int, int, int] | None:
    return ROCK[0] if label >= BOULDER and neighbor >= BOULDER else None


def footprint_shadow(grid: VoxelGrid):
    """L1 distance from the mound and cart columns, in units of the margin, offset toward the camera."""
    distance: dict[tuple[int, int], int] = {}
    queue: deque[tuple[int, int]] = deque()
    for y in range(-grid.half_y, grid.half_y):
        for x in range(-grid.half_x, grid.half_x):
            if any(grid.get(x, y, z) >= BOULDER or grid.get(x, y, z) in (CART, CART_IRON, WHEEL) for z in range(0, 6)):
                distance[(x, y)] = 0
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        d = distance[(x, y)]
        if d >= SHADOW_MARGIN:
            continue
        for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if n not in distance:
                distance[n] = d + 1
                queue.append(n)

    def shape(x: float, y: float) -> float:
        key = (math.floor(x - SHADOW_OFFSET[0]), math.floor(y - SHADOW_OFFSET[1]))
        return distance[key] / SHADOW_MARGIN if key in distance else 2

    return shape


def main() -> None:
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else OUTPUT
    grid = build_model()
    # shadow_radii is ignored, the footprint shadow replaces it
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), 0.3, footprint_shadow(grid))
    outline(sprite, crack, depth_gap=5, depth_width=1)
    write_png(output, sprite.pixels)
    print(f"wrote {output}")


if __name__ == "__main__":
    main()
