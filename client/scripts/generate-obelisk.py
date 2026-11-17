#!/usr/bin/env python3
"""Generates the red obelisk totem pixel art.

Run from anywhere: python3 scripts/generate-obelisk.py

Outputs public/resources/totem/obelisk.png, a front view cropped to the art: the obelisk is a vertical two-cell
piece, so the model is deeper than a square one.

An elevated platform of dark stone with a stair in front. On the back cell stands a tall obelisk carved with
glowing blood red runes; on the front cell a round sacrificial altar with a pentagram painted in blood on its top
slab, blood running down its sides, across the paving and down the stairs. Skulls lie around the altar, one is
stuck on a pike, and black candles burn at the altar corners. It is modeled as voxels and rendered by
voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "totem" / "obelisk.png"
WIDTH = 98
HEIGHT = 202
ORIGIN_Y = 136
HALF_Y = 96

# New ramps: the darkest step leans toward violet, lighter steps get warmer
# Dark basalt for the platform and obelisk, a gloomier take on the shared stone ramp
BASALT = [(36, 32, 52, 255), (52, 46, 72, 255), (72, 62, 94, 255), (98, 86, 118, 255), (136, 120, 148, 255)]
BLOOD = [(74, 28, 50, 255), (122, 30, 44, 255), (176, 38, 42, 255), (226, 76, 56, 255), (255, 156, 104, 255)]
# Bone uses the shared thatch ramp
BONE = [(94, 71, 78, 255), (138, 103, 99, 255), (175, 140, 121, 255), (227, 193, 140, 255), (245, 239, 169, 255)]
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
FLAME = [(226, 76, 56, 255), (255, 156, 104, 255), (245, 239, 169, 255)]

# Platform covering the footprint, stairs sticking out in front
PLATFORM_HALF_X = 44
PLATFORM_FRONT = -76
PLATFORM_BACK = 90
PLATFORM_HEIGHT = 24
STAIR_HALF_X = 12
STAIR_STEPS = 6
STAIR_DEPTH = 4

# Obelisk on the back cell
OBELISK_Y = 46
OBELISK_PLINTH = (15, 7)  # half width, height
OBELISK_BASE_HALF = 10
OBELISK_TOP_HALF = 6
OBELISK_SHAFT_TOP = 120
OBELISK_TIP = 134
RUNE_ROWS = (108, 92, 76, 60)  # top z of each rune

# Altar on the front cell
ALTAR_Y = -34
ALTAR_RADIUS = 16
ALTAR_SLAB_RADIUS = 19
ALTAR_TOP = PLATFORM_HEIGHT + 15
ALTAR_SLAB = 4
PENTAGRAM_RADIUS = 14

SKULLS = ((-28, -58, 0), (24, -60, 0), (30, 12, 0))  # x, y, extra z
PIKE = (-30, 24, 36)  # x, y, height above the platform
CANDLES = ((-22, -16), (22, -16), (-28, -38), (28, -40))
CANDLE_HEIGHT = 7

# Light from above: the shadow rims the platform and stairs evenly on both sides and drops a bit toward the camera
SHADOW_OFFSET = (0, -2)
SHADOW_MARGIN = 3
SHADOW_JITTER = 0.3

(
    PLATFORM_LABEL,
    STAIR_LABEL,
    OBELISK_LABEL,
    RUNE_LABEL,
    ALTAR_LABEL,
    BONE_LABEL,
    PIKE_LABEL,
    SOCKET_LABEL,
    CANDLE_LABEL,
    FLAME_LABEL,
) = range(1, 11)

# Rune glyphs, 3x5 cells of 2x2 voxels, carved down the front face of the obelisk
RUNES = (
    ("X.X", "XXX", "X.X", ".X.", ".X."),
    ("XX.", "X.X", "XX.", "X.X", "XX."),
    (".X.", "X.X", ".X.", "X.X", ".X."),
    ("X..", "XX.", "X.X", "XX.", "X.."),
    ("XXX", ".X.", "XXX", ".X.", "X.X"),
)


def noise(*values: int) -> float:
    """Deterministic pseudo random value in 0..1."""
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 0xFFFF


def obelisk_half(z: float) -> float:
    t = (z - PLATFORM_HEIGHT - OBELISK_PLINTH[1]) / (OBELISK_SHAFT_TOP - PLATFORM_HEIGHT - OBELISK_PLINTH[1])
    return OBELISK_BASE_HALF + (OBELISK_TOP_HALF - OBELISK_BASE_HALF) * t


def build_model() -> VoxelGrid:
    grid = VoxelGrid(half_y=HALF_Y)
    build_platform(grid)
    build_obelisk(grid)
    build_altar(grid)
    build_props(grid)
    return grid


def build_platform(grid: VoxelGrid) -> None:
    grid.box(-PLATFORM_HALF_X, PLATFORM_HALF_X, PLATFORM_FRONT, PLATFORM_BACK, 0, PLATFORM_HEIGHT, PLATFORM_LABEL)
    # A few chipped blocks along the top edge so the platform reads as old masonry
    for x in range(-PLATFORM_HALF_X, PLATFORM_HALF_X, 4):
        if noise(x, 3) > 0.8 and abs(x) > STAIR_HALF_X + 2:
            grid.box(x, x + 4, PLATFORM_FRONT, PLATFORM_FRONT + 2, PLATFORM_HEIGHT - 2, PLATFORM_HEIGHT, EMPTY)
    step_height = PLATFORM_HEIGHT // STAIR_STEPS
    for i in range(STAIR_STEPS):
        y0 = PLATFORM_FRONT - (STAIR_STEPS - i) * STAIR_DEPTH
        grid.box(-STAIR_HALF_X, STAIR_HALF_X, y0, PLATFORM_FRONT, 0, (i + 1) * step_height, STAIR_LABEL)


def build_obelisk(grid: VoxelGrid) -> None:
    half, height = OBELISK_PLINTH
    base = PLATFORM_HEIGHT
    grid.box(-half, half, OBELISK_Y - half, OBELISK_Y + half, base, base + height, OBELISK_LABEL)
    grid.box(-half + 2, half - 2, OBELISK_Y - half + 2, OBELISK_Y + half - 2, base + height, base + height + 2,
             OBELISK_LABEL)
    for z in range(base + height + 2, OBELISK_SHAFT_TOP):
        h = round(obelisk_half(z))
        grid.box(-h, h, OBELISK_Y - h, OBELISK_Y + h, z, z + 1, OBELISK_LABEL)
    # Pyramidion
    for z in range(OBELISK_SHAFT_TOP, OBELISK_TIP):
        t = (z - OBELISK_SHAFT_TOP) / (OBELISK_TIP - OBELISK_SHAFT_TOP)
        h = max(1, round((OBELISK_TOP_HALF + 1) * (1 - t)))
        grid.box(-h, h, OBELISK_Y - h, OBELISK_Y + h, z, z + 1, OBELISK_LABEL)
    # Runes on the front face, one voxel deep
    for rune, top in zip(RUNES, RUNE_ROWS):
        for row, line in enumerate(rune):
            for col, cell in enumerate(line):
                if cell != "X":
                    continue
                for dz in range(3):
                    z = top - row * 3 - dz
                    front = OBELISK_Y - round(obelisk_half(z))
                    for dx in range(2):
                        grid.set(col * 2 - 3 + dx, front, z, RUNE_LABEL)


def disc(grid: VoxelGrid, cx: float, cy: float, z: int, radius: float, label: int) -> None:
    reach = math.ceil(radius) + 1
    for y in range(math.floor(cy) - reach, math.floor(cy) + reach):
        for x in range(math.floor(cx) - reach, math.floor(cx) + reach):
            if math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= radius:
                grid.set(x, y, z, label)


def build_altar(grid: VoxelGrid) -> None:
    for z in range(PLATFORM_HEIGHT, ALTAR_TOP - ALTAR_SLAB):
        # A plinth ring at the foot, the drum above
        radius = ALTAR_RADIUS + (2 if z < PLATFORM_HEIGHT + 3 else 0)
        disc(grid, 0, ALTAR_Y, z, radius, ALTAR_LABEL)
    for z in range(ALTAR_TOP - ALTAR_SLAB, ALTAR_TOP):
        disc(grid, 0, ALTAR_Y, z, ALTAR_SLAB_RADIUS, ALTAR_LABEL)


def skull(grid: VoxelGrid, cx: int, cy: int, z0: int) -> None:
    # Cranium, jaw, and two eye sockets and a nose hole facing the camera
    for z in range(z0 + 3, z0 + 14):
        for y in range(cy - 8, cy + 8):
            for x in range(cx - 8, cx + 8):
                if math.dist((x + 0.5, (y + 0.5 - cy) * 1.1 + cy, z + 0.5), (cx, cy, z0 + 8.5)) <= 6:
                    grid.set(x, y, z, BONE_LABEL)
    grid.box(cx - 4, cx + 4, cy - 6, cy + 2, z0, z0 + 5, BONE_LABEL)
    # Eye sockets and nose hole, sunk into the face toward the camera
    for ex in (cx - 4, cx + 1):
        for y in range(cy - 8, cy - 2):
            grid.box(ex, ex + 3, y, y + 1, z0 + 6, z0 + 10, SOCKET_LABEL if grid.get(ex + 1, y, z0 + 8) else EMPTY)
    for y in range(cy - 8, cy - 3):
        if grid.get(cx, y, z0 + 5):
            grid.box(cx - 1, cx + 1, y, y + 1, z0 + 4, z0 + 6, SOCKET_LABEL)
    # Teeth gap
    grid.box(cx - 3, cx + 3, cy - 6, cy - 5, z0 + 2, z0 + 3, SOCKET_LABEL)


def build_props(grid: VoxelGrid) -> None:
    for x, y, extra in SKULLS:
        skull(grid, x, y, PLATFORM_HEIGHT + extra)
    px, py, height = PIKE
    grid.box(px - 1, px + 1, py - 1, py + 1, PLATFORM_HEIGHT, PLATFORM_HEIGHT + height, PIKE_LABEL)
    skull(grid, px, py, PLATFORM_HEIGHT + height - 3)
    for x, y in CANDLES:
        grid.box(x - 2, x + 2, y - 2, y + 2, PLATFORM_HEIGHT, PLATFORM_HEIGHT + CANDLE_HEIGHT, CANDLE_LABEL)
        grid.box(x - 1, x + 1, y - 1, y + 1, PLATFORM_HEIGHT + CANDLE_HEIGHT, PLATFORM_HEIGHT + CANDLE_HEIGHT + 5,
                 FLAME_LABEL)


def step(ramp: list[tuple[int, int, int, int]], index: int) -> tuple[int, int, int, int]:
    return ramp[max(0, min(len(ramp) - 1, index))]


def face(hit: Hit) -> str:
    """Face orientation from the empty neighbors: top, front, left or right."""
    if hit.neighbor(0, 0, 1) == EMPTY:
        return "top"
    if hit.neighbor(0, -1, 0) == EMPTY:
        return "front"
    if hit.neighbor(-1, 0, 0) == EMPTY:
        return "left"
    if hit.neighbor(1, 0, 0) == EMPTY:
        return "right"
    normal = hit.normal()
    if normal[2] > 0.6:
        return "top"
    return "left" if normal[0] < -0.4 else "right" if normal[0] > 0.4 else "front"


def pentagram(x: float, y: float) -> bool:
    """Star and circle painted on the altar top, in model coordinates around the altar center."""
    r = math.hypot(x, y)
    if abs(r - PENTAGRAM_RADIUS) < 1.1:
        return True
    # Upright star seen from the camera: the top point is the far side (+y)
    points = [(PENTAGRAM_RADIUS * math.sin(a), PENTAGRAM_RADIUS * math.cos(a))
              for a in (math.radians(i * 144) for i in range(5))]
    for (ax, ay), (bx, by) in zip(points, points[1:] + points[:1]):
        dx, dy = bx - ax, by - ay
        t = max(0, min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
        if math.hypot(x - ax - dx * t, y - ay - dy * t) < 1.0:
            return True
    return False


def blood_stain(x: int, y: int) -> bool:
    """Blood pooled at the foot of the altar and trickling to the stairs."""
    blob = math.hypot((x + 3) / 1.3, y - ALTAR_Y + 14) < 12 + noise(x // 3, y // 3, 7) * 5
    trail = abs(x + 2 + math.sin(y / 5) * 2) < 3 and PLATFORM_FRONT - STAIR_STEPS * STAIR_DEPTH <= y < ALTAR_Y
    return blob or trail


def shade(hit: Hit) -> tuple[int, int, int, int]:
    orientation = face(hit)

    if hit.label in (PLATFORM_LABEL, STAIR_LABEL):
        if orientation == "top":
            if blood_stain(hit.mx, hit.my):
                return BLOOD[1] if noise(hit.mx // 2, hit.my // 2, 9) > 0.75 else BLOOD[2]
            index = 3
            # Paving slabs with joints one step lower, lighter toward the left
            if hit.label == PLATFORM_LABEL and ((hit.mx + 64) % 14 == 0 or (hit.my + 128) % 12 == 0):
                index = 2
            if noise(hit.mx // 7, hit.my // 6, 2) > 0.85:
                index -= 1
            return step(BASALT, index)
        if orientation == "front":
            # Blood running down the stair risers
            if hit.label == STAIR_LABEL and abs(hit.mx + 2) < 3:
                return BLOOD[1]
            # Big blocks in staggered rows, mortar one step lower
            index = 2
            row = hit.z // 5
            if hit.z % 5 == 0 or (hit.mx + (row % 2) * 6 + 64) % 12 == 0:
                index = 1
            # Drips of blood under the chipped edge
            if hit.label == PLATFORM_LABEL and noise(hit.mx // 2, 11) > 0.9 and hit.z > PLATFORM_HEIGHT - 8 - (hit.mx % 4):
                return BLOOD[1]
            return step(BASALT, index)
        return step(BASALT, 1 if orientation == "left" else 0)

    if hit.label == OBELISK_LABEL:
        if orientation == "top":
            return BASALT[4] if hit.z >= OBELISK_SHAFT_TOP else BASALT[3]
        # Polished black stone: the left edge catches a streak of light, the right side sinks into shade
        index = {"front": 2, "left": 3, "right": 1}[orientation]
        if orientation == "front":
            h = obelisk_half(hit.z)
            if hit.mx < -h + 2:
                index = 3
            elif hit.mx > h - 3:
                index = 1
        if hit.z >= OBELISK_SHAFT_TOP and orientation != "right":
            index += 1
        # Contact shadow at the foot of the shaft
        if PLATFORM_HEIGHT + OBELISK_PLINTH[1] + 2 <= hit.z < PLATFORM_HEIGHT + OBELISK_PLINTH[1] + 8:
            index -= 1
        return step(BASALT, index)

    if hit.label == RUNE_LABEL:
        # Glowing runes, brighter at the top of each stroke
        return BLOOD[4] if hit.neighbor(0, 0, 1) != RUNE_LABEL else BLOOD[3]

    if hit.label == ALTAR_LABEL:
        x, y = hit.mx + 0.5, hit.my + 0.5 - ALTAR_Y
        if orientation == "top":
            if pentagram(x, y):
                return BLOOD[3]
            # Dried blood around the star
            if math.hypot(x, y) < PENTAGRAM_RADIUS + 2 and noise(hit.mx // 2, hit.my // 2, 5) > 0.8:
                return BLOOD[1]
            return BASALT[4] if x < -6 else BASALT[3]
        # Blood running down the drum
        if noise(hit.mx // 2, 13) > 0.72 and hit.z > ALTAR_TOP - ALTAR_SLAB - 8 - (hit.mx * 7 % 6):
            return BLOOD[2] if hit.mx < 0 else BLOOD[1]
        # A cylinder: darker over both edges, the left keeps more light
        side = x / ALTAR_SLAB_RADIUS
        index = 3 if side < -0.3 else 2 if side < 0.45 else 1
        if hit.z < ALTAR_TOP - ALTAR_SLAB:
            index -= 1  # contact shadow under the slab
        return step(BASALT, index)

    if hit.label == BONE_LABEL:
        normal = hit.normal()
        light = hit.light(normal)
        return step(BONE, 4 if light > 0.75 else 3 if light > 0.4 else 2 if light > 0 else 1)

    if hit.label == SOCKET_LABEL:
        return BLOOD[0]

    if hit.label == PIKE_LABEL:
        return WOOD[2] if hit.neighbor(-1, 0, 0) == EMPTY else WOOD[0]

    if hit.label == CANDLE_LABEL:
        # Pale tallow candles
        if orientation == "top":
            return BONE[4]
        return BONE[3] if hit.neighbor(-1, 0, 0) == EMPTY else BONE[2]

    if hit.label == FLAME_LABEL:
        return FLAME[2] if hit.z < PLATFORM_HEIGHT + CANDLE_HEIGHT + 2 else FLAME[1]
    return (255, 0, 255, 255)


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    # A material switch always has ink between the two materials
    stone = {PLATFORM_LABEL, STAIR_LABEL}
    if label == other or {label, other} <= stone:
        return None
    if {RUNE_LABEL, FLAME_LABEL, SOCKET_LABEL} & {label, other}:
        return None
    return (22, 28, 46, 255)


def footprint_shadow(x: float, y: float) -> float:
    """Distance outside the platform and stairs outline, in units of the margin, 1 or less inside the shadow.

    It follows the notch beside the stairs instead of filling the footprint's bounding box.
    """
    x, y = x - SHADOW_OFFSET[0], y - SHADOW_OFFSET[1]
    boxes = (
        (-PLATFORM_HALF_X, PLATFORM_HALF_X, PLATFORM_FRONT, PLATFORM_BACK),
        (-STAIR_HALF_X, STAIR_HALF_X, PLATFORM_FRONT - STAIR_STEPS * STAIR_DEPTH, PLATFORM_FRONT),
    )
    distance = min(max(x0 - x, x - x1, y0 - y, y - y1, 0) for x0, x1, y0, y1 in boxes)
    return distance / SHADOW_MARGIN


def main() -> None:
    grid = build_model()
    # shadow_radii is ignored, footprint_shadow gives the shape
    sprite = render(grid, 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1, 1), SHADOW_JITTER, shadow_shape=footprint_shadow)
    outline(sprite, crack, depth_gap=6, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
