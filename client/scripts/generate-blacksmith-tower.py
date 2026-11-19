#!/usr/bin/env python3
"""Generate the visual-only, two-cell outdoor blacksmith workshop.

The anvil occupies the left half with its horn toward the viewer, a smith faces
left to strike it outdoors, and a walled smithy opens toward the left. The ground
is transparent except for shadows beneath the equipment. Run from any directory
with python3 client/scripts/generate-blacksmith-tower.py.
"""
import math
from pathlib import Path

from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

OUTPUT = Path(__file__).resolve().parent.parent / "public/resources/towers/blacksmith.png"
WIDTH, HEIGHT, ORIGIN_Y = 194, 136, 113
WOOD = [(77,57,55,255), (119,81,62,255), (166,113,74,255), (211,165,106,255)]
IRON = [(38,36,43,255), (61,59,66,255), (91,89,94,255), (130,127,125,255), (177,172,161,255)]
STONE = [(67,57,62,255), (100,83,77,255), (140,119,103,255), (178,154,128,255), (213,192,158,255)]
CLOTH = [(63,48,53,255), (100,67,61,255), (146,92,69,255), (186,131,91,255)]
SKIN = [(108,65,54,255), (163,98,70,255), (208,146,98,255), (241,190,134,255)]
FIRE = [(163,58,35,255), (220,102,36,255), (248,172,54,255), (255,232,150,255)]
ROOF = [(73,47,51,255), (110,61,54,255), (155,86,62,255), (195,128,84,255)]
WOOD_L, IRON_L, STONE_L, CLOTH_L, SKIN_L, HOT_L, DARK_L, ROOF_L = range(1, 9)


def ellipsoid(g, cx, cy, cz, rx, ry, rz, label):
    for z in range(math.floor(cz-rz), math.ceil(cz+rz)):
        for y in range(math.floor(cy-ry), math.ceil(cy+ry)):
            for x in range(math.floor(cx-rx), math.ceil(cx+rx)):
                if ((x+.5-cx)/rx)**2 + ((y+.5-cy)/ry)**2 + ((z+.5-cz)/rz)**2 <= 1:
                    g.set(x,y,z,label)


def rod(g, a, b, radius, label):
    steps = max(1, math.ceil(math.dist(a, b) * 2))
    for i in range(steps + 1):
        t = i / steps
        x, y, z = (a[j] + (b[j]-a[j])*t for j in range(3))
        ellipsoid(g, x, y, z, radius, radius, radius, label)


def build():
    g = VoxelGrid(128)
    # Left half: a large anvil on an end-grain stump. Its horn retains the
    # previous front-to-back rotation, tapering toward the viewer.
    ellipsoid(g,-55,-8,12,19,17,12,WOOD_L)
    g.box(-70,-40,-20,5,20,28,IRON_L)
    for z in range(28,39):
        half = 12 + (z-28)*8//11
        g.box(-55-half,-55+half,-22,4,z,z+1,IRON_L)
    g.box(-77,-33,-25,12,39,47,IRON_L)
    for y in range(-44,-25):
        half = max(1,(y+44)*17//19)
        g.box(-55-half,-55+half,y,y+1,41,45,IRON_L)
    g.box(-64,-47,-9,-3,47,49,HOT_L)

    # Walled smithy occupies only the right half. A rear wall and right end
    # close the workshop; its left end remains an entrance facing the smith.
    # There is no floor or wall behind the outdoor anvil and smith.
    g.box(32,89,30,35,0,87,STONE_L)
    g.box(84,89,-2,35,0,87,STONE_L)
    # Timber frame and pitched shingle roof.
    for x in (31, 84):
        for y in (-2, 30):
            g.box(x,x+5,y,y+5,0,91,WOOD_L)
    g.box(29,91,-4,36,87,92,WOOD_L)
    g.box(32,89,29,31,49,53,WOOD_L)
    for x in (32, 58, 84):
        g.box(x,x+4,28,31,0,87,WOOD_L)
    for x in (32, 82):
        rod(g,(x,-2,68),(x+7,-2,88),2,WOOD_L)
    for y in range(-8, 42):
        top = 112 - round(abs(y-17) * .65)
        g.box(25,94,y,y+1,top-4,top,ROOF_L)
    # Masonry hearth and chimney inside the shelter, opening left.
    g.box(37,85,-14,25,0,7,STONE_L)
    g.box(54,85,-8,24,7,35,STONE_L)
    g.box(47,85,5,24,35,42,STONE_L)
    g.box(63,80,14,25,42,120,STONE_L)
    g.box(60,83,11,28,117,122,STONE_L)
    g.box(65,78,15,24,120,123,DARK_L)
    # Left-facing entry: dark recessed bed and hot coals on the horizontal
    # hearth. A low front rim preserves the readable opening in this camera.
    g.box(38,58,-10,11,7,11,IRON_L)
    g.box(44,61,-6,13,11,13,DARK_L)
    g.box(46,57,-4,8,13,15,HOT_L)
    g.box(51,56,0,5,15,20,HOT_L)
    g.box(39,62,-14,-10,7,14,STONE_L)
    # Spare tongs on the near side of the forge.
    rod(g,(74,-15,6),(70,-15,28),1.1,IRON_L)
    rod(g,(70,-15,28),(66,-15,34),1.0,IRON_L)
    rod(g,(70,-15,28),(73,-15,35),1.0,IRON_L)

    # Stocky side profile, oriented toward x-negative, from feet to shoulder.
    # Staggered legs and feet point left instead of a front-facing apron.
    rod(g,(5,5,21),(0,1,7),5,CLOTH_L)
    rod(g,(14,10,21),(17,12,7),5,CLOTH_L)
    g.box(-6,7,-5,7,1,7,IRON_L)
    g.box(11,23,6,17,1,7,IRON_L)
    ellipsoid(g,9,6,34,13,10,18,CLOTH_L)
    # Side-on leather apron hangs down at the anvil-facing side of the body.
    g.box(-3,5,-5,10,13,42,WOOD_L)
    rod(g,(4,-5,44),(2,-6,34),1.2,WOOD_L)
    ellipsoid(g,5,6,54,6,6,7,SKIN_L)
    ellipsoid(g,1,5,64,9,8,10,SKIN_L)
    g.box(-11,-5,0,6,61,65,SKIN_L)
    # Rounded kerchief, tied at the back; no ears or hair identify the species.
    for z in range(68,77):
        for y in range(-4,15):
            for x in range(-9,12):
                if ((x+.5-1)/11)**2 + ((y+.5-5)/10)**2 + ((z+.5-68)/9)**2 <= 1:
                    g.set(x,y,z,CLOTH_L)
    g.box(7,14,0,13,62,71,CLOTH_L)
    g.box(12,19,4,11,65,70,CLOTH_L)
    g.box(-6,-3,-4,-2,65,68,DARK_L)
    # Near arm and hammer extend left toward the work, hand above the anvil.
    ellipsoid(g,0,-2,43,7,7,8,CLOTH_L)
    rod(g,(-2,-4,45),(-9,-8,42),4.2,SKIN_L)
    rod(g,(-9,-8,42),(-25,-10,59),3.5,SKIN_L)
    ellipsoid(g,-25,-10,59,4,4,4,SKIN_L)
    rod(g,(-25,-10,59),(-50,-10,49),1.8,WOOD_L)
    g.box(-57,-46,-16,-5,48,56,IRON_L)
    # Small sparks escaping left of the hammer.
    for x,y,z in [(-70,-14,55),(-79,-15,60),(-88,-16,57),(-95,-18,64)]:
        g.box(x,x+3,y,y+3,z,z+3,HOT_L)
    return g


def shade(hit: Hit):
    ramps = {WOOD_L:WOOD, IRON_L:IRON, STONE_L:STONE, CLOTH_L:CLOTH, SKIN_L:SKIN, HOT_L:FIRE, ROOF_L:ROOF}
    if hit.label == DARK_L:
        return (22,28,46,255)
    if hit.label == HOT_L:
        return FIRE[3] if hit.mx > -70 else FIRE[2]
    ramp = ramps[hit.label]
    light = hit.light(hit.normal())
    index = min(len(ramp)-1, sum(light >= t for t in (0.1, 0.45, 0.75, 0.93)))
    if hit.label == ROOF_L and (hit.my % 8 == 0 or (hit.mx + (hit.my//8%2)*6) % 12 == 0):
        index = max(0,index-1)
    if hit.label == STONE_L and (hit.z % 7 == 0 or (hit.mx + (hit.z//7%2)*5) % 11 == 0):
        index = max(0,index-1)
    return ramp[index]


def crack(a, b):
    return (22,28,46,255) if a != b else None


def shadow(x, y):
    # Union of forge and stump footprints, each expanded evenly with an L1
    # margin. Airborne sparks, hammer and tools do not create ground shadows.
    def box_distance(x0, x1, y0, y1):
        return (max(x0-x,0,x-x1) + max(y0-y,0,y-y1)) / 4
    stump = math.hypot((x + 55) / 21, (y + 10) / 19)
    smith = math.hypot((x - 9) / 17, (y - 4) / 13)
    return min(box_distance(29,89,-6,36), stump, smith)


def main():
    sprite = render(build(), 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1,1), shadow_shape=shadow, shadow_jitter=0.2)
    outline(sprite, crack, depth_gap=8, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT}")

if __name__ == "__main__":
    main()
