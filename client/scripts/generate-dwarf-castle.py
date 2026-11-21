#!/usr/bin/env python3
"""Generates the Dwarf castle pixel art: the left castle and its right-hand twin, both lit from the screen's left.

Run from anywhere: python3 scripts/generate-dwarf-castle.py [OUT_DIR]

Outputs public/resources/castle/dwarf/board-left.png (the player's castle, left of the board) and
board-right.png (the opponent's, right of the board), or the same names in OUT_DIR.

The outer mountain shelters two freestanding buildings on its board-facing side. The gatehouse
receives enemies; the iron-roofed forge spawns defenders. Their floors share a ground plane:
the player gatehouse is nearer the camera, while the opponent gatehouse is farther back.
Mirror the model, not the rendered pixels, to retain screen-left lighting.
Modeled as voxels and rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import math
import random
import sys
from collections import deque
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "resources" / "castle" / "dwarf"
SIZE = 224  # 2x2 cells, the same 9.8 x 9.8 game units as before: about 22.9 px per unit
ORIGIN_Y = 186
HALF_X = SIZE // 2
HALF_Y = 96

# Ramps from dark to light
ROCK = [(44, 40, 62, 255), (72, 66, 90, 255), (104, 96, 118, 255), (142, 132, 146, 255), (184, 172, 178, 255)]
STONE = [(70, 64, 84, 255), (108, 98, 108, 255), (146, 134, 130, 255), (186, 172, 156, 255), (214, 200, 176, 255)]
TRIM = [(96, 86, 96, 255), (142, 128, 122, 255), (184, 168, 148, 255), (222, 206, 176, 255)]
DARK = [(22, 18, 30, 255), (34, 28, 44, 255), (50, 42, 60, 255)]
IRON = [(38, 42, 58, 255), (58, 64, 86, 255), (84, 92, 116, 255), (124, 132, 156, 255)]
GOLD = [(124, 76, 38, 255), (184, 126, 50, 255), (226, 176, 74, 255), (250, 222, 128, 255)]
WOOD = [(90, 70, 70, 255), (134, 99, 83, 255), (180, 131, 85, 255), (218, 181, 112, 255)]
BANNER = [(86, 28, 48, 255), (136, 44, 56, 255), (178, 66, 62, 255), (214, 98, 76, 255)]
GLOW = [(150, 52, 28, 255), (214, 102, 36, 255), (246, 158, 54, 255), (255, 214, 110, 255)]
LAVA = [(150, 44, 26, 255), (214, 88, 30, 255), (248, 150, 44, 255), (255, 214, 96, 255)]
CRYSTALS = [
    [(40, 104, 130, 255), (72, 170, 190, 255), (136, 224, 226, 255), (214, 250, 246, 255)],
    [(120, 62, 130, 255), (186, 100, 176, 255), (238, 154, 214, 255), (252, 218, 240, 255)],
    [(120, 120, 150, 255), (170, 170, 200, 255), (220, 220, 240, 255), (250, 250, 255, 255)],
]
DIRT = [(104, 82, 70, 255), (146, 116, 88, 255), (186, 154, 108, 255)]

(INNER, GATE, HOUSE, TRIM_L, DOOR_GLOW, WOOD_L, IRON_L, GOLD_L, BANNER_L, ROAD, SLAB, CHIMNEY_GLOW, SLATE) = range(1, 14)
CRYSTAL = 14  # 14..16
GRANITE, HELM, AXE = 17, 18, 19
BOULDER = 20  # 20 and up: rock blocks, one label each so seams show

# Mountain boulders on the left castle: center x, y, z, radii x, y, z. Convex polyhedra cut by random planes.
BOULDERS = [
    (-34, 14, 56, 46, 36, 76),
    (-82, 10, 36, 32, 32, 46),
    (6, 30, 60, 36, 30, 64),
    (-58, -14, 22, 36, 24, 26),
    (-14, -18, 18, 30, 22, 22),
    (-100, -8, 14, 14, 18, 16),
    (-40, 40, 70, 30, 24, 60),
    (-17, 44, 86, 33, 28, 65),  # summit above the broad shoulder
    (-92, 34, 61, 20, 26, 55),
    (-16, 62, 62, 32, 30, 51),
    (16, 25, 26, 25, 32, 32),   # scree descending toward the buildings
    (18, -14, 12, 23, 24, 15),
]
FACETS = 10
SEED = 11

# Floors are both at z=0. Perspective comes from depth, not a raised terrace.
NEAR = (0, -40)
FAR = (0, 67)

GATE_X = (20, 110)
GATE_H = 44
ARCH_CX = 80
ARCH_HALF = 15
ARCH_SPRING = 22
ARCH_RISE = 12
HOUSE_X = (22, 111)
HOUSE_BODY = 36
HOUSE_TOP = 46
DOOR_CX = 94

SHADOW_MARGIN = 3
SHADOW_OFFSET = (0, -2)
MIRRORED = False


class Builder:
    """Writes the model in the left castle's frame. Mirrored, every voxel lands at the opposite x."""

    def __init__(self, mirrored: bool) -> None:
        self.mirrored = mirrored
        self.grid = VoxelGrid(HALF_X, HALF_Y)

    def _x(self, x: int) -> int:
        return -1 - x if self.mirrored else x

    def set(self, x: int, y: int, z: int, label: int) -> None:
        self.grid.set(self._x(x), y, z, label)

    def get(self, x: int, y: int, z: int) -> int:
        return self.grid.get(self._x(x), y, z)

    def box(self, x0: int, x1: int, y0: int, y1: int, z0: int, z1: int, label: int) -> None:
        for z in range(z0, z1):
            for y in range(y0, y1):
                for x in range(x0, x1):
                    self.set(x, y, z, label)

    def box_over(self, x0: int, x1: int, y0: int, y1: int, z0: int, z1: int, label: int, only: tuple[int, ...]) -> None:
        for z in range(z0, z1):
            for y in range(y0, y1):
                for x in range(x0, x1):
                    if self.get(x, y, z) in only:
                        self.set(x, y, z, label)


def hash01(*values: int) -> float:
    h = math.sin(sum(v * k for v, k in zip(values, (12.9898, 78.233, 37.719)))) * 43758.5453
    return h - math.floor(h)


def build_boulders() -> list:
    rng = random.Random(SEED)
    out = []
    for center in BOULDERS:
        planes = []
        for _ in range(FACETS):
            theta = rng.uniform(0, 2 * math.pi)
            nz = rng.uniform(-0.2, 1)
            r = math.sqrt(1 - nz * nz)
            planes.append((r * math.cos(theta), r * math.sin(theta), nz, rng.uniform(0.84, 1)))
        for direction in [(1, 0, 0), (-1, 0, 0), (0, -1, 0), (0, 1, 0), (0, 0, 1)]:
            planes.append((*direction, 1.04))
        out.append((center, planes))
    return out


# Sections of the massif, from the wide scree foot to its offset summit.
# Sloped, stepped flanks leave air beside the keep instead of ending at the sprite bounds.
RIDGE = [(0,-105,25), (12,-99,36), (25,-89,39), (40,-85,32),
         (54,-85,37), (67,-73,43), (77,-69,38), (85,-59,32),
         (103,-56,26), (116,-46,19), (129,-34,9), (136,-22,3), (151,-10,-9)]


def ridge_section(z):
    for (lo, left, right), (hi, next_left, next_right) in zip(RIDGE, RIDGE[1:]):
        if z <= hi:
            t = (z - lo) / (hi - lo)
            return left + t * (next_left - left), right + t * (next_right - right)
    return 0, -1


def build_mountain(b: Builder) -> None:
    for index, ((cx, cy, cz, rx, ry, rz), planes) in enumerate(build_boulders()):
        for z in range(max(0, int(cz - rz) - 1), int(cz + rz) + 2):
            left, right = ridge_section(z)
            for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
                bevel = abs(y - 10) * 0.12
                for x in range(max(math.ceil(left + bevel), int(cx-rx)-1), min(math.floor(right-bevel)+1, int(cx+rx)+2)):
                    q = ((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry, (z + 0.5 - cz) / rz)
                    if all(q[0] * a + q[1] * bb + q[2] * c <= d for a, bb, c, d in planes) and b.get(x, y, z) == EMPTY:
                        b.set(x, y, z, BOULDER + index)


def crystal(b: Builder, cx: int, cy: int, cz: int, h: int, r: int, tilt: float, kind: int) -> None:
    for z in range(h):
        t = z / h
        rr = r * (1 - t * 0.85)
        ox = round(tilt * z)
        for y in range(-r, r + 1):
            for x in range(-r, r + 1):
                if abs(x) + abs(y) * 0.8 <= rr + 0.3:
                    b.set(cx + x + ox, cy + y, cz + z, CRYSTAL + kind)


def arch(x: float, z: float, cx: int, half: int, spring: int, rise: int, z0: int) -> bool:
    dz = z - z0
    if dz < 0 or abs(x - cx) >= half:
        return False
    if dz < spring:
        return True
    return dz < spring + rise * math.sqrt(max(0.0, 1 - ((x - cx) / half) ** 2))


def landing(b: Builder, z0: int, yf: int, x0: int) -> None:
    """Where the path meets the building: a dirt apron on the ground, a stone landing on the terrace."""
    if z0 == 0:
        b.box(x0, HALF_X, yf - 26, yf, 0, 2, ROAD)
        for step in range(3):
            b.box(ARCH_CX - ARCH_HALF - 4 + step * 2, ARCH_CX + ARCH_HALF + 4 - step * 2, yf - 6 + step * 2, yf, 0, 3 - step, SLAB)
    else:
        b.box(x0, HALF_X, yf - 12, yf, z0 - 6, z0 + 1, SLAB)


def build_gate(b: Builder, z0: int, yf: int) -> None:
    x0, x1 = GATE_X
    y1 = yf + 22
    top = z0 + GATE_H
    b.box(x0, x1, yf, y1, z0, top, GATE)
    # plinth and cornice jut out, pilasters frame the portal
    b.box(x0 - 2, x1, yf - 2, yf, z0, z0 + 5, TRIM_L)
    b.box(x0 - 3, x1 + 1, yf - 4, y1, top - 6, top, TRIM_L)
    for px in (x0, x1 - 10):
        b.box(px, px + 10, yf - 3, yf, z0, top - 6, TRIM_L)
    # battlements
    for x in range(x0 - 3, x1 + 1, 11):
        b.box(x, min(x + 6, x1 + 1), yf - 4, yf, top, top + 6, GATE)
        b.box(x, min(x + 6, x1 + 1), yf - 4, yf - 1, top, top + 6, TRIM_L)
    b.box(x0 - 3, x1 + 1, y1 - 4, y1, top, top + 6, GATE)
    # portal: carved opening with a stone frame, dark hall and portcullis
    hall = 14
    for z in range(z0 + 2, top):
        for x in range(ARCH_CX - ARCH_HALF - 8, ARCH_CX + ARCH_HALF + 8):
            if arch(x + 0.5, z + 0.5, ARCH_CX, ARCH_HALF + 6, ARCH_SPRING, ARCH_RISE + 4, z0) and not arch(
                x + 0.5, z + 0.5, ARCH_CX, ARCH_HALF, ARCH_SPRING, ARCH_RISE, z0
            ):
                b.box(x, x + 1, yf - 3, yf + 3, z, z + 1, TRIM_L)
    for z in range(z0, top):
        for x in range(ARCH_CX - ARCH_HALF - 1, ARCH_CX + ARCH_HALF + 1):
            if arch(x + 0.5, z + 0.5, ARCH_CX, ARCH_HALF + 1, ARCH_SPRING, ARCH_RISE + 1, z0 - 0):
                inside = arch(x + 0.5, z + 0.5, ARCH_CX, ARCH_HALF, ARCH_SPRING, ARCH_RISE, z0)
                for y in range(yf + 3, yf + hall):
                    b.set(x, y, z, EMPTY if inside else INNER)
                if inside:
                    b.set(x, yf - 4, z, EMPTY)
                    for y in range(yf - 3, yf + 3):
                        b.set(x, y, z, EMPTY)
    b.box(ARCH_CX - ARCH_HALF - 1, ARCH_CX + ARCH_HALF + 1, yf + hall, yf + hall + 3, z0, top - 4, INNER)
    b.box(ARCH_CX - ARCH_HALF - 1, ARCH_CX + ARCH_HALF + 1, yf + 3, yf + hall, z0, z0 + 1, INNER)
    # portcullis in the upper half of the opening
    for x in range(ARCH_CX - ARCH_HALF + 1, ARCH_CX + ARCH_HALF, 5):
        for z in range(z0 + ARCH_SPRING - 4, top):
            if arch(x + 0.5, z + 0.5, ARCH_CX, ARCH_HALF - 1, ARCH_SPRING, ARCH_RISE - 1, z0):
                b.box(x, x + 2, yf, yf + 2, z, z + 1, IRON_L)
    for z in (z0 + ARCH_SPRING - 4, z0 + ARCH_SPRING + 5):
        for x in range(ARCH_CX - ARCH_HALF + 1, ARCH_CX + ARCH_HALF):
            if arch(x + 0.5, z + 0.5, ARCH_CX, ARCH_HALF - 1, ARCH_SPRING, ARCH_RISE - 1, z0):
                b.box(x, x + 1, yf, yf + 2, z, z + 2, IRON_L)
    # gilded keystone with a hammer
    kz = z0 + ARCH_SPRING + ARCH_RISE + 3
    b.box(ARCH_CX - 4, ARCH_CX + 4, yf - 5, yf - 2, kz, kz + 7, GOLD_L)
    b.box(ARCH_CX - 1, ARCH_CX + 1, yf - 6, yf - 5, kz + 1, kz + 6, TRIM_L)
    b.box(ARCH_CX - 3, ARCH_CX + 3, yf - 6, yf - 5, kz + 4, kz + 6, TRIM_L)
    # rune bands on both flanks
    for fx0, fx1 in ((x0 + 14, ARCH_CX - ARCH_HALF - 12), (ARCH_CX + ARCH_HALF + 12, x1 - 14)):
        for x in range(fx0, fx1, 4):
            h = 3 + round(hash01(x, z0, 9) * 3)
            b.box(x, x + 1, yf - 1, yf, z0 + 16, z0 + 16 + h, GOLD_L)
            if hash01(x, z0, 4) > 0.5:
                b.box(x, x + 3, yf - 1, yf, z0 + 16 + h - 1, z0 + 16 + h, GOLD_L)
    # banners hanging from the cornice on both pilasters
    for bx in (x0 + 3, x1 - 7):
        for z in range(z0 + 18, top - 6):
            tip = z0 + 18 + 4
            if z >= tip or abs(bx + 2 - (bx + 2)) < 1:
                b.box(bx, bx + 4, yf - 5, yf - 3, z, z + 1, BANNER_L)
        b.box(bx + 1, bx + 3, yf - 5, yf - 3, z0 + 15, z0 + 18, BANNER_L)
        b.box(bx, bx + 4, yf - 6, yf - 3, top - 12, top - 10, GOLD_L)


def build_house(b: Builder, z0: int, yf: int) -> None:
    x0, x1 = HOUSE_X
    fy = yf - 8  # juts out of the cliff
    y1 = yf + 18
    body_top = z0 + HOUSE_BODY
    top = z0 + HOUSE_TOP
    b.box(x0, x1, fy, y1, z0, body_top, HOUSE)
    b.box(x0 - 1, x1, fy - 2, fy, z0, z0 + 4, TRIM_L)
    # corbels carrying the overhanging parapet
    for cx in range(x0 + 2, x1 - 4, 9):
        b.box(cx, cx + 4, fy - 3, fy, body_top - 5, body_top, TRIM_L)
        b.box(cx + 1, cx + 3, fy - 4, fy - 3, body_top - 3, body_top, TRIM_L)
    b.box(x0 - 3, x1, fy - 5, y1, body_top, top, HOUSE)
    b.box(x0 - 3, x1, fy - 6, y1, top - 3, top, TRIM_L)
    for x in range(x0 - 4, x1, 10):
        b.box(x, min(x + 6, x1), fy - 7, fy - 3, top, top + 5, HOUSE)
    b.box(x0 - 4, x0 - 1, fy - 7, y1, top, top + 5, HOUSE)
    b.box(x1 - 3, x1, fy - 7, y1, top, top + 5, HOUSE)
    b.box(x0 - 4, x1, y1 - 4, y1, top, top + 5, HOUSE)
    # slate roof behind the parapet, a ridge running along the house, capped in gold
    mid = (fy - 3 + y1) / 2
    for y in range(fy - 3, y1 - 3):
        h = 11 - round(abs(y - mid) * 11 / (mid - fy + 3))
        if h > 0:
            b.box(x0 - 2, x1 - 2, y, y + 1, top, top + h, SLATE)
    b.box(x0 - 3, x1 - 1, round(mid) - 1, round(mid) + 1, top + 11, top + 13, GOLD_L)
    # forge lit door: carved arch, deep glowing hall, iron banded lintel
    door_z0 = z0 + 2
    for z in range(door_z0, door_z0 + 30):
        for x in range(DOOR_CX - 13, DOOR_CX + 13):
            frame = arch(x + 0.5, z + 0.5, DOOR_CX, 13, 17, 8, door_z0)
            if frame:
                inside = arch(x + 0.5, z + 0.5, DOOR_CX, 10, 16, 7, door_z0)
                for y in range(fy - 3, fy + 12):
                    if inside:
                        b.set(x, y, z, EMPTY)
                    elif y < fy + 2:
                        b.set(x, y, z, TRIM_L)
    b.box(DOOR_CX - 10, DOOR_CX + 10, fy + 12, fy + 15, door_z0, door_z0 + 24, DOOR_GLOW)
    # a sturdy timber barring the door's inside, so it reads as a doorway and not a hole
    b.box(DOOR_CX - 10, DOOR_CX - 8, fy + 4, fy + 8, door_z0, door_z0 + 18, WOOD_L)
    b.box(DOOR_CX + 8, DOOR_CX + 10, fy + 4, fy + 8, door_z0, door_z0 + 18, WOOD_L)
    b.box(DOOR_CX - 10, DOOR_CX + 10, fy + 4, fy + 8, door_z0 + 22, door_z0 + 24, WOOD_L)
    # arrow slits glowing like the forge
    for sx in (x0 + 8, x0 + 22):
        b.box(sx, sx + 3, fy, fy + 3, z0 + 14, z0 + 28, EMPTY)
        b.box(sx, sx + 3, fy + 3, fy + 5, z0 + 14, z0 + 28, DOOR_GLOW)
    # chimney with a glowing mouth
    b.box(x0 + 8, x0 + 18, fy + 12, fy + 22, top, top + 12, HOUSE)
    b.box(x0 + 6, x0 + 20, fy + 10, fy + 24, top + 12, top + 14, TRIM_L)
    b.box(x0 + 9, x0 + 17, fy + 13, fy + 21, top + 13, top + 14, CHIMNEY_GLOW)
    # shield above the door
    b.box(DOOR_CX - 5, DOOR_CX + 5, fy - 4, fy - 2, door_z0 + 30, door_z0 + 36, GOLD_L)
    b.box(DOOR_CX - 4, DOOR_CX + 4, fy - 5, fy - 4, door_z0 + 31, door_z0 + 35, IRON_L)


def miners_gallery(b: Builder) -> None:
    # Sink a lit row of miners' quarters into the main crag. The balcony beams
    # run into the rock, so the gallery follows the cliff rather than floating.
    floor = 72
    face = -26
    for x in range(-60, -18):
        for z in range(floor, floor + 22):
            for y in range(face, 18):
                if b.get(x, y, z) >= BOULDER:
                    b.set(x, y, z, EMPTY)
        b.box(x, x+1, face+5, 19, floor, floor+20, HOUSE)
    for wx in (-54, -43, -32):
        b.box(wx, wx+7, face+3, face+6, floor+6, floor+15, INNER)
        b.box(wx+1, wx+6, face+2, face+4, floor+7, floor+13, CHIMNEY_GLOW)
    b.box(-63, -16, face-2, face+14, floor+19, floor+22, SLATE)
    b.box(-64, -14, face-14, face+16, floor-3, floor, WOOD_L)
    for x in range(-62, -14, 9):
        b.box(x, x+2, face-14, face-12, floor, floor+7, IRON_L)
    b.box(-64, -14, face-14, face-12, floor+6, floor+8, WOOD_L)
    for x in (-58,-24):
        for i in range(15):
            b.box(x, x+4, face-11+i, face-7+i, floor-5-i, floor-2-i, WOOD_L)

    # A braced timber jib carries a brass sheave and a hanging ore bucket.
    y = face-9
    b.box(-19,-14,y,y+5,floor,floor+28,WOOD_L)
    b.box(-21,5,y-1,y+5,floor+25,floor+29,WOOD_L)
    for i in range(14):
        b.box(-16+i,-13+i,y,y+4,floor+10+i,floor+14+i,WOOD_L)
    wheel = floor+24
    for x in range(-2,9):
        for z in range(wheel-5,wheel+6):
            r = (x-3)**2 + (z-wheel)**2
            if r <= 25:
                b.box(x,x+1,y-3,y,z,z+1,IRON_L if r < 8 else GOLD_L)
    b.box(7,9,y-2,y,55,wheel+1,WOOD_L)
    b.box(1,15,y-5,y+4,48,55,IRON_L)
    b.box(0,16,y-6,y+5,54,57,TRIM_L)
    crystal(b,6,y,56,6,3,0.15,0)


def cliff_join(b: Builder, front: int, height: int) -> None:
    # A spur of bedrock wraps over the uphill end of the masonry. Leave the
    # board-side doors and their approaches in precisely the same place.
    for y in range(front - 10, front + 24):
        for z in range(height + 7):
            tip = 38 - abs(y - front - 6) * .46 - abs(z - 19) * .22
            tip += 4 * math.sin(z / 9) - max(0, z - height + 6) * 1.4
            start = -4 + abs(y - front - 5) * .55
            for x in range(int(start), int(tip)):
                if b.get(x, y, z) < BOULDER:
                    b.set(x, y, z, BOULDER + 10)


def lookout(b: Builder) -> None:
    # Cut a small arched, mullioned window directly into the upper rock face.
    for z in range(102, 121):
        for x in range(-30, -10):
            if not arch(x, z, -20, 9, 9, 9, 102):
                continue
            face = next((y for y in range(-45, 50) if b.get(x, y, z) >= BOULDER), None)
            if face is None:
                continue
            pane = arch(x, z, -20, 6, 7, 7, 104)
            if pane:
                b.set(x, face, z, EMPTY)
                b.set(x, face+1, z, IRON_L if abs(x+20) < 1 or z == 109 else DOOR_GLOW)
            else:
                b.set(x, face-1, z, TRIM_L)


def guardian(b: Builder) -> None:
    # A freestanding carving in the courtyard. +x faces the board; Builder
    # turns the pose for the opposite castle before the lighting pass.
    # A high stone pier keeps the figure and both blades visible over the near roof.
    pedestal = 36
    b.box(31,70,-8,12,0,pedestal,SLAB)
    def block(x0,x1,y0,y1,z0,z1,material):
        b.box(x0,x1,y0,y1,z0+pedestal,z1+pedestal,material)

    def stone(cx, cy, cz, rx, ry, rz, material):
        for z in range(cz-rz, cz+rz+1):
            for y in range(cy-ry, cy+ry+1):
                for x in range(cx-rx, cx+rx+1):
                    if ((x-cx)/rx)**2 + ((y-cy)/ry)**2 + ((z-cz)/rz)**2 <= 1:
                        b.set(x,y,z+pedestal,material)

    block(31,70,-8,12,0,20,SLAB)
    block(28,73,-11,14,20,25,TRIM_L)
    for x in (42,57):
        stone(x,0,33,6,6,12,GRANITE)
        stone(x+2,-3,27,8,7,4,HELM)
    stone(48,2,49,14,9,17,GRANITE)  # broad coat, belted over the boots
    block(35,61,-6,10,44,48,HELM)
    stone(49,2,69,10,8,11,GRANITE)
    stone(59,0,69,5,5,3,GRANITE)  # the nose breaks the profile
    stone(50,2,76,12,10,8,HELM)
    block(38,63,-7,9,73,76,AXE)
    block(55,58,-7,-5,70,72,INNER)
    # Three stepped locks taper the long beard below the chin.
    for x,z in ((50,59),(55,57),(59,60)):
        stone(x,-5,z,4,4,8,GRANITE)
    stone(40,-4,60,8,8,7,HELM)
    stone(43,-7,54,5,5,8,GRANITE)
    # Axe haft slopes down and out from the hand. Two crescent blades flare
    # to either side of its socket, leaving notches above and below each bit.
    for i in range(28):
        block(46+i,49+i,-10,-7,58-i,61-i,HELM)
    stone(49,-9,56,5,4,4,GRANITE)
    for u in range(-14,15):
        # Narrow sockets flare sharply into two separate crescent cutting edges.
        span = 2 + max(0, abs(u)-3)*0.95
        for v in range(-12,13):
            if abs(v) > span or abs(u) + (v/7)**2 > 15:
                continue
            x = round(72 + .71*(u+v))
            z = round(34 + .71*(u-v))
            block(x,x+2,-12,-8,z,z+2,AXE if abs(u)>3 else HELM)


def build_model(mirrored: bool) -> VoxelGrid:
    b = Builder(mirrored)
    build_mountain(b)
    miners_gallery(b)
    gate_slot, house_slot = (NEAR, FAR) if not mirrored else (FAR, NEAR)
    landing(b, gate_slot[0], gate_slot[1], GATE_X[0] + 12)
    landing(b, house_slot[0], house_slot[1] - 8, HOUSE_X[0] + 2)
    build_gate(b, *gate_slot)
    build_house(b, *house_slot)
    cliff_join(b, gate_slot[1], GATE_H)
    cliff_join(b, house_slot[1]-8, HOUSE_TOP)
    lookout(b)
    guardian(b)
    # crystals and a bit of lava on the mountain's far flank
    for cx, cy, cz, h, r, tilt, kind in [
        (-84, -34, 0, 24, 5, -0.25, 0),
        (-74, -40, 0, 16, 4, 0.2, 1),
        (-66, -38, 0, 20, 4, 0.12, 2),
        (-24, -34, 0, 14, 4, -0.15, 1),
        (-14, -36, 0, 20, 5, 0.2, 0),
    ]:
        crystal(b, cx, cy, cz, h, r, tilt, kind)
    return b.grid


def ux(mx: int) -> int:
    """Model x back in the left castle's frame."""
    return -1 - mx if MIRRORED else mx


def ramp_index(light: float, steps: int = 5) -> int:
    if steps == 5:
        return 0 if light < -0.35 else 1 if light < 0.1 else 2 if light < 0.5 else 3 if light < 0.85 else 4
    return 0 if light < -0.2 else 1 if light < 0.3 else 2 if light < 0.7 else 3


def shade(hit: Hit) -> tuple[int, int, int, int]:
    label, z = hit.label, hit.z
    x, my = ux(hit.mx), hit.my
    top = hit.neighbor(0, 0, 1) == EMPTY

    if label == BOULDER + 12 and top:
        # Flagstones of the terrace courtyard
        index = 1 if x % 12 == 0 or my % 12 == 0 else 2
        return STONE[index] if hash01(x // 12, my // 12, 8) > 0.3 else STONE[index - 1]

    if label in (GRANITE, HELM, AXE):
        palette = {GRANITE: STONE, HELM: IRON, AXE: TRIM}[label]
        return palette[ramp_index(hit.light(hit.normal()), len(palette))]

    if label >= BOULDER:
        normal = hit.normal(bevel=lambda _: 0.35)
        light = hit.light(normal)
        # Lava seam down the front of the far slope
        seam = -74 + 7 * math.sin(z / 13) + 3 * math.sin(z / 5)
        if abs(x - seam) < 3 and 4 < z < 84 and normal[1] < -0.25 and x < -30 and hash01(x // 2, z // 3, 1) < 0.9:
            return LAVA[min(3, 1 + (z // 5) % 3) if abs(x - seam) < 1.6 else 1]
        return ROCK[ramp_index(light)]

    if label in (CRYSTAL, CRYSTAL + 1, CRYSTAL + 2):
        light = hit.light(hit.normal())
        return CRYSTALS[label - CRYSTAL][3 if top else ramp_index(light, 4)]

    if label == INNER:
        normal = hit.normal()
        if normal[1] < -0.6:
            # The far wall of a hall holds a dim fire
            h = z
            return (86, 46, 40, 255) if h < 10 else (58, 34, 44, 255) if h < 20 else DARK[1]
        return DARK[1] if hit.light(normal) > 0.2 else DARK[0]

    if label in (DOOR_GLOW, CHIMNEY_GLOW):
        return GLOW[min(3, 1 + (z // 6 + my // 4) % 3) if label == DOOR_GLOW else 3]

    if label == SLATE:
        light = hit.light(hit.normal())
        index = ramp_index(light, 4)
        if (z + my) % 4 == 0 or (x + (z // 4) * 3) % 8 == 0:
            index = max(0, index - 1)
        return IRON[index] if index < 3 else (150, 160, 190, 255)

    if label in (GATE, HOUSE, SLAB):
        light = hit.light(hit.normal())
        index = 4 if top else ramp_index(light)
        if top and label != SLAB:
            index = 2 if (x // 6 + my // 6) % 2 else 3
        # Brick courses on the walls: a mortar line every 7 voxels, joints staggered row to row
        if not top and label != SLAB:
            row = z // 7
            if z % 7 == 0 or (x + (row % 2) * 7) % 14 == 0:
                index = max(0, index - 1)
        return STONE[index]

    if label == TRIM_L:
        light = hit.light(hit.normal())
        if top:
            return TRIM[2 if (x // 5 + my // 5) % 2 else 3]
        return TRIM[ramp_index(light, 4)]

    if label == ROAD:
        return DIRT[2 if top and hash01(x // 3, my // 3, 2) > 0.3 else 1 if top else 0]

    if label == GOLD_L:
        light = hit.light(hit.normal())
        return GOLD[3 if top else ramp_index(light, 4)]

    if label == IRON_L:
        light = hit.light(hit.normal())
        return IRON[3 if top else ramp_index(light, 4)]

    if label == BANNER_L:
        light = hit.light(hit.normal())
        return BANNER[ramp_index(light, 4)]

    light = hit.light(hit.normal())
    index = 3 if top else 0 if light < -0.2 else 1 if light < 0.35 else 2
    return WOOD[index]


def crack(label: int, neighbor: int) -> tuple[int, int, int, int] | None:
    if label >= BOULDER and neighbor >= BOULDER:
        return ROCK[0]
    if label in (GATE, HOUSE) and neighbor in (GATE, HOUSE, TRIM_L):
        return STONE[0]
    return None


def footprint_shadow(grid: VoxelGrid):
    """L1 distance from the columns that touch the ground, in units of the margin, offset toward the camera."""
    distance: dict[tuple[int, int], int] = {}
    queue: deque[tuple[int, int]] = deque()
    for y in range(-grid.half_y, grid.half_y):
        for x in range(-grid.half_x, grid.half_x):
            if any(grid.get(x, y, z) not in (EMPTY, ROAD) for z in range(0, 5)):
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


def draw(mirrored: bool, path: Path) -> None:
    global MIRRORED
    MIRRORED = mirrored
    grid = build_model(mirrored)
    sprite = render(grid, 0, SIZE, SIZE, ORIGIN_Y, shade, (1, 1), 0.3, footprint_shadow(grid))
    outline(sprite, crack, depth_gap=5, depth_width=1)
    write_png(path, sprite.pixels)
    print(f"wrote {path}")


def main() -> None:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else OUT_DIR
    out.mkdir(parents=True, exist_ok=True)
    draw(False, out / "board-left.png")
    draw(True, out / "board-right.png")


if __name__ == "__main__":
    main()
