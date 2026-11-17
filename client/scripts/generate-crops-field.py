#!/usr/bin/env python3
"""Generates the crops field (wheat field) pixel art.

Run from anywhere: python3 scripts/generate-crops-field.py

Outputs public/resources/totem/crops-field.png, the single front view.

A square bed of tilled soil framed by wooden planks, with a few long rows of ripe wheat. It follows the tower and
house art (see the pixel-art-assets skill) at the same detail level: a handful of big masses rather than many small
plants. Each row is one band treated like the house thatch: lit top, vertical strands, chunky spikes along the top
edge and a dark contact shadow at its base, with 1px ink between rows and a 2px outline around the piece.
It is modeled as voxels and rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

from pathlib import Path

from voxel_sprite import EMPTY, OUTLINE, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "crops-field.png"
WIDTH = 110
HEIGHT = 92
ORIGIN_Y = 52

# Ramps from dark to light. Wood is shared with the towers; the wheat runs from the thatch mauve through the wood
# to the thatch cream, so it reads as straw like the house roof while staying apart from the frame
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
SOIL = [(58, 44, 58, 255), (78, 58, 62, 255), (104, 76, 70, 255)]
WHEAT = [(94, 71, 78, 255), (138, 103, 99, 255), (180, 131, 85, 255), (218, 181, 112, 255), (245, 239, 169, 255)]

HALF_SIZE = 50
FRAME_WIDTH = 4
FRAME_HEIGHT = 8
SOIL_HEIGHT = 4
ROWS = 4
# Gap between a row end and the frame, in voxels
ROW_MARGIN = 3
ROW_HEIGHT = 20
# Half depth of a row at its base and at its top: rows flare out like a bundle
ROW_HALF_DEPTH = (3, 7)
# The top edge: spikes 2-3 voxels wide, one every few voxels, up to this tall
SPIKE_WIDTH = (2, 3)
SPIKE_HEIGHT = 5
# Fraction of the row height in contact shadow at its base, where the stems show
BASE_SHADE = 0.3
# The framed bed is low and square, so it casts a square shadow barely past the frame, shifted away from the
# top-left light: margin past the frame and offset toward the right and the camera, in voxels
SHADOW_MARGIN = 2
SHADOW_OFFSET = (1, -2)
# Jitter is relative to the shadow half size, about 1-2 voxels at the edge
SHADOW_JITTER = 0.04
# Ignored by the renderer since shadow_shape replaces the ellipse
SHADOW_RADII = (1, 1)

FRAME, SOIL_LABEL = 1, 2
# One label per row so neighbor rows get an ink seam between them
ROW_LABELS = range(10, 10 + ROWS)


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def row_tops(row: int, x0: int, x1: int) -> dict[int, int]:
    """Height of each column along a row: a slightly wavy top cut into chunky spikes, rounded at both ends."""
    tops = {}
    x = x0
    spike = 0
    while x < x1:
        width = SPIKE_WIDTH[0] + round(noise(row, spike, 1) * (SPIKE_WIDTH[1] - SPIKE_WIDTH[0]))
        rise = round(noise(row, spike, 2) * SPIKE_HEIGHT)
        for column in range(x, min(x + width, x1)):
            end = min(column - x0, x1 - 1 - column)
            tops[column] = ROW_HEIGHT + rise - max(0, 6 - end)
        x += width
        spike += 1
    return tops


def build_model() -> VoxelGrid:
    grid = VoxelGrid()
    inner = HALF_SIZE - FRAME_WIDTH
    grid.box(-HALF_SIZE, HALF_SIZE, -HALF_SIZE, HALF_SIZE, 0, FRAME_HEIGHT, FRAME)
    grid.box(-inner, inner, -inner, inner, 0, FRAME_HEIGHT, EMPTY)
    grid.box(-inner, inner, -inner, inner, 0, SOIL_HEIGHT, SOIL_LABEL)

    spacing = 2 * inner / ROWS
    x0, x1 = -inner + ROW_MARGIN, inner - ROW_MARGIN
    for row, label in enumerate(ROW_LABELS):
        cy = round(-inner + spacing * (row + 0.5))
        for x, top in row_tops(row, x0, x1).items():
            for z in range(SOIL_HEIGHT, SOIL_HEIGHT + top):
                t = (z - SOIL_HEIGHT) / ROW_HEIGHT
                half = round(ROW_HALF_DEPTH[0] + (ROW_HALF_DEPTH[1] - ROW_HALF_DEPTH[0]) * min(1.0, t * 1.5))
                grid.box(x, x + 1, cy - half, cy + half, z, z + 1, label)
    return grid


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    """Ink between parts: one row and the next, the soil and the frame."""
    if (label in ROW_LABELS and other in ROW_LABELS) or {label, other} == {SOIL_LABEL, FRAME}:
        return OUTLINE
    return None


def shade(hit: Hit) -> tuple[int, int, int, int]:
    if hit.label in ROW_LABELS:
        t = (hit.z - SOIL_HEIGHT) / ROW_HEIGHT
        # Flat steps by face: lit top, front in light, contact shadow at the base
        if hit.neighbor(0, 0, 1) == EMPTY:
            step = 4
        elif t < BASE_SHADE:
            step = 1 if t > BASE_SHADE / 2 else 0
        else:
            step = 3 if t > 0.65 else 2
        # Strands: 1px model columns one step darker or lighter along the whole front, a few longer clumps
        streak = noise(hit.mx, hit.label, 9)
        if streak < 0.22:
            step -= 1
        elif streak > 0.85 and step < 4:
            step += 1
        # The right end of a row turns away from the light
        if hit.neighbor(3, 0, 0) == EMPTY and hit.neighbor(0, 0, 1) != EMPTY:
            step -= 1
        return WHEAT[max(0, min(4, step))]

    if hit.label == SOIL_LABEL:
        return SOIL[2] if hit.neighbor(0, 0, 1) == EMPTY else SOIL[1]

    # Frame planks run along each side: lit top with seams, front faces with grain streaks along the plank
    light = hit.light(hit.normal())
    along = hit.mx if abs(hit.my) > abs(hit.mx) else hit.my
    if hit.neighbor(0, 0, 1) == EMPTY:
        return WOOD[1] if (along + 64) % 13 == 0 else WOOD[3]
    if hit.z == FRAME_HEIGHT // 2:
        return OUTLINE if (along + 64) % 9 < 6 else WOOD[1]
    base = 1 if light < 0.4 else 2
    if noise((along + 64) // 5, hit.z, 11) > 0.75:
        base -= 1
    return WOOD[base]


def square_shadow(x: float, y: float) -> float:
    """Normalized distance to the square shadow of the frame."""
    half = HALF_SIZE + SHADOW_MARGIN
    return max(abs(x - SHADOW_OFFSET[0]), abs(y - SHADOW_OFFSET[1])) / half


def main() -> None:
    grid = build_model()
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, SHADOW_RADII, SHADOW_JITTER, shadow_shape=square_shadow)
    outline(sprite, crack, depth_gap=6)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
