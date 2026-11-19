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
DECK, STUMP, METAL, SHIRT, APRON, FLESH, SCARF, HANDLE, HOT, STONE, SOOT, EYE = range(1, 13)
STONE_RAMP = [(72,63,97,255), (67,91,125,255), (68,142,159,255), (90,185,187,255)]


def build():
    g = VoxelGrid(128)
    # Low timber work platform, with a stone-dark front edge.
    g.box(-83, 83, -26, 24, 0, 5, DECK)
    # Open workshop: timber posts and lintel with a masonry forge and chimney behind the bench.
    g.box(-81,81,21,25,5,65,STUMP)
    for x in (-81, 75):
        g.box(x,x+6,17,26,5,105,STUMP)
    g.box(-84,84,16,27,100,108,STUMP)
    g.box(-82,-53,9,25,5,62,STONE)
    g.box(-76,-58,14,25,62,92,STONE)
    # Recessed firebox, with a warm bed of coals on its front.
    g.box(-77,-58,8,10,21,43,SOOT)
    g.box(-74,-62,7,9,22,27,HOT)
    g.box(-70,-66,7,9,27,34,HOT)
    # Anvil turned a quarter turn: its horn now projects toward the camera.
    g.box(-49,-23,-12,12,5,24,STUMP)
    g.box(-46,-26,-10,10,24,33,METAL)
    g.box(-49,-23,-17,17,33,42,METAL)
    for y in range(-32,-17):
        half = max(1, (y + 32) * 10 // 15)
        g.box(-36-half,-36+half,y,y+1,36,40,METAL)
    g.box(-42,-30,-8,3,42,44,HOT)
    # Broad legs and shoulders: deliberately stocky, no species-specific ears.
    g.box(22,39,-10,10,5,26,METAL)
    g.box(49,66,-10,10,5,26,METAL)
    g.box(18,71,-8,14,25,60,SHIRT)
    g.box(29,61,-15,-8,19,53,APRON)
    # Neck and rounded-off face in profile, with a nose and a visible eye.
    g.box(39,53,-9,8,54,64,FLESH)
    g.box(34,54,-12,8,62,79,FLESH)
    g.box(37,52,-13,7,60,81,FLESH)
    g.box(35,38,-14,-12,71,74,EYE)
    # Hood/kerchief wraps the head, with a knot and trailing corner at the back.
    g.box(32,60,-10,12,76,86,SCARF)
    g.box(52,62,-10,12,64,78,SCARF)
    g.box(57,68,0,9,70,78,SCARF)
    # Nose facing left, and the near arm reaching down-left to the hammer.
    g.box(28,35,-8,0,67,72,FLESH)
    # A bent bare arm, hand gripping the raised handle above the anvil.
    for i in range(24):
        g.box(28-i,32-i,-18,-10,49+i//3,57+i//3,FLESH)
    g.box(1,9,-20,-10,54,62,FLESH)
    # Diagonal hammer strikes the hot metal; its head is perpendicular to the handle.
    for i in range(32):
        g.box(4-i,7-i,-18,-13,58-i//2,61-i//2,HANDLE)
    g.box(-34,-23,-20,-11,42,52,METAL)
    # Fragments fly left along the path, away from the blow.
    for x,z in [(-48,52),(-59,58),(-70,61),(-82,66)]:
        g.box(x,x+4,-34,-31,z,z+3,HOT)
    return g


def shade(hit: Hit):
    ramps = {DECK:WOOD, STUMP:WOOD, METAL:IRON, SHIRT:CLOTH, APRON:WOOD,
             FLESH:SKIN, SCARF:CLOTH, HANDLE:WOOD, HOT:SPARK, STONE:STONE_RAMP,
             SOOT:IRON, EYE:IRON}
    if hit.label in (SOOT, EYE):
        return (22,28,46,255)
    if hit.label == STONE and hit.neighbor(0,-1,0) == EMPTY:
        if hit.z % 8 == 0 or (hit.mx + (hit.z // 8 % 2) * 5) % 10 == 0:
            return STONE_RAMP[0]
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
