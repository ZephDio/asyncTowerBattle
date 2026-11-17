"""Shared voxel renderer for the pixel art generators (generate-*.py next to this file).

A sprite is modeled as voxels (x right, y away from the camera, z up, one voxel per pixel), then every pixel
casts a ray through an oblique camera looking down like the towers do. Each view turns the model around the
vertical axis. The generator shades every hit (usually from the normal estimated on the voxels around it),
then outlines and cracks are added in screen space. Labels are small ints chosen by the generator, 0 is empty.

Stdlib only, so the generators run with a bare python3.
"""

import math
import struct
import zlib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

Color = tuple[int, int, int, int]

# Camera: screen pixels per unit of depth and of height
DEPTH_SCALE = 0.7
HEIGHT_SCALE = 0.75
LIGHT = (-0.45, -0.35, 0.82)

OUTLINE: Color = (22, 28, 46, 255)
SHADOW: Color = (22, 28, 46, 80)
TRANSPARENT: Color = (0, 0, 0, 0)

EMPTY = 0
SHADOW_LABEL = -1

HALF_XY = 64
SIZE_Z = 144


def normalize(v: tuple[float, float, float]) -> tuple[float, float, float]:
    length = math.sqrt(sum(c * c for c in v)) or 1
    return (v[0] / length, v[1] / length, v[2] / length)


LIGHT_DIRECTION = normalize(LIGHT)


def bayer(x: int, y: int) -> float:
    """Ordered dithering threshold in 0..1, compare a fractional level to it."""
    matrix = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
    return (matrix[y % 4][x % 4] + 0.5) / 16


class VoxelGrid:
    """Labels on x in -half_x..half_x-1, y in -half_y..half_y-1 and z in 0..143.

    Raise `half_x` for pieces wider than one cell, e.g. 128 for a 256px wide sprite, and `half_y` for pieces
    deeper than one cell, e.g. 96 for a tall two-cell tower.
    """

    def __init__(self, half_x: int = HALF_XY, half_y: int = HALF_XY) -> None:
        self.half_x = half_x
        self.half_y = half_y
        self.voxels = bytearray(2 * half_x * 2 * half_y * SIZE_Z)

    def set(self, x: int, y: int, z: int, label: int) -> None:
        if -self.half_x <= x < self.half_x and -self.half_y <= y < self.half_y and 0 <= z < SIZE_Z:
            self.voxels[(z * 2 * self.half_y + y + self.half_y) * 2 * self.half_x + x + self.half_x] = label

    def get(self, x: int, y: int, z: int) -> int:
        if -self.half_x <= x < self.half_x and -self.half_y <= y < self.half_y and 0 <= z < SIZE_Z:
            return self.voxels[(z * 2 * self.half_y + y + self.half_y) * 2 * self.half_x + x + self.half_x]
        return EMPTY

    def box(self, x0: int, x1: int, y0: int, y1: int, z0: int, z1: int, label: int) -> None:
        for z in range(z0, z1):
            for y in range(y0, y1):
                for x in range(x0, x1):
                    self.set(x, y, z, label)


def view_to_model(yaw: float) -> Callable[[int, int], tuple[int, int]]:
    """Maps view voxel indices back to model voxel indices for a model turned by yaw degrees.

    The model's front faces -y (the camera). A positive yaw turns the front toward the right of the screen.
    """
    cos, sin = math.cos(math.radians(yaw)), math.sin(math.radians(yaw))

    def to_model(x: int, y: int) -> tuple[int, int]:
        cx, cy = x + 0.5, y + 0.5
        return math.floor(cos * cx + sin * cy), math.floor(-sin * cx + cos * cy)

    return to_model


@dataclass
class Hit:
    """A ray hit: view voxel (x, y, z), the same voxel in model coordinates (mx, my, z), and its label."""

    label: int
    x: int
    y: int
    z: int
    mx: int
    my: int
    lookup: Callable[[int, int, int], int]

    def normal(
        self,
        see_through: tuple[int, ...] = (EMPTY,),
        bevel: Callable[[int], float] | None = None,
    ) -> tuple[float, float, float]:
        """Points toward the see-through voxels in a 5x5x5 neighborhood.

        `bevel(neighbor)` gives a partial weight to other labels, e.g. another stone block, to round their edges.
        """
        nx = ny = nz = 0.0
        for dz in range(-2, 3):
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    neighbor = self.lookup(self.x + dx, self.y + dy, self.z + dz)
                    if neighbor in see_through:
                        weight = 1.0
                    elif bevel and neighbor != self.label:
                        weight = bevel(neighbor)
                    else:
                        continue
                    nx += dx * weight
                    ny += dy * weight
                    nz += dz * weight
        return normalize((nx, ny, nz)) if nx or ny or nz else (0.0, -0.6, 0.8)

    def light(self, normal: tuple[float, float, float]) -> float:
        """Lambert term in -1..1 for a top-left light."""
        return sum(n * l for n, l in zip(normal, LIGHT_DIRECTION))

    def neighbor(self, dx: int, dy: int, dz: int) -> int:
        """Label next to the hit, in view coordinates (dy -1 is toward the camera)."""
        return self.lookup(self.x + dx, self.y + dy, self.z + dz)


@dataclass
class Sprite:
    width: int
    height: int
    labels: list[list[int]] = field(init=False)
    depths: list[list[float]] = field(init=False)
    pixels: list[list[Color]] = field(init=False)

    def __post_init__(self) -> None:
        self.labels = [[EMPTY] * self.width for _ in range(self.height)]
        self.depths = [[0.0] * self.width for _ in range(self.height)]
        self.pixels = [[TRANSPARENT] * self.width for _ in range(self.height)]

    def label_at(self, x: int, y: int) -> int:
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.labels[y][x]
        return EMPTY


def render(
    grid: VoxelGrid,
    yaw: float,
    width: int,
    height: int,
    origin_y: float,
    shade: Callable[[Hit], Color],
    shadow_radii: tuple[float, float],
    shadow_jitter: float = 0,
    shadow_shape: Callable[[float, float], float] | None = None,
) -> Sprite:
    """Ray casts every pixel. `origin_y` is the screen row of the ground under the model center.

    Rays reaching the ground inside the model-space shadow get the shadow color. By default the shadow is an
    ellipse of `shadow_radii`; `shadow_shape(x, y)` replaces it with any shape fitting the piece's footprint
    (rectangle, parallelogram...), returning a normalized distance on the model ground, 1 or less inside.
    `shadow_jitter` (about 0.1-0.2) roughens the edge in 3x2px steps, like the stair-stepped shadows of the
    towers and houses.
    """

    def ellipse(x: float, y: float) -> float:
        return (x / shadow_radii[0]) ** 2 + (y / shadow_radii[1]) ** 2

    shape = shadow_shape or ellipse
    to_model = view_to_model(yaw)

    def lookup(x: int, y: int, z: int) -> int:
        mx, my = to_model(x, y)
        return grid.get(mx, my, z)

    sprite = Sprite(width, height)
    for py in range(height):
        sy = py + 0.5
        for px in range(width):
            ix = px - width // 2
            # On this ray, z = (origin_y - sy - y * DEPTH_SCALE) / HEIGHT_SCALE: start where it leaves the grid top
            y = max(-float(grid.half_y), (origin_y - sy - (SIZE_Z - 1) * HEIGHT_SCALE) / DEPTH_SCALE)
            while y < grid.half_y:
                z = (origin_y - sy - y * DEPTH_SCALE) / HEIGHT_SCALE
                if z < 0:
                    mx, my = to_model(ix, math.floor(y))
                    # Jitter in 3x2px blocks so the edge breaks into steps instead of a dithered fringe
                    cell = math.sin((px // 3) * 12.9898 + (py // 2) * 78.233) * 43758.5453
                    limit = 1 + shadow_jitter * (cell - math.floor(cell) - 0.5)
                    if shape(mx + 0.5, my + 0.5) <= limit:
                        sprite.labels[py][px] = SHADOW_LABEL
                        sprite.pixels[py][px] = SHADOW
                    break
                iy, iz = math.floor(y), math.floor(z)
                label = lookup(ix, iy, iz)
                if label:
                    mx, my = to_model(ix, iy)
                    sprite.labels[py][px] = label
                    sprite.depths[py][px] = y
                    sprite.pixels[py][px] = shade(Hit(label, ix, iy, iz, mx, my, lookup))
                    break
                y += 0.25
    return sprite


def outline(
    sprite: Sprite,
    crack: Callable[[int, int], Color | None] | None = None,
    depth_gap: float = 4,
    width: int = 2,
    depth_width: int = 2,
) -> None:
    """Outlines the silhouette and the pixels in front of a much farther part.

    With `width` 2, the default matching the tower and house art, the silhouette outline grows 1px outward over
    the transparent and shadow pixels. With `depth_width` 2, the farther side of a depth edge is outlined too;
    use 1 when thin parts (posts, stems) stand in front of a wall, or they turn into solid ink bars.

    `crack(label, neighbor)` can return a color for the seam between two labels at a similar depth; it is only
    checked against the right and bottom neighbors so seams stay 1px.
    """
    result = [row[:] for row in sprite.pixels]
    for y in range(sprite.height):
        for x in range(sprite.width):
            label = sprite.labels[y][x]
            neighbors = [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
            if label <= 0:
                if width >= 2 and any(sprite.label_at(nx, ny) > 0 for nx, ny in neighbors):
                    result[y][x] = OUTLINE
                continue
            if any(sprite.label_at(nx, ny) <= 0 for nx, ny in neighbors):
                result[y][x] = OUTLINE
                continue
            if any(sprite.depths[ny][nx] > sprite.depths[y][x] + depth_gap for nx, ny in neighbors):
                result[y][x] = OUTLINE
                continue
            if depth_width >= 2 and any(sprite.depths[ny][nx] <sprite.depths[y][x] - depth_gap for nx, ny in neighbors):
                result[y][x] = OUTLINE
                continue
            if crack:
                for nx, ny in neighbors[::2]:
                    other = sprite.labels[ny][nx]
                    if other != label and abs(sprite.depths[ny][nx] - sprite.depths[y][x]) <= depth_gap:
                        color = crack(label, other)
                        if color:
                            result[y][x] = color
                            break
    sprite.pixels = result


def write_png(path: Path, pixels: list[list[Color]]) -> None:
    height = len(pixels)
    width = len(pixels[0])
    raw = b"".join(b"\x00" + bytes(channel for pixel in row for channel in pixel) for row in pixels)

    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    )
