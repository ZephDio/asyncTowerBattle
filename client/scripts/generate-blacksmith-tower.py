#!/usr/bin/env python3
"""Generate an outdoor, left-facing two-cell blacksmith workshop visual.

Run python3 client/scripts/generate-blacksmith-tower.py. A kerchief-clad smith
strikes the large foreground anvil; sparks fly left. A small forge, water tub
and spare tools stand in a grassy yard. This image defines no game mechanics.
"""
import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

OUTPUT = Path(__file__).resolve().parent.parent / "public/resources/towers/blacksmith.png"
WIDTH, HEIGHT, ORIGIN_Y = 192, 118, 85
GRASS = [(52,70,78,255), (60,104,76,255), (92,146,74,255), (146,190,90,255), (196,222,124,255)]
WOOD = [(90,70,70,255), (134,99,83,255), (180,131,85,255), (218,181,112,255)]
IRON = [(38,42,58,255), (58,64,86,255), (84,92,116,255), (120,128,152,255), (168,176,196,255)]
STONE = [(72,63,97,255), (67,91,125,255), (68,142,159,255), (90,185,187,255), (143,226,185,255)]
CLOTH = [(72,63,97,255), (67,91,125,255), (68,142,159,255), (90,185,187,255)]
SKIN = [(110,65,57,255), (166,99,72,255), (211,150,100,255), (245,194,139,255)]
FIRE = [(184,76,38,255), (226,126,42,255), (246,192,65,255), (255,239,160,255)]
LAWN, TIMBER, METAL, SHIRT, APRON, FLESH, SCARF, HANDLE, HOT, MASONRY, SOOT, EYE, WATER = range(1, 14)


def noise(x, y):
    h = ((x * 73856093) ^ (y * 19349663)) & 0xffffffff
    h ^= h >> 16
    h = (h * 0x7feb352d) & 0xffffffff
    h ^= h >> 15
    return (h & 255) / 255


def ellipsoid(g, cx, cy, cz, rx, ry, rz, label):
    for z in range(math.floor(cz-rz), math.ceil(cz+rz)):
        for y in range(math.floor(cy-ry), math.ceil(cy+ry)):
            for x in range(math.floor(cx-rx), math.ceil(cx+rx)):
                if ((x+.5-cx)/rx)**2 + ((y+.5-cy)/ry)**2 + ((z+.5-cz)/rz)**2 <= 1:
                    g.set(x,y,z,label)


def rod(g, a, b, radius, label):
    length = math.dist(a, b)
    for i in range(math.ceil(length * 2) + 1):
        t = i / max(1, math.ceil(length * 2))
        x, y, z = (a[j] + (b[j]-a[j])*t for j in range(3))
        ellipsoid(g, x, y, z, radius, radius, radius, label)


def build():
    g = VoxelGrid(128)
    # Same ragged, shallow lawn as the witch house, not a floating deck or wall.
    for y in range(-40, 42):
        for x in range(-94, 94):
            edge = min(x+94, 93-x, y+40, 41-y)
            if edge < 3 and noise(x//2,y//2) < .5-edge*.15:
                continue
            g.box(x,x+1,y,y+1,0,3,LAWN)

    # The small stone smelter sits behind and to the right, separate from the anvil.
    g.box(56,86,11,37,3,30,MASONRY)
    g.box(60,83,14,35,30,49,MASONRY)
    g.box(65,79,19,32,49,75,MASONRY)
    g.box(62,82,16,34,73,77,MASONRY)
    g.box(67,77,20,30,75,78,SOOT)
    # Fire opening faces the camera: black mouth, coals and rising flame.
    g.box(61,81,10,13,10,26,SOOT)
    g.box(64,78,9,11,11,15,HOT)
    g.box(68,75,9,11,15,21,HOT)
    g.box(70,73,9,11,21,24,HOT)

    # Quenching tub at the left rear, with two loose long-handled tools beside it.
    ellipsoid(g,-75,20,10,12,10,9,TIMBER)
    g.box(-84,-66,13,27,12,15,WATER)
    rod(g,(-84,26,4),(-87,28,35),1.3,HANDLE)
    rod(g,(-79,29,4),(-73,29,33),1.2,METAL)
    rod(g,(-73,29,33),(-77,29,39),1.0,METAL)
    rod(g,(-73,29,33),(-69,29,39),1.0,METAL)

    # Large anvil in front: long axis runs front-to-back, with its horn toward
    # the viewer (90 degrees to the original). Broad face, waist, stump and horn.
    ellipsoid(g,-29,-14,13,19,17,11,TIMBER)
    g.box(-43,-15,-26,-2,20,28,METAL)
    for z in range(28,39):
        half = 12 + (z-28)*8//11
        g.box(-29-half,-29+half,-27,-1,z,z+1,METAL)
    g.box(-51,-7,-30,5,39,47,METAL)
    # Tapered conical horn, distinct against the grass in the foreground.
    for y in range(-48,-30):
        half = max(1, (y+48)*17//18)
        g.box(-29-half,-29+half,y,y+1,41,45,METAL)
    # Hot workpiece on the upper face.
    g.box(-37,-19,-15,-9,47,49,HOT)

    # A stocky person rather than a box: separated boots, tapered apron, rounded
    # shoulders and head, a kerchief hiding hair and ears, and a left-facing nose.
    g.box(18,30,-3,11,3,10,METAL)
    g.box(41,53,-3,11,3,10,METAL)
    ellipsoid(g,24,4,19,7,7,13,SHIRT)
    ellipsoid(g,46,4,19,7,7,13,SHIRT)
    ellipsoid(g,35,7,39,22,11,22,SHIRT)
    for z in range(14,49):
        half = 15 if z < 29 else 13
        g.box(35-half,35+half,-8,-5,z,z+1,APRON)
    # Leather straps across chest, and a neck under the head.
    rod(g,(25,-9,46),(31,-9,34),1.2,TIMBER)
    rod(g,(45,-9,46),(39,-9,34),1.2,TIMBER)
    ellipsoid(g,32,4,60,6,6,7,FLESH)
    ellipsoid(g,30,3,70,10,8,11,FLESH)
    g.box(18,25,-2,4,67,71,FLESH)
    # Kerchief cap and tied back, leaving face, jaw and eye exposed.
    for z in range(75,83):
        for y in range(-6,13):
            for x in range(20,41):
                if ((x+.5-30)/11)**2 + ((y+.5-3)/10)**2 + ((z+.5-75)/8)**2 <= 1:
                    g.set(x,y,z,SCARF)
    g.box(36,42,-2,10,68,77,SCARF)
    g.box(40,47,2,9,70,75,SCARF)
    g.box(24,27,-6,-4,71,74,EYE)
    # Sleeve, bent arm, hand and diagonal hammer, with striking face on hot iron.
    ellipsoid(g,19,-2,47,9,9,9,SHIRT)
    rod(g,(17,-5,47),(7,-11,56),5,FLESH)
    rod(g,(7,-11,56),(-1,-13,62),4,FLESH)
    ellipsoid(g,-2,-13,62,4,4,4,FLESH)
    rod(g,(-2,-13,62),(-27,-13,50),2,HANDLE)
    g.box(-34,-23,-19,-8,48,56,METAL)
    # Airborne sparks go left; their position doesn't contribute to the yard.
    for x,y,z in [(-46,-18,56),(-57,-18,61),(-68,-19,58),(-78,-20,65)]:
        g.box(x,x+4,y,y+3,z,z+3,HOT)
    return g


def shade(hit: Hit):
    ramps = {LAWN:GRASS, TIMBER:WOOD, METAL:IRON, SHIRT:CLOTH, APRON:WOOD,
             FLESH:SKIN, SCARF:CLOTH, HANDLE:WOOD, HOT:FIRE, MASONRY:STONE,
             SOOT:IRON, EYE:IRON, WATER:CLOTH}
    if hit.label in (SOOT, EYE):
        return (22,28,46,255)
    if hit.label == HOT:
        return FIRE[3 if hit.mx > -50 else 2]
    if hit.label == LAWN:
        if hit.neighbor(0,0,1) != EMPTY:
            return GRASS[1]
        return GRASS[3] if noise(hit.mx//3,hit.my//7) > .94 else GRASS[2]
    light = hit.light(hit.normal())
    ramp = ramps[hit.label]
    index = min(len(ramp)-1, sum(light >= t for t in (0.1, 0.45, 0.75, 0.93)))
    if hit.label == MASONRY and (hit.z % 7 == 0 or (hit.mx + (hit.z//7%2)*5) % 10 == 0):
        index = max(0,index-1)
    return ramp[index]


def crack(a, b):
    if a == b or LAWN in (a,b):
        return None
    return (22,28,46,255)


def main():
    sprite = render(build(), 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1,1))
    outline(sprite, crack, depth_gap=8, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT}")

if __name__ == "__main__":
    main()
