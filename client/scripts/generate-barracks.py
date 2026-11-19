#!/usr/bin/env python3
"""Render composition 2 of the basic barracks to public/resources/house/barracks.png.

The hall has two bays: a jettied living floor above the rack, and a double-height
entry on the right. The left curtain wall joins the hall to the lookout. All
geometry, including the straw figure, is sampled by the same oblique camera.
"""
import math
from pathlib import Path

from voxel_sprite import OUTLINE, VoxelGrid, outline, render, write_png

OUTPUT = Path(__file__).resolve().parents[1] / 'public/resources/house/barracks.png'
WIDTH, HEIGHT, ORIGIN = 110, 143, 108
PAVE, ROCK, LIME, OAK, ROOF, PANE, BLUE, DOOR, ARCH, STEEL, STRAW, CORD, DARK = range(1, 14)
WOOD = ('51404a', '77534b', 'a77855', 'd4a470')
STONE = ('504c60', '737380', '96969d', 'b8b7b3', 'd6d3c5')
TILES = ('583c48', '885852', 'b47a5e', 'daa876', 'f0ce96')
T_STONE, T_POST, T_ROOM, T_RAIL, T_CAP, T_PIN = range(14, 20)
SACK = 20
LOOKOUT_WOOD = ('5a4646', '866353', 'b48355', 'dab570')
LOOKOUT_STONE = ('3a3648', '585666', '7c7a86', 'a4a2a6', 'cccac2')
CX, CY = 2, -34  # straw figure
ENTRY = 21


def hall(g):
    b = g.box
    b(-45, 46, 3, 43, 2, 84, LIME)
    b(-45, 46, 2, 43, 2, 9, ROCK)
    for x in (-45, -6, 40):
        b(x, x+5, 1, 4, 8, 84, OAK)
    # Cross beam and diagonal knees over the rack. The blue fascia ends at the entry bay.
    b(-46, 4, 0, 5, 42, 49, OAK)
    b(-46, 4, -1, 3, 46, 49, BLUE)
    for i in range(13):
        b(-43+i, -39+i, 1, 3, 29+i, 34+i, OAK)
    # A longer right knee leaves plaster visible beside the doorway post.
    for i in range(20):
        b(-7-i, -4-i, 1, 3, 23+i, 27+i, OAK)
    # Split the span between the outer posts into two 15-voxel plaster bays.
    b(-25, -21, 1, 4, 49, 78, OAK)
    for left in (-40, -21):
        x = left + 7
        b(x-4, x+5, 1, 4, 56, 72, OAK)
        b(x-2, x+3, 0, 3, 59, 70, PANE)
        b(x-5, x+6, -1, 2, 55, 58, OAK)
    b(-45, 46, 0, 43, 78, 84, OAK)
    # Tall arch: straight jambs and individual wedge joints above the spring line.
    for dx in range(-17, 18):
        for z in range(2, 65):
            r = math.hypot(dx, max(0, z-43))
            if r <= 17:
                ring = r > 12
                b(ENTRY+dx, ENTRY+dx+1, -1 if ring else 1, 5, z, z+1, ARCH if ring else DOOR)
    # A small fork-tailed pennant hangs from the high right-hand bay.
    for x in range(33, 41):
        b(x, x+1, -1, 1, 60 + min(x-33, 40-x), 78, BLUE)
    # Equal pitch on all four planes leaves a short ridge between the hips.
    for x in range(-50, 51):
        for y in range(-3, 48):
            rise = min(50-abs(x), y+3, 47-y)
            top = 83 + round(rise * 1.40)
            b(x, x+1, y, y+1, top-3, top+1, ROOF)


def lookout(g):
    b = g.box
    b(-47, -40, -31, 5, 2, 22, ROCK)
    for y in range(-28, 4, 9):
        b(-47, -43, y, y+4, 22, 27, ROCK)
    # Composition 1 sentinel, translated to the end of this curtain wall.
    x, y = -41, -35
    b(x-8, x+8, y-8, y+8, 3, 22, T_STONE)
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


def training(g):
    b = g.box
    for x in (-31, -9):
        b(x, x+3, -4, 0, 2, 21, OAK)
    for z in (5, 15):
        b(-31, -6, -5, -2, z, z+4, OAK)
    for x, h in ((-26, 30), (-19, 23), (-12, 34)):
        b(x-1, x+2, -7, -4, 4, h, OAK if x != -19 else STEEL)
        if x == -19:
            b(x-3, x+4, -7, -4, h-3, h, OAK)
            b(x-1, x+2, -7, -4, h, h+5, OAK)
        else:
            for i, w in enumerate((1, 2, 2, 2, 1, 1, 0)):
                b(x-w, x+w+1, -7, -4, h+i, h+i+1, STEEL)

    # Stuffed sack on one stake. Broad shoulders pinch down to a bound hem.
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


def tile_color(base, along, course):
    row, v = divmod(course, 3)
    col = (along + 64 + 2*(row%2)) // 4
    # Composition 1's deterministic mottling: one mark per individual tile.
    n = 2166136261
    for value in (col, row, 5):
        n = ((n ^ value) * 16777619) & 0xffffffff
    mark = (((n ^ (n >> 13)) * 1274126177) & 0xffff) / 65535
    return TILES[max(0, min(4, base - (mark < .38) + (mark > .93) - (v == 0)))]


def shade(h):
    x, y, z, mat = h.mx, h.my, h.z, h.label
    top = not h.neighbor(0, 0, 1)
    if mat == ROOF:
        lateral = 50-abs(x) < min(y+3, 47-y)
        return tile_color((4 if x < 0 else 2) if lateral else 3,
                          y if lateral else x, 50-abs(x) if lateral else y+3)
    if mat == T_CAP:
        dx, dy = x+41.5, y+35.5
        side = abs(dx) > abs(dy)
        base = (3 if dx < 0 else 1) if side else (3 if dy < 0 else 2)
        return tile_color(1 if z == 35 else base, y if side else x, z)
    if mat == T_STONE:
        if top:
            return LOOKOUT_STONE[4 if not h.neighbor(0, -1, 0) else 3]
        joint = z%5 == 0 or (x + 5*((z//5)%2) + 64)%10 == 0
        return LOOKOUT_STONE[3 - joint]
    if mat == T_POST:
        return LOOKOUT_WOOD[3 if top else 2 - ((x*7+z//5)%11 == 0)]
    if mat == T_ROOM:
        return LOOKOUT_WOOD[0 if (x+64)%4 == 0 else 1]
    if mat == T_RAIL:
        return LOOKOUT_WOOD[1 if (y+64)%4 == 0 else 3]
    if mat == T_PIN:
        return LOOKOUT_WOOD[3 if top or not h.neighbor(-1, 0, 0) else 2]
    if mat in (PAVE, ROCK):
        v, u = (y, x) if top else (z, x)
        row, dv = divmod(v, 8 if mat == PAVE else 6)
        col, du = divmod(u+6*(row%2), 13)
        value = 2 + ((row*7+col*3)%9 > 5) - (dv == 0 or du == 0)
        if top and mat == ROCK:
            value += 1
        if mat == PAVE and (y > -3 or abs(x-CX-1) < 8 and abs(y-CY+2) < 4):
            value -= 1
        return STONE[max(0, value)]
    if mat == ARCH:
        seam = (z % 8 == 0 if z <= 43 else (math.atan2(z-43, x-ENTRY)*9/math.pi)%1 < .09)
        return STONE[1 if seam else 4 if top or x < ENTRY-12 else 3]
    if mat == DOOR:
        if z in (11, 12, 35, 36) or x == ENTRY:
            return '52454b'
        return WOOD[1 if (x-ENTRY)%5 == 0 or z > 50 else 2]
    if mat == OAK:
        return WOOD[3 if top else 1 if (x*7+z//7)%11 < 2 else 2]
    if mat == LIME:
        return 'c6bfb3' if z >= 74 or (x//4 + z//3*7)%41 == 0 else 'ece6d4'
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
        light = h.light(h.normal())
        return ('8b5944','ad7851','c99565','d9ac78')[int(light > .12)+int(light > .50)+int(light > .79)]
    if mat == STRAW:
        light = h.light(h.normal())
        return ('98714f','c89651','e8bd6b','f3da91')[min(3, int(light > .15)+int(light > .48)+int(light > .75))]
    if mat == PANE:
        return '627b8c' if z >= 64 and x%3 else '394250'
    return {BLUE:'517ac1', STEEL:'acbac5', CORD:'825646', DARK:'363443'}[mat]


if __name__ == '__main__':
    g = VoxelGrid()
    g.box(-47, 47, -43, 44, 0, 3, PAVE)
    hall(g)
    lookout(g)
    training(g)
    def shadow(x, y):
        return min(max(abs(x)-47, -45-y, y-44)/2, max(abs(x)-46, -y, y-44)/5,
                   max(-49-x, x+34, -45-y, y+28)/3)
    def seam(a, b):
        return None if {a, b} <= {CORD, STRAW, SACK, OAK} else OUTLINE
    def rgba(h):
        return (*bytes.fromhex(shade(h)), 255)
    sprite = render(g, 0, WIDTH, HEIGHT, ORIGIN, rgba, (1, 1), .2, shadow)
    outline(sprite, seam, depth_gap=7, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
