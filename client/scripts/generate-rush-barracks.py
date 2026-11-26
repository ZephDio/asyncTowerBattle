#!/usr/bin/env python3
"""Render the rush barracks to public/resources/barracks/rush-barracks.png.

The rush barracks is a horizontal two-cell piece (`oo`): the approved basic barracks
(generate-barracks.py, imported unchanged) on the left cell, and a side cantina on the
right cell under a lean-to roof leaning on the hall's right wall. The cantina holds a
straw bee skep hanging from the front beam, a banquet table on trestles with stools,
two banded beer barrels and a roast on a spit between crossed posts over a small fire.

The canvas keeps the barracks' height and ground row, and is two of its cells wide, so
both pieces share the same pixels per grid unit and the same ground anchor.
"""
import importlib.util
import math
from pathlib import Path

from voxel_sprite import OUTLINE, Hit, VoxelGrid, outline, render, write_png

HERE = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location('barracks', HERE / 'generate-barracks.py')
barracks = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(barracks)

OUTPUT = HERE.parent / 'public/resources/barracks/rush-barracks.png'
WIDTH, HEIGHT, ORIGIN = 2 * barracks.WIDTH, barracks.HEIGHT, barracks.ORIGIN
HALL_X = -55  # the barracks model's center, so it sits on the left cell
RIGHT_WALL = HALL_X + 46  # the hall's right wall, the lean-to's high side
FLOOR_RIGHT = 101

(C_POST, C_BEAM, C_ROOF, C_BACK, TABLE, TRESTLE, STOOL, BARREL, HOOP, LID, SKEP, HONEY,
 ROPE, BEE, BEE_DARK, SPIT, ROAST, BONE, FIRE, LOG, MUG) = range(30, 51)

WOOD = barracks.WOOD
DARK_WOOD = ('3f323c', '5e4448', '86604c', 'a87c5a')
STRAW = ('7a5a44', 'b0854c', 'd8ac5c', 'efd28a')
HONEY_RAMP = ('a8641e', 'd8962a', 'f2c044', 'fbe08a')
MEAT = ('5e2e34', '8c4236', 'b8643e', 'dc9658')
FIRE_RAMP = ('c8402c', 'ec7a2c', 'f8b844', 'fde894')
IRON = ('3e3a4c', '5c5a6a', '82808e')
ROOF_LOW, ROOF_HIGH = 46, 62
FRONT = -4  # front beam of the lean-to


def roof_z(x):
    return ROOF_HIGH - round((x - RIGHT_WALL) * (ROOF_HIGH - ROOF_LOW) / (FLOOR_RIGHT - RIGHT_WALL))


class Shifted:
    """Hands the barracks builders a grid moved along x, so they draw on the left cell."""

    def __init__(self, grid, dx):
        self.grid, self.dx = grid, dx

    def box(self, x0, x1, y0, y1, z0, z1, label):
        self.grid.box(x0 + self.dx, x1 + self.dx, y0, y1, z0, z1, label)


def lean_to(g):
    b = g.box
    # Plank back wall closes the cantina so the props read against it.
    for x in range(RIGHT_WALL, FLOOR_RIGHT - 3):
        b(x, x + 1, 38, 42, 3, roof_z(x) - 2, C_BACK)
    for x in (RIGHT_WALL + 2, 40, FLOOR_RIGHT - 7):
        b(x, x + 4, FRONT, FRONT + 4, 3, roof_z(x) - 2, C_POST)
        b(x, x + 4, 36, 40, 3, roof_z(x) - 2, C_POST)
    for x in range(RIGHT_WALL, FLOOR_RIGHT + 1):
        top = roof_z(x)
        b(x, x + 1, FRONT - 1, FRONT + 3, top - 5, top - 2, C_BEAM)
        b(x, x + 1, FRONT - 5, 46, top - 2, top + 1, C_ROOF)


def skep(g):
    """Coiled straw hive hanging from the front beam by a rope."""
    b = g.box
    cx, cy, base = 14, FRONT - 4, 26
    b(cx - 1, cx + 1, cy - 1, cy + 1, base + 16, roof_z(cx) - 4, ROPE)
    for z in range(base, base + 17):
        t = (z - base) / 16
        r = 10.5 * math.sqrt(max(0, 1 - t ** 2.2)) if t > .1 else 9 + 15 * t
        for x in range(-11, 12):
            for y in range(-11, 12):
                if x * x + y * y <= r * r:
                    g.set(cx + x, cy + y, z, SKEP)
    # Honey-glazed entrance on the front, low on the dome.
    for x in range(-3, 4):
        for z in range(base + 3, base + 8):
            if (x / 3.5) ** 2 + ((z - base - 5) / 2.6) ** 2 <= 1:
                for y in range(-12, -7):
                    if g.get(cx + x, cy + y, z) == SKEP or y == -8:
                        g.set(cx + x, cy + y, z, HONEY)
    # Drips under the hive rim.
    for dx, length in ((-4, 6), (3, 4), (6, 2)):
        b(cx + dx, cx + dx + 2, cy - 8, cy - 6, base - length, base, HONEY)
    # A few bees: a yellow body with a dark tail.
    for bx, by, bz in ((cx - 15, cy - 6, base + 14), (cx + 16, cy - 8, base + 18), (cx + 12, cy - 12, base + 2)):
        b(bx, bx + 2, by, by + 2, bz, bz + 2, BEE)
        b(bx + 2, bx + 3, by, by + 2, bz, bz + 2, BEE_DARK)


def banquet(g):
    b = g.box
    x0, x1, y0, y1 = 0, 46, -28, -15
    b(x0, x1, y0, y1, 13, 15, TABLE)
    for x in (x0 + 4, x1 - 7):
        for z in range(3, 13):
            spread = (13 - z) // 3
            b(x, x + 3, y0 + 1 - spread, y0 + 3 - spread, z, z + 1, TRESTLE)
            b(x, x + 3, y1 - 3 + spread, y1 - 1 + spread, z, z + 1, TRESTLE)
        b(x, x + 3, y0 + 1, y1 - 1, 7, 9, TRESTLE)
    # Tankards and a bowl on the table.
    for mx in (10, 30):
        b(mx, mx + 3, -23, -20, 15, 19, MUG)
    for sx, sy in ((6, -36), (30, -36), (20, -8)):
        for x in range(-3, 4):
            for y in range(-3, 4):
                if x * x + y * y <= 10:
                    b(sx + x, sx + x + 1, sy + y, sy + y + 1, 3, 9, STOOL)


def barrels(g):
    for cx, cy in ((64, -28), (84, -24)):
        for z in range(3, 21):
            t = (z - 12) / 9
            r = 7.5 - 1.6 * t * t
            label = HOOP if z in (5, 6, 17, 18) else BARREL
            for x in range(-8, 9):
                for y in range(-8, 9):
                    if x * x + y * y <= r * r:
                        g.set(cx + x, cy + y, z, LID if z == 20 else label)


def roast(g):
    b = g.box
    y = 10
    for px in (56, 96):
        for i in range(32):
            z = 3 + i
            b(px - 7 + i * 10 // 31, px - 5 + i * 10 // 31, y - 1, y + 1, z, z + 1, C_POST)
            b(px + 5 - i * 10 // 31, px + 7 - i * 10 // 31, y + 1, y + 3, z, z + 1, C_POST)
    b(50, 101, y, y + 2, 25, 27, SPIT)
    b(48, 51, y - 2, y + 4, 23, 29, SPIT)  # crank
    cx, cz = 76, 25
    for x in range(-11, 12):
        for yy in range(-6, 7):
            for z in range(-7, 8):
                if (x / 11) ** 2 + (yy / 6) ** 2 + (z / 7) ** 2 <= 1:
                    g.set(cx + x, y + 1 + yy, cz + z, ROAST)
    b(cx + 10, cx + 16, y - 1, y + 3, cz - 1, cz + 3, BONE)
    b(cx + 15, cx + 18, y - 2, y + 4, cz - 2, cz + 4, BONE)
    # Crossed logs and a low flame under the roast.
    b(cx - 9, cx + 9, y - 1, y + 3, 3, 6, LOG)
    b(cx - 2, cx + 2, y - 8, y + 10, 3, 5, LOG)
    for z in range(6, 15):
        r = 6 - (z - 6) * .6
        for x in range(-6, 7):
            for yy in range(-5, 6):
                wave = 1.5 * math.sin(x * 1.7 + z)
                if x * x + yy * yy <= (r + wave) ** 2 * .7:
                    g.set(cx + x, y + 1 + yy, z, FIRE)


def ramp(colors, h, offsets=(.12, .5, .79)):
    light = h.light(h.normal())
    return colors[min(len(colors) - 1, sum(light > o for o in offsets))]


def shade_cantina(h):
    x, y, z, mat = h.mx, h.my, h.z, h.label
    top = not h.neighbor(0, 0, 1)
    if mat == C_ROOF:
        return barracks.tile_color(3 if top else 1, y, x - RIGHT_WALL)
    if mat in (C_POST, C_BEAM):
        return WOOD[3 if top else 1 if (x * 7 + z // 7) % 11 < 2 else 2]
    if mat == C_BACK:
        seam = (x - RIGHT_WALL) % 6 == 0
        return DARK_WOOD[0 if seam else 1 + ((x // 6 * 5 + z // 9) % 4 == 0)]
    if mat == TABLE:
        if top:
            return WOOD[2] if (y + 28) % 5 == 0 else WOOD[3]
        return WOOD[1]
    if mat in (TRESTLE, STOOL):
        return DARK_WOOD[3 if top else 2 if not h.neighbor(-1, 0, 0) else 1]
    if mat == BARREL:
        stave = (math.atan2(y + 26, x - 74) * 7) % 1 < .15
        return WOOD[1] if stave else ramp(WOOD[1:], h, (.15, .55))
    if mat == LID:
        return WOOD[3] if (x % 4) else WOOD[2]
    if mat in (HOOP, SPIT):
        return IRON[2 if top else 1]
    if mat == SKEP:
        coil = (z - 26) % 3 == 0
        base = ramp(STRAW, h, (.0, .4, .72))
        return STRAW[max(0, STRAW.index(base) - 1)] if coil else base
    if mat == HONEY:
        return HONEY_RAMP[3 if top else 2 if z > 28 else 1]
    if mat == ROPE:
        return STRAW[1]
    if mat == BEE:
        return 'f6cc3c'
    if mat == BEE_DARK:
        return '3c3240'
    if mat == ROAST:
        light = h.light(h.normal())
        if (x - 76) % 6 == 0 and light < .5:
            return MEAT[0]
        return MEAT[min(3, sum(light > o for o in (-.1, .3, .7)))]
    if mat == BONE:
        return 'eee4cc' if top else 'c8bba4'
    if mat == FIRE:
        return FIRE_RAMP[min(3, (z - 6) // 2 if abs(x - 76) < 3 else (z - 6) // 3)]
    if mat == LOG:
        return DARK_WOOD[2 if top else 1]
    if mat == MUG:
        return 'f5efdc' if top else WOOD[1]
    raise ValueError(mat)


def shade(h):
    if h.label < C_POST:
        dx = HALL_X
        shifted = Hit(h.label, h.x - dx, h.y, h.z, h.mx - dx, h.my,
                      lambda x, y, z: h.lookup(x + dx, y, z))
        return barracks.shade(shifted)
    return shade_cantina(h)


if __name__ == '__main__':
    g = VoxelGrid(half_x=128)
    g.box(HALL_X - 47, FLOOR_RIGHT, -43, 44, 0, 3, barracks.PAVE)
    hall_grid = Shifted(g, HALL_X)
    barracks.hall(hall_grid)
    barracks.lookout(hall_grid)
    barracks.training(hall_grid)
    lean_to(g)
    skep(g)
    banquet(g)
    barrels(g)
    roast(g)

    def shadow(x, y):
        hx = x - HALL_X
        return min(max(HALL_X - 47 - x, x - FLOOR_RIGHT, -45 - y, y - 44) / 2,
                   max(abs(hx) - 46, -y, y - 44) / 5,
                   max(-49 - hx, hx + 34, -45 - y, y + 28) / 3)

    soft = {barracks.CORD, barracks.STRAW, barracks.SACK, barracks.OAK, barracks.HAFT, FIRE, LOG, BEE, BEE_DARK,
            ROPE, SKEP, HONEY, C_POST, C_BEAM}

    def seam(a, b):
        return None if {a, b} <= soft else OUTLINE

    def rgba(h):
        return (*bytes.fromhex(shade(h)), 255)

    sprite = render(g, 0, WIDTH, HEIGHT, ORIGIN, rgba, (1, 1), .2, shadow)
    outline(sprite, seam, depth_gap=7, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
