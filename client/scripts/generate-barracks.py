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
TILES = ('654551', '916457', 'b88463', 'd6a776', 'e7c798')
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
        for x in (-43+i, -3-i):
            b(x, x+4, 1, 3, 29+i, 34+i, OAK)
    for x in (-27, -11):
        b(x-5, x+5, 1, 4, 56, 72, OAK)
        b(x-3, x+3, 0, 3, 59, 70, PANE)
        b(x-6, x+6, -1, 2, 55, 58, OAK)
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
    b(-49, -34, -43, -28, 1, 26, ROCK)
    b(-43, -40, -43, -42, 10, 19, DARK)
    b(-50, -33, -44, -27, 26, 30, OAK)
    for x in (-49, -37):
        for y in (-43, -31):
            b(x, x+3, y, y+3, 30, 42, OAK)
    for i in range(13):
        half = 10-i*0.7
        b(round(-41.5-half), round(-41.5+half), round(-35.5-half), round(-35.5+half), 42+i, 43+i, ROOF)


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

    # Tied bundles on a pegged spar. Narrow neck and gaps below the arms
    # preserve the head-and-shoulders silhouette even at one-cell scale.
    b(CX-7, CX+8, CY-2, CY+3, 2, 4, OAK)
    b(CX-2, CX+3, CY-2, CY+2, 4, 29, OAK)
    for dx, zc, rx, ry, rz in ((0, 15, 6, 4, 8), (0, 29, 5, 4, 5),
                               (-9, 19, 6, 3, 3), (9, 19, 6, 3, 3)):
        for x in range(-rx, rx+1):
            for y in range(-ry, ry+1):
                for z in range(-rz, rz+1):
                    if (x/rx)**2+(y/ry)**2+(z/rz)**2 <= 1:
                        tied = (dx == 0 and zc == 15 and z in (-3, -2)) or (dx and abs(x+dx) == 11)
                        g.set(CX+dx+x, CY+y, zc+z, CORD if tied else STRAW)


def shade(h):
    x, y, z, mat = h.mx, h.my, h.z, h.label
    top = not h.neighbor(0, 0, 1)
    if mat == ROOF:
        tower = y < -10
        lateral = 50-abs(x) < min(y+3, 47-y) if not tower else abs(x+41.5) > abs(y+35.5)
        along = y if lateral else x
        course = z if tower else 50-abs(x) if lateral else y+3
        row, v = divmod(course, 4)
        tile, u = divmod(along + 3*(row%2), 6)
        seed = (tile*37 + row*53 + tile*row*11) % 29
        index = 3 + (seed > 25) - (seed < 8) - (v == 0) - (lateral and x > 0)
        if lateral and x < 0 and seed > 10:
            index += 1
        return TILES[max(0, min(4, index))]
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
        return None if {a, b} <= {CORD, STRAW, OAK} else OUTLINE
    def rgba(h):
        return (*bytes.fromhex(shade(h)), 255)
    sprite = render(g, 0, WIDTH, HEIGHT, ORIGIN, rgba, (1, 1), .2, shadow)
    outline(sprite, seam, depth_gap=7, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
