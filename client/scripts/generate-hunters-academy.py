#!/usr/bin/env python3
"""Render the Hunter's Academy to public/resources/barracks/hunters-academy.png.

A vertical two-cell barrack (`o / o`). The front cell holds the basic barracks
(generate-barracks.py) turned to wood for a forest look: plank cladding instead of
plaster, a weathered plank deck instead of paving, a log plinth, a palisade instead of the
curtain wall and a log base under the lookout. The weapon rack is gone and the
straw dummy stays. The entry is a smaller wooden arch with a deer's head trophy
above it.

The back cell is the shooting range: a packed earth court fenced with logs, a bow
leaning on a low plank wall on the left, two trees (the right one with a red target
on its trunk), a set bear trap between them, two arrows standing against the wall and one lying
on the ground.

The canvas is the barracks' width, and its bottom cell keeps the barracks' scale and
ground anchor; it is one cell (110px) taller, so both pieces share the same pixels per
grid unit.
"""
import importlib.util
import math
from pathlib import Path

from voxel_sprite import OUTLINE, VoxelGrid, outline, render, write_png

HERE = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location('barracks', HERE / 'generate-barracks.py')
barracks = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(barracks)

OUTPUT = HERE.parent / 'public/resources/barracks/hunters-academy.png'
CELL = 110
WIDTH, HEIGHT, ORIGIN = barracks.WIDTH, barracks.HEIGHT + CELL, barracks.ORIGIN + CELL

(DECK, LOGS, CLAD, OAK, ROOF, PANE, BLUE, DOOR, ARCH, STRAW, CORD, DARK, T_LOGS, T_POST, T_ROOM, T_RAIL,
 T_CAP, T_PIN, SACK, PALISADE, PLAQUE, FUR, ANTLER, EYE, EARTH, FENCE, PLANK_WALL, BOW, STRING, SHAFT,
 HEAD, FLETCH, FEATHER, TARGET, TRUNK_L, LEAVES_L, TRUNK_R, LEAVES_R, TRAP, SPRING) = range(1, 41)

WOOD = barracks.WOOD
DARK_WOOD = ('3f323c', '5e4448', '86604c', 'a87c5a')
LOG_WOOD = barracks.LOOKOUT_WOOD
DECK_WOOD = ('4e4650', '6e6460', '928579', 'b4a690')  # weathered boards, so the dummy stands out
FUR_RAMP = ('4e3036', '7a4a3a', 'a86a44', 'cc935e')
BONE = ('6e6058', 'a8977e', 'd8ccb0', 'f0e8d0')
EARTH_RAMP = ('5a4650', '7a6058', '9c7e66', 'b89c7c')
IRON = ('3e3a4c', '5c5a6a', '82808e', 'aab0b8')
RED = ('7a2a36', 'b43c3c', 'dc5a48')
CREAM = 'efe4c4'
LEAVES = ('263a48', '2c5e4e', '468846', '78b250', 'bcd66c')
CX, CY = barracks.CX, barracks.CY
ENTRY = barracks.ENTRY
DOOR_HALF, DOOR_SPRING = 11, 26
TROPHY_Z = 52


class Tree:
    def __init__(self, x, y, trunk, radius, seed, trunk_label, leaves_label):
        self.x, self.y, self.trunk, self.radius, self.seed = x, y, trunk, radius, seed
        self.canopy_z = trunk + radius * .7
        self.trunk_label, self.leaves_label = trunk_label, leaves_label


# The range is pulled toward the hall by RANGE_SHIFT voxels, so it starts right behind the roof.
RANGE_SHIFT = 20
TREES = (Tree(-26, 218 - RANGE_SHIFT, 26, 13, 1, TRUNK_L, LEAVES_L),
         Tree(27, 238 - RANGE_SHIFT, 28, 16, 2, TRUNK_R, LEAVES_R))
TARGET_AT = (27, 15)  # x, z on the right trunk's front
TRAP_AT = (0, 258 - RANGE_SHIFT)


def noise(*values):
    h = 2166136261
    for value in values:
        h = ((h ^ (value & 0xffffffff)) * 16777619) & 0xffffffff
    h ^= h >> 13
    return ((h * 1274126177) & 0xffff) / 0xffff


def hall(g):
    b = g.box
    b(-45, 46, 3, 43, 2, 84, CLAD)
    b(-45, 46, 2, 43, 2, 9, LOGS)
    for x in (-45, -6, 40):
        b(x, x+5, 1, 4, 8, 84, OAK)
    b(-46, 4, 0, 5, 42, 49, OAK)
    b(-46, 4, -1, 3, 46, 49, BLUE)
    for i in range(20):
        b(-42+i, -39+i, 1, 3, 23+i, 27+i, OAK)
        b(-7-i, -4-i, 1, 3, 23+i, 27+i, OAK)
    b(-25, -21, 1, 4, 49, 78, OAK)
    for left in (-40, -21):
        x = left + 7
        b(x-4, x+5, 1, 4, 56, 72, OAK)
        b(x-2, x+3, 0, 3, 59, 70, PANE)
        b(x-5, x+6, -1, 2, 55, 58, OAK)
    b(-45, 46, 0, 43, 78, 84, OAK)
    # A smaller wooden arch leaves the wall above it to the trophy.
    for dx in range(-DOOR_HALF, DOOR_HALF+1):
        for z in range(2, DOOR_SPRING + DOOR_HALF + 1):
            r = math.hypot(dx, max(0, z-DOOR_SPRING))
            if r <= DOOR_HALF:
                ring = r > DOOR_HALF - 4
                b(ENTRY+dx, ENTRY+dx+1, -1 if ring else 1, 5, z, z+1, ARCH if ring else DOOR)
    for x in range(36, 42):
        b(x, x+1, -2, 0, 62 + min(x-36, 41-x), 78, BLUE)
    for x in range(-50, 51):
        for y in range(-3, 48):
            rise = min(50-abs(x), y+3, 47-y)
            top = 83 + round(rise * 1.40)
            b(x, x+1, y, y+1, top-3, top+1, ROOF)


def ellipsoid(g, cx, cy, cz, rx, ry, rz, label):
    for z in range(math.floor(cz-rz), math.ceil(cz+rz)+1):
        for y in range(math.floor(cy-ry), math.ceil(cy+ry)+1):
            for x in range(math.floor(cx-rx), math.ceil(cx+rx)+1):
                if ((x+.5-cx)/rx)**2 + ((y+.5-cy)/ry)**2 + ((z+.5-cz)/rz)**2 <= 1:
                    g.set(x, y, z, label)


def trophy(g):
    """A deer's head on a wooden shield, above the door."""
    x0, z0 = ENTRY, TROPHY_Z
    for z in range(z0-12, z0+7):
        half = 8 if z >= z0-5 else 3 + (z-(z0-12))*5//7
        g.box(x0-half, x0+half+1, 1, 3, z, z+1, PLAQUE)
    ellipsoid(g, x0+.5, -1.5, z0+1, 6, 4.5, 5.5, FUR)
    ellipsoid(g, x0+.5, -4.5, z0-6, 3.5, 4, 5, FUR)
    for side in (-1, 1):
        ear = x0 + .5 + side * 8
        ellipsoid(g, ear, -1.5, z0+4, 2.5, 1.5, 1.5, FUR)
        # Antlers: a beam curving up and out, two tines rising from it.
        def at(t):
            return x0 + side * round(4 + 9 * t), z0 + 5 + round(17 * t - 3 * t * t)
        for i in range(19):
            ax, az = at(i / 18)
            g.box(ax, ax+2, -3, -1, az, az+2, ANTLER)
        for t, length in ((.3, 7), (.65, 6)):
            ax, az = at(t)
            for k in range(length):
                tx = ax - side * (k // 3)
                g.box(tx, tx+2, -3, -1, az+k, az+k+2, ANTLER)
    for side in (-1, 1):
        ex = x0 + side * 3
        g.box(ex, ex+2, -6, -5, z0+1, z0+3, EYE)
    g.box(x0-1, x0+3, -9, -7, z0-10, z0-8, EYE)


def lookout(g):
    b = g.box
    for y in range(-31, 5, 4):
        top = 23 + round(3 * noise(y, 7))
        b(-47, -41, y, y+4, 2, top, PALISADE)
        b(-46, -42, y+1, y+3, top, top+2, PALISADE)
    x, y = -41, -35
    b(x-8, x+8, y-8, y+8, 3, 22, T_LOGS)
    b(x-1, x+2, y-8, y-6, 8, 16, 0)
    b(x-1, x+2, y-6, y-5, 8, 16, DARK)
    b(x-9, x+9, y-9, y+9, 22, 24, T_POST)
    b(x-6, x+6, y-6, y+6, 24, 35, T_ROOM)
    for px in (x-8, x+5):
        for py in (y-8, y+5):
            b(px, px+3, py, py+3, 24, 35, T_POST)
    b(x-8, x+8, y-8, y-6, 24, 27, T_RAIL)
    for i in range(13):
        h = math.ceil(10 * (1-i/13) + .5)
        b(x-h, x+h, y-h, y+h, 35+i, 36+i, T_CAP)
    b(x-1, x+1, y-1, y+1, 48, 51, T_PIN)


def dummy(g):
    b = g.box
    b(CX-2, CX+3, CY-1, CY+2, 3, 13, OAK)
    for z in range(11, 40):
        if z < 28:
            width = min(8, 4 + (z-11)//2) if z < 26 else 7 - (z-26)*2
        else:
            width = (3, 3, 4, 5, 5, 5, 5, 5, 4, 4, 3, 2)[z-28]
        for x in range(-width, width+1):
            depth = round(3.5 * math.sqrt(1 - (x/(width+.5))**2))
            mat = CORD if z in (12, 28, 29) else SACK
            b(CX+x, CX+x+1, CY-depth, CY+depth+1, z, z+1, mat)
    for side in (-1, 1):
        for z in range(21, 27):
            reach = (10, 12, 10, 13, 11, 10)[z-21]
            for d in range(7, reach+1):
                b(CX+side*d, CX+side*d+1, CY-1, CY+2, z, z+1, STRAW if d >= 9 else SACK)


def court(g):
    def b(x0, x1, y0, y1, z0, z1, label):
        g.box(x0, x1, y0 - RANGE_SHIFT, y1 - RANGE_SHIFT, z0, z1, label)
    b(-47, 47, 43 + RANGE_SHIFT, 286, 0, 2, EARTH)
    # Log fence on the sides and the back.
    for y in list(range(60, 284, 22)) + [282]:
        for x in (-47, 44):
            b(x, x+3, y, y+3, 2, 13, FENCE)
    for x in range(-47, 47, 23):
        b(x, x+3, 282, 285, 2, 13, FENCE)
    b(44, 47, 282, 285, 2, 13, FENCE)
    for x in (-47, 44):
        b(x, x+3, 50, 285, 8, 10, FENCE)
    b(-47, 47, 282, 285, 8, 10, FENCE)
    # Low plank wall on the left, the bow leaning on its front.
    b(-42, -12, 176, 181, 2, 15, PLANK_WALL)
    b(-43, -11, 175, 182, 15, 17, PLANK_WALL)
    for i in range(40):
        z = 2 + i
        bend = 6 * math.sin(math.pi * i / 39)
        x = round(-41 + bend + i * .2)
        b(x, x+2, 171, 174, z, z+1, BOW)
    for i in range(38):
        z = 3 + i
        x = round(-41 + i * .2 + .5)
        b(x, x+1, 171, 172, z, z+1, STRING)
    for tree in TREES:
        grow_tree(g, tree)
    tx, tz = TARGET_AT
    trunk_front = TREES[1].y - 5
    for z in range(tz-8, tz+9):
        for x in range(tx-8, tx+9):
            if math.hypot(x+.5-tx-.5, z+.5-tz-.5) <= 7.6:
                g.box(x, x+1, trunk_front-3, trunk_front, z, z+1, TARGET)
    trap(g)
    arrow(g, (37, 180 - RANGE_SHIFT), (24, 195 - RANGE_SHIFT))
    # Two arrows standing against the wall, heads up, white fletching at the bottom.
    for x0 in (-20, -13):
        for z in range(2, 30):
            y = 173 + (z > 14)
            label = FEATHER if z < 9 else SHAFT
            b(x0, x0+2, y, y+2, z, z+1, label)
            if z < 8 and z % 2 == 0:
                b(x0-1, x0+3, y, y+2, z, z+1, FEATHER)
        for z, half in ((30, 1), (31, 1), (32, 0), (33, 0)):
            b(x0-half, x0+2+half, 174, 176, z, z+1, HEAD)
    # One arrow stuck in the target, its fletching toward the camera.
    for y in range(trunk_front-13, trunk_front-3):
        g.box(tx+1, tx+3, y, y+1, tz+2, tz+4, FLETCH if y < trunk_front-10 else SHAFT)


def arrow(g, tail, head):
    (x0, y0), (x1, y1) = tail, head
    steps = round(math.hypot(x1-x0, y1-y0))
    for i in range(steps+1):
        t = i / steps
        x, y = round(x0 + (x1-x0)*t), round(y0 + (y1-y0)*t)
        label = FLETCH if i < 4 else HEAD if i > steps - 3 else SHAFT
        g.box(x, x+2, y, y+2, 2, 4, label)
    for side in (-1, 1):
        g.box(x1 + side*2, x1 + side*2 + 2, y1-1, y1+1, 2, 4, HEAD)


def trap(g):
    """A set bear trap: an iron ring with its teeth up, a pan in the middle and a spring arm on each side."""
    x0, y0 = TRAP_AT
    for y in range(y0-14, y0+15):
        for x in range(x0-14, x0+15):
            r = math.hypot(x+.5-x0, y+.5-y0)
            if 9 <= r <= 12:
                g.box(x, x+1, y, y+1, 2, 4, TRAP)
                angle = math.atan2(y+.5-y0, x+.5-x0)
                if r <= 11 and (angle * 16 / math.pi) % 2 < 1:
                    g.box(x, x+1, y, y+1, 4, 9 - round(r - 9), TRAP)
            elif r <= 3:
                g.box(x, x+1, y, y+1, 2, 4, TRAP)
    for side in (-1, 1):
        for d in range(12, 19):
            g.box(x0 + side*d - (1 if side < 0 else 0), x0 + side*d + (1 if side > 0 else 0), y0-1, y0+2, 2, 4, SPRING)


def grow_tree(g, tree):
    reach = 10
    for z in range(2, round(tree.canopy_z)):
        radius = 5 + 4 * max(0, 1 - (z-2) / 6) ** 2
        for y in range(tree.y - reach, tree.y + reach):
            for x in range(tree.x - reach, tree.x + reach):
                if math.hypot(x + .5 - tree.x, y + .5 - tree.y) <= radius:
                    g.set(x, y, z, tree.trunk_label)
    balls = [(tree.x, tree.y, tree.canopy_z, tree.radius)]
    for i in range(10):
        angle = 2 * math.pi * (i + noise(tree.seed, i, 1) * .6) / 10
        elevation = math.radians(-10 + 60 * noise(tree.seed, i, 2))
        distance = tree.radius * .8
        balls.append((tree.x + math.cos(angle) * math.cos(elevation) * distance,
                      tree.y + math.sin(angle) * math.cos(elevation) * distance,
                      tree.canopy_z + math.sin(elevation) * distance,
                      tree.radius * .5 * (.8 + .4 * noise(tree.seed, i, 3))))
    for bx, by, bz, r in balls:
        ellipsoid(g, bx, by, bz, r, r, r, tree.leaves_label)


def ramp(colors, h, offsets=(.12, .5, .79)):
    light = h.light(h.normal())
    return colors[min(len(colors)-1, sum(light > o for o in offsets))]


def under_canopy(x, y):
    return any(math.hypot(x - t.x, y - (t.y - 4)) < t.radius * .85 for t in TREES)


def shade(h):
    x, y, z, mat = h.mx, h.my, h.z, h.label
    top = not h.neighbor(0, 0, 1)
    if mat == ROOF:
        lateral = 50-abs(x) < min(y+3, 47-y)
        return barracks.tile_color((4 if x < 0 else 2) if lateral else 3,
                                   y if lateral else x, 50-abs(x) if lateral else y+3)
    if mat == T_CAP:
        dx, dy = x+41.5, y+35.5
        side = abs(dx) > abs(dy)
        base = (3 if dx < 0 else 1) if side else (3 if dy < 0 else 2)
        return barracks.tile_color(1 if z == 35 else base, y if side else x, z)
    if mat in (T_LOGS, LOGS):
        if top:
            return LOG_WOOD[3]
        course, v = divmod(z - 3, 4)
        return LOG_WOOD[0 if v == 3 else 1 if v == 0 or (x*5+course*11) % 17 == 0 else 2]
    if mat == PALISADE:
        if top:
            return LOG_WOOD[3]
        u = (y + 64) % 4
        return LOG_WOOD[1 if u == 0 else 3 if u == 1 and x < -45 else 2]
    if mat in (T_POST, FENCE):
        return LOG_WOOD[3 if top else 2 - ((x*7+y*3+z//5) % 11 == 0)]
    if mat == T_ROOM:
        return LOG_WOOD[0 if (x+64) % 4 == 0 else 1]
    if mat == T_RAIL:
        return LOG_WOOD[1 if (y+64) % 4 == 0 else 3]
    if mat == T_PIN:
        return LOG_WOOD[3 if top or not h.neighbor(-1, 0, 0) else 2]
    if mat == DECK:
        if not top:
            return DECK_WOOD[1]
        board, u = divmod(x + 64, 6)
        joint = (y + 64 + 17 * board) % 29 == 0
        if u == 0 or joint:
            return DECK_WOOD[1]
        shaded = y > -3 or abs(x-CX-1) < 8 and abs(y-CY+2) < 4
        return DECK_WOOD[2 if shaded or (board * 5 + y // 11) % 7 == 0 else 3]
    if mat == CLAD:
        if z >= 74:
            return DARK_WOOD[1]
        course, v = divmod(z, 5)
        if v == 0 or (x + 64 + 9 * course) % 23 == 0:
            return DARK_WOOD[1]
        return DARK_WOOD[3 if (x*3 + course*7) % 19 == 0 else 2]
    if mat == ARCH:
        angle = math.atan2(max(0, z-DOOR_SPRING), x-ENTRY)
        seam = (z % 7 == 0) if z <= DOOR_SPRING else (angle*7/math.pi) % 1 < .12
        return WOOD[1 if seam else 3 if top or x < ENTRY-7 else 2]
    if mat == DOOR:
        if z in (8, 9, 22, 23) or x == ENTRY:
            return '52454b'
        return WOOD[1 if (x-ENTRY) % 5 == 0 or z > DOOR_SPRING + 6 else 2]
    if mat == OAK:
        return WOOD[3 if top else 1 if (x*7+z//7) % 11 < 2 else 2]
    if mat == PLAQUE:
        return WOOD[3 if top else 1 if abs(x-ENTRY) >= 6 else 2]
    if mat == FUR:
        return ramp(FUR_RAMP, h, (-.1, .35, .7))
    if mat == ANTLER:
        return BONE[3 if top else 2 if not h.neighbor(-1, 0, 0) else 1]
    if mat == EYE:
        return '2a2230'
    if mat == SACK:
        dx = x - CX
        if y < CY:
            if z < 28:
                radius = math.hypot(dx, (z-21)*.8)
                if 3.1 <= radius <= 4.9 or radius <= 1.4:
                    return '733d34'
                if dx == 0 and z % 3 and z < 17:
                    return '825344'
            elif z == 34 and abs(dx) == 2:
                return '563d38'
        return ramp(('8b5944', 'ad7851', 'c99565', 'd9ac78'), h)
    if mat == STRAW:
        return ramp(('98714f', 'c89651', 'e8bd6b', 'f3da91'), h, (.15, .48, .75))
    if mat == PANE:
        return '627b8c' if z >= 64 and x % 3 else '394250'
    if mat == EARTH:
        if not top:
            return EARTH_RAMP[1]
        step = 3 - (noise(x // 3, y // 3, 9) < .25)
        if under_canopy(x, y):
            step = 1
        elif noise(x // 2, y // 2, 4) > .93:
            step = 2
        return EARTH_RAMP[step]
    if mat == PLANK_WALL:
        if top:
            return DARK_WOOD[3]
        return DARK_WOOD[1 if (x + 64) % 5 == 0 else 2]
    if mat == BOW:
        if 20 <= z <= 24:
            return '4e3036'
        return WOOD[3 if not h.neighbor(-1, 0, 0) else 2]
    if mat == STRING:
        return CREAM
    if mat == SHAFT:
        return WOOD[3 if top else 2]
    if mat == HEAD:
        return IRON[3 if top or not h.neighbor(-1, 0, 0) else 2]
    if mat == FEATHER:
        return CREAM if top or not h.neighbor(-1, 0, 0) else 'c8bca0'
    if mat == FLETCH:
        return RED[2 if top else 1]
    if mat == TARGET:
        r = math.hypot(x+.5-TARGET_AT[0]-.5, z+.5-TARGET_AT[1]-.5)
        if not top and h.neighbor(0, -1, 0):
            return RED[0]
        return RED[1] if r <= 2.2 else CREAM if r <= 4.4 else RED[2] if r <= 6.4 else CREAM
    if mat in (TRAP, SPRING):
        if not top:
            return IRON[1]
        return IRON[3 if z >= 6 else 2 if z >= 4 else 1]
    for tree in TREES:
        if mat == tree.trunk_label:
            if z > tree.trunk - 4:
                return LOG_WOOD[0]
            step = 2 if h.light(h.normal()) > .35 else 1
            return LOG_WOOD[max(0, step - (noise(x, y, 5) < .25))]
        if mat == tree.leaves_label:
            normal = h.normal()
            light = h.light(normal)
            step = 0 if normal[2] < -.35 else sum(light >= t for t in (-.05, .35, .62, .86))
            cluster = noise(x // 3, y // 3, z // 3, mat)
            step += -1 if cluster < .18 else 1 if cluster > .82 and step < 4 else 0
            return LEAVES[max(0, min(4, step))]
    return {BLUE: '517ac1', CORD: '825646', DARK: '363443'}[mat]


QUIET_SEAMS = ({CORD, STRAW, SACK, OAK}, {BOW, STRING}, {SHAFT, FLETCH, FEATHER, HEAD}, {TRAP, SPRING}, {FUR, EYE})


def seam(a, b):
    if any({a, b} <= group for group in QUIET_SEAMS):
        return None
    return OUTLINE


def shadow(x, y):
    return min(max(abs(x)-47, -45-y, y-44)/2, max(abs(x)-46, -y, y-44)/5,
               max(-49-x, x+34, -45-y, y+28)/3, max(abs(x)-48, 43-y, y-287+RANGE_SHIFT)/2)


if __name__ == '__main__':
    g = VoxelGrid(64, 320)
    g.box(-47, 47, -43, 44, 0, 3, DECK)
    court(g)
    hall(g)
    trophy(g)
    lookout(g)
    dummy(g)

    def rgba(h):
        return (*bytes.fromhex(shade(h)), 255)

    sprite = render(g, 0, WIDTH, HEIGHT, ORIGIN, rgba, (1, 1), .2, shadow)
    outline(sprite, seam, depth_gap=7, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f'wrote {OUTPUT.relative_to(HERE.parent)}')
