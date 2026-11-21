#!/usr/bin/env python3
"""Generates the environment rock pixel art, its front view facing the camera.

Run from anywhere: python3 scripts/generate-rock.py [variant] [output.png]

Variants: peaks (the default, a jagged outcrop of three peaks with strata and cracks), ridge (a wider, lower
outcrop), mossbase (peaks with a touch of moss at the foot). Outputs public/resources/environment/rock.png, or the path given as argument.

Each rock is a convex polyhedron cut by random planes, so its faces stay flat and chunky like the gold mine's
boulders, in the same grey granite ramp (violet in the dark). Light comes from the top left. Strata bands run
across the faces, a few cracks fall from the peaks, and the ground shadow rims the footprint of the rocks. The
outcrop fills the canvas nearly edge to edge. It is modeled as
voxels and rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
import random
import sys
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "environment" / "rock.png"
# Square like the one cell resource: 22.9 image px per grid unit, like the Bosquet
WIDTH = 114
HEIGHT = 114
ORIGIN_Y = 82

# Grey granite, the mine's ramp (dark to light), leaning violet in the dark like the other ramps
ROCK = [(48, 46, 64, 255), (74, 72, 92, 255), (104, 102, 120, 255), (140, 138, 150, 255), (180, 178, 184, 255)]
# Moss, from the forest tile's leaves
MOSS = [(38, 58, 72, 255), (44, 94, 78, 255), (70, 136, 70, 255)]

# Rocks: center x, y, z, radii x, y, z, facets, seed. Back rocks first. The ellipsoid limit is loose so the cut planes
# leave sharp ridges and peaks instead of an egg
PEAKS = [
    (-2, 10, 36, 34, 27, 42, 14, 11),
    (-27, 4, 24, 25, 23, 29, 12, 4),
    (27, 5, 21, 25, 22, 25, 12, 19),
    (-36, -14, 9, 19, 15, 13, 9, 5),
    (34, -15, 8, 19, 14, 12, 9, 8),
]
RIDGE = [
    (-14, 8, 26, 34, 27, 32, 14, 6),
    (22, 6, 22, 31, 25, 27, 13, 2),
    (-38, -4, 12, 20, 18, 16, 10, 9),
    (-6, -16, 9, 28, 14, 12, 10, 13),
    (40, -14, 8, 17, 14, 11, 9, 8),
]
ELLIPSOID_LIMIT = 1.7
# Fits the outcrop inside the canvas, shadow included
SCALE = 0.98
SHADOW_MARGIN = 3
SHADOW_OFFSET = (0, -2)
# Strata: a darker seam every STRATA_PERIOD voxels of height, tilted a little and broken by noise
STRATA_PERIOD = 8
CRACK_SEEDS = [(-6, 70), (14, 62), (-30, 46), (28, 38)]


def hash01(*values: int) -> float:
    h = math.sin(sum(v * k for v, k in zip(values, (12.9898, 78.233, 37.719)))) * 43758.5453
    return h - math.floor(h)


def build_planes(facets: int, seed: int) -> list[tuple[float, float, float, float]]:
    rng = random.Random(seed)
    planes = []
    for _ in range(facets):
        # Bias the facets upward and toward the camera, where they show
        theta = rng.uniform(0, 2 * math.pi)
        nz = rng.uniform(-0.15, 1)
        r = math.sqrt(1 - nz * nz)
        planes.append((r * math.cos(theta), r * math.sin(theta), nz, rng.uniform(0.72, 0.9)))
    for direction in [(1, 0, 0), (-1, 0, 0), (0, -1, 0), (0, 1, 0), (0, 0, 1)]:
        planes.append((*direction, 1.04))
    return planes


def build_model(rocks: list[tuple], scale: float = 1.0) -> VoxelGrid:
    grid = VoxelGrid()
    for index, (cx, cy, cz, rx, ry, rz, facets, seed) in enumerate(rocks):
        cx, cy, cz, rx, ry, rz = (v * SCALE * scale for v in (cx, cy, cz, rx, ry, rz))
        planes = build_planes(facets, seed)
        for z in range(max(0, int(cz - rz) - 1), int(cz + rz) + 2):
            for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
                for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                    q = ((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry, (z + 0.5 - cz) / rz)
                    if z >= 0 and q[0] ** 2 + q[1] ** 2 + q[2] ** 2 <= ELLIPSOID_LIMIT and all(q[0] * a + q[1] * b + q[2] * c <= d for a, b, c, d in planes):
                        if grid.get(x, y, z) == EMPTY:
                            grid.set(x, y, z, 1 + index)
    return grid


def near_polyline(px: float, py: float, line: list[tuple[float, float]], width: float) -> bool:
    for (ax, ay), (bx, by) in zip(line, line[1:]):
        dx, dy = bx - ax, by - ay
        t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        if math.hypot(px - ax - t * dx, py - ay - t * dy) <= width:
            return True
    return False


def make_cracks() -> list[list[tuple[float, float]]]:
    """Cracks as random walks falling from the seeds, polylines in (x, z)."""
    rng = random.Random(5)
    cracks = []
    for x, z in CRACK_SEEDS:
        x, z = x * SCALE, z * SCALE
        line = [(float(x), float(z))]
        for _ in range(4):
            x += rng.uniform(-4, 4)
            z -= rng.uniform(4, 8)
            line.append((x, z))
        cracks.append(line)
    return cracks


def make_shade(cracks: list, moss: bool):
    def shade(hit: Hit) -> tuple[int, int, int, int]:
        mx, my, z = hit.mx, hit.my, hit.z
        normal = hit.normal(bevel=lambda _: 0.2)
        light = hit.light(normal)
        top = normal[2] > 0.55
        index = 3 if top else 0 if light < -0.3 else 1 if light < 0.15 else 2 if light < 0.55 else 3
        if top and light > 0.8:
            index = 4
        # Strata: tilted seams a step darker, broken where the noise says so, and a pale band above each
        if not top:
            layer = z + mx * 0.12 + 3 * hash01(mx // 10, 3, 7)
            phase = layer % STRATA_PERIOD
            if phase < 1.2 and hash01(mx // 5, int(layer // STRATA_PERIOD), 1) > 0.3:
                index -= 1
            elif phase < 2.4 and index >= 2 and hash01(mx // 7, int(layer // STRATA_PERIOD), 2) > 0.6:
                index += 1
        elif hash01(mx // 3, my // 3, z // 3) < 0.07:
            index -= 1
        if normal[1] < -0.2 and index >= 2:
            for line in cracks:
                if near_polyline(mx + 0.5, z + 0.5, line, 0.7):
                    return ROCK[0]
        if moss and z < 9 and normal[2] > 0.3:
            patch = math.sin(mx * 0.45) + math.sin(mx * 0.17 + my * 0.3) + hash01(mx // 2, my // 2, 4)
            if patch > 1.15:
                return MOSS[2 if light > 0.5 else 1]
        return ROCK[max(0, min(4, index))]

    return shade


def crack(label: int, neighbor: int) -> tuple[int, int, int, int] | None:
    return ROCK[0] if label != neighbor else None


def footprint_shadow(grid: VoxelGrid):
    """L1 distance from the rock columns, in units of the margin, offset toward the camera."""
    from collections import deque

    distance: dict[tuple[int, int], int] = {}
    queue: deque[tuple[int, int]] = deque()
    for y in range(-grid.half_y, grid.half_y):
        for x in range(-grid.half_x, grid.half_x):
            if any(grid.get(x, y, z) != EMPTY for z in range(0, 5)):
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
    variant = sys.argv[1] if len(sys.argv) > 1 else "peaks"
    output = Path(sys.argv[2]) if len(sys.argv) > 2 else OUTPUT
    grid = build_model(RIDGE, 0.94) if variant == "ridge" else build_model(PEAKS)
    shade = make_shade(make_cracks(), moss=variant == "mossbase")
    # shadow_radii is ignored, the footprint shadow replaces it
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), 0.3, footprint_shadow(grid))
    outline(sprite, crack, depth_gap=5, depth_width=1)
    write_png(output, sprite.pixels)
    print(f"wrote {output}")


if __name__ == "__main__":
    main()
