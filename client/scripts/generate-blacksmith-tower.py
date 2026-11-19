#!/usr/bin/env python3
"""Generate the visual-only, two-cell blacksmith tower, facing left.

Run python3 client/scripts/generate-blacksmith-tower.py. The smith works at an anvil
on the left; the kerchief hides distinguishing ears and hair. Sparks travel left.
"""
from pathlib import Path
from voxel_sprite import EMPTY, Hit, VoxelGrid, outline, render, write_png

OUTPUT = Path(__file__).resolve().parent.parent / "public/resources/towers/blacksmith.png"
WIDTH, HEIGHT, ORIGIN_Y = 220, 126, 101
WOOD = [(90,70,70,255), (134,99,83,255), (180,131,85,255), (218,181,112,255)]
IRON = [(38,42,58,255), (58,64,86,255), (84,92,116,255), (120,128,152,255), (168,176,196,255)]
CLOTH = [(72,63,97,255), (67,91,125,255), (68,142,159,255), (90,185,187,255)]
SKIN = [(110,65,57,255), (166,99,72,255), (211,150,100,255), (245,194,139,255)]
SPARK = [(184,76,38,255), (226,126,42,255), (246,192,65,255), (255,239,160,255)]
DECK, STUMP, METAL, SHIRT, APRON, FLESH, SCARF, HANDLE, HOT = range(1, 10)


def build():
    g = VoxelGrid(128)
    # Low timber work platform, with a stone-dark front edge.
    g.box(-83, 83, -26, 24, 0, 5, DECK)
    # Anvil on its stump, horn pointing toward the left of the path.
    g.box(-54,-19,-12,12,5,26,STUMP)
    g.box(-50,-22,-11,11,26,34,METAL)
    g.box(-58,-15,-15,15,34,43,METAL)
    for x in range(-76,-58):
        half = max(1, (x + 76) * 10 // 18)
        g.box(x,x+1,-half,half,37,41,METAL)
    g.box(-47,-31,-16,-13,41,44,HOT)
    # Broad legs and shoulders: deliberately stocky, no species-specific ears.
    g.box(22,39,-10,10,5,26,METAL)
    g.box(49,66,-10,10,5,26,METAL)
    g.box(18,71,-8,14,25,60,SHIRT)
    g.box(29,61,-15,-8,19,53,APRON)
    g.box(35,55,-12,9,59,82,FLESH)
    # Hood/kerchief wraps the head, with a knot and trailing corner at the back.
    g.box(32,60,-10,12,76,86,SCARF)
    g.box(52,62,-10,12,64,78,SCARF)
    g.box(57,68,0,9,70,78,SCARF)
    # Nose facing left, and the near arm reaching down-left to the hammer.
    g.box(28,35,-8,0,67,72,FLESH)
    for i in range(27):
        x = 26-i
        z = 52-i//3
        g.box(x,x+4,-18,-9,z,z+8,FLESH)
    # Handle slopes from the smith's hand to the point of impact.
    for i in range(30):
        x = 2-i
        z = 49-i//4
        g.box(x,x+3,-18,-13,z,z+3,HANDLE)
    g.box(-35,-23,-20,-11,43,52,METAL)
    # Bright, discrete fragments fly left of the anvil, not part of the footprint.
    for x,z in [(-62,51),(-73,57),(-84,49),(-94,55)]:
        g.box(x,x+4,-14,-11,z,z+3,HOT)
    return g


def shade(hit: Hit):
    ramps = {DECK:WOOD, STUMP:WOOD, METAL:IRON, SHIRT:CLOTH, APRON:WOOD,
             FLESH:SKIN, SCARF:CLOTH, HANDLE:WOOD, HOT:SPARK}
    ramp = ramps[hit.label]
    if hit.label == HOT:
        return ramp[2 if hit.mx < -50 else 3]
    if hit.label == DECK and hit.neighbor(0,0,1) == EMPTY and (hit.my + 26) % 9 == 0:
        return WOOD[1]
    light = hit.light(hit.normal())
    return ramp[min(len(ramp)-1, sum(light >= t for t in (0.1, 0.45, 0.75, 0.93)))]


def crack(a, b):
    return (22,28,46,255) if a != b else None


def shadow(x, y):
    # Platform only; airborne hammer and sparks do not cast a ground shadow.
    return max(max(0, abs(x)-83), max(0, abs(y+2)-25)) / 4


def main():
    sprite = render(build(), 0, WIDTH, HEIGHT, ORIGIN_Y, shade, (1,1), shadow_shape=shadow, shadow_jitter=0.2)
    outline(sprite, crack, depth_gap=10, depth_width=1)
    write_png(OUTPUT, sprite.pixels)
    print(f"wrote {OUTPUT}")

if __name__ == "__main__":
    main()
