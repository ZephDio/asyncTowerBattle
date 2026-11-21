#!/usr/bin/env python3
"""Render the two side-specific elf castles: the same ancient inhabited tree, once for each side of the board.

Outputs, both 220x220 (22.4 px per grid unit, the 2x2 cell block of `CastleResources.elf`):
  public/resources/castle/elf/board-left.png   the castle left of the player's board (board edge on the right)
  public/resources/castle/elf/board-right.png  the opponent's castle right of the board (board edge on the left)

Neither is a flipped or rotated copy of the other: the tree is modelled once, mirrored in model space, and every
side is rendered with the same camera and the same light from the screen's left, so the lit faces never swap.

The arrival hollow faces sideways toward the board. On the left it sits on a near root,
with the small barracks on the ground beyond it. On the right the barracks overlaps
its further trunk entrance. Both sides retain all three branch houses.

Usage: python3 generate-elf-castle.py [left|right|both]
"""
import math
import sys
from multiprocessing import Pool
from pathlib import Path

from voxel_sprite import VoxelGrid, outline, render, write_png

OUT_DIR = Path(__file__).resolve().parents[1] / "public/resources/castle/elf"
WIDTH, HEIGHT, ORIGIN_Y = 220, 220, 166

(BARK, ROOT, LEAF, WALL, MOSS, FRAME, HOLLOW, GLOW, APPLE, LEDGE, CLOTH, PLANK, BEAM) = range(1, 14)
LEAF_DARK, LEAF_LIGHT = 14, 15  # clump variants of LEAF


def rgb(h):
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4)) + (255,)


BARK_RAMP = [rgb(h) for h in ("3b2c3a", "5a4646", "866353", "b48355", "d8ad70")]
LEAF_RAMP = [rgb(h) for h in ("27463f", "36694a", "5b8f4c", "86b055", "b6d06a")]
MOSS_RAMP = [rgb(h) for h in ("3b2c3a", "5a4646", "7a5f55", "a07d5f")]  # dark shingles, moss is added on top
MOSSY = [rgb(h) for h in ("36694a", "5b8f4c")]
WALL_RAMP = [rgb(h) for h in ("5a4646", "866353", "b48355", "dab570")]
FRAME_RAMP = [rgb(h) for h in ("5a4646", "866353", "b48355", "dab570")]
HOLLOW_RAMP = [rgb(h) for h in ("1d1a2c", "2c2540", "483f61")]
GLOW_RAMP = [rgb(h) for h in ("e0902f", "f6c453", "fff0a0")]
APPLE_RAMP = [rgb(h) for h in ("8c3a36", "c9582f", "ee8a38", "ffd070")]
LEDGE_RAMP = [rgb(h) for h in ("483f61", "6a5a6e", "947c7c", "c4a98a")]
CLOTH_RAMP = [rgb(h) for h in ("4b5a3c", "6f8a48", "a3c466", "d9e68d")]
PLANK_RAMP = WALL_RAMP


def noise(a, b, c=0):
    v = math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453
    return v - math.floor(v)


class Model:
    def __init__(self, board):
        # board is +1 when the board lies to the right of the sprite (the left castle), -1 otherwise
        self.b = board
        self.g = VoxelGrid(112, 96)

    def ell(self, cx, cy, cz, rx, ry, rz, label, over=True):
        g = self.g
        for z in range(max(0, int(cz - rz)), int(cz + rz) + 1):
            for y in range(int(cy - ry), int(cy + ry) + 1):
                for x in range(int(cx - rx), int(cx + rx) + 1):
                    d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 + ((z + 0.5 - cz) / rz) ** 2
                    if d <= 1 and (over or not g.get(x, y, z)):
                        g.set(x, y, z, label)

    def tube(self, pts, radii, label, squash=0.85):
        """A smooth tube through points (quadratic Bezier chains), radius interpolated along it."""
        n = max(2, int(sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))))
        for i in range(n + 1):
            t = i / n
            p = bezier(pts, t)
            r = radii[0] + (radii[1] - radii[0]) * t
            self.ell(p[0], p[1], p[2], r, r * squash, r, label)

    def box(self, x0, x1, y0, y1, z0, z1, label):
        self.g.box(min(x0, x1), max(x0, x1), y0, y1, z0, z1, label)

    # --- tree ---------------------------------------------------------------------------------------------
    def trunk(self):
        for z in range(0, 66):
            t = z / 65
            r = 25 + 17 * (1 - t) ** 2.2 + 6 * t**4
            self.ell(0, 4, z + 0.5, r, r * 0.82, 1.0, BARK)
        # bumps of old bark
        for i, (x, z, r) in enumerate([(-14, 30, 7), (10, 44, 6), (-4, 14, 8), (18, 22, 6)]):
            self.ell(x, -8, z, r, r * 0.8, r, BARK)

    def limbs(self):
        b = self.b
        base = (0, 4, 56)
        # away from the board: carries the big house; centre: the small house; board side: the spawn or the arch
        self.tube([base, (-26 * b, 4, 72), (-62 * b, 4, 92)], (16, 11), BARK)
        self.tube([base, (2, 8, 82), (4, 14, 104)], (13, 9), BARK)
        self.tube([base, (30 * b, 2, 72), (66 * b, 2, 92)], (17, 12), BARK)

    def roots(self):
        b = self.b
        spec = [
            # (path, radii) in board-relative x
            ([(26, -8, 12), (60, -10, 20), (102, -8, 5)], (11, 3)),  # arch over the entry path, towards the board
            ([(20, 14, 10), (58, 24, 8), (96, 24, 1)], (10, 3)),
            ([(-22, -8, 12), (-58, -12, 14), (-102, -14, 3)], (12, 3)),
            ([(-18, 12, 10), (-56, 22, 8), (-94, 22, 1)], (9, 3)),
            ([(-8, -18, 8), (-22, -42, 5), (-34, -62, 0)], (10, 3)),
            ([(10, -20, 8), (20, -44, 4), (40, -58, 0)], (9, 3)),
        ]
        for pts, radii in spec:
            self.tube([(x * b, y, z) for x, y, z in pts], radii, ROOT, squash=0.75)

    def crown(self):
        b = self.b
        clumps = []
        # a back wall of foliage that frames the limbs and houses
        for i in range(46):
            a = i / 45
            x = (a - 0.5) * 190
            top = 135 - 55 * (abs(a - 0.5) * 2) ** 2
            y = 30 + 20 * (1 - abs(a - 0.5) * 2)
            clumps.append((x, y, top - 4 + 8 * noise(i, 1), 15 + 8 * noise(i, 2)))
        for i in range(30):
            a = i / 29
            x = (a - 0.5) * 150
            clumps.append((x, 22, 100 + 20 * noise(i, 3), 17 + 7 * noise(i, 4)))
        # side and lower flanks
        for sx in (-1, 1):
            for i, (x, y, z, r) in enumerate([(88, 6, 96, 18), (92, 14, 72, 17), (82, 22, 112, 19), (70, 36, 86, 22)]):
                clumps.append((sx * x, y, z, r))
        for i, (cx, cy, cz, r) in enumerate(clumps):
            kind = (LEAF_DARK, LEAF, LEAF_LIGHT)[int(noise(i, 9) * 3)]
            self.ell(cx, cy, cz, r * 1.1, r * 0.9, r * 0.85, kind)
        # a few apples sunk into the front of the crown
        for i, (x, z) in enumerate([(-84, 80), (-70, 112), (86, 62), (74, 106), (-44, 126), (36, 128)]):
            self.ell(x, -4, z, 4, 4, 4, APPLE)

    # --- buildings ----------------------------------------------------------------------------------------
    def house(self, cx, cy, z0, w, d, h, roof, door=True, glow=True, wide=False):
        self.box(cx - w // 2, cx + w // 2, cy - d // 2, cy + d // 2, z0, z0 + h, WALL)
        # hipped shingle roof, overhanging the walls
        for z in range(roof):
            ox = w // 2 + 5 - int(z * (w / 2 + 5) / (roof + 3))
            oy = d // 2 + 5 - int(z * (d / 2 + 5) / (roof + 3))
            self.box(cx - ox, cx + ox, cy - oy, cy + oy, z0 + h + z, z0 + h + z + 1, MOSS)
        front = cy - d // 2
        if door:
            hw = 6 if wide else 4
            self.box(cx - hw, cx + hw, front - 1, front + 3, z0, z0 + 13, HOLLOW)
            self.box(cx - hw - 1, cx - hw, front - 1, front + 1, z0, z0 + 14, FRAME)
            self.box(cx + hw, cx + hw + 1, front - 1, front + 1, z0, z0 + 14, FRAME)
            self.box(cx - hw - 1, cx + hw + 1, front - 1, front + 1, z0 + 13, z0 + 14, FRAME)
        if glow:
            for wx in (-w // 2 + 5, w // 2 - 9):
                if abs(wx + 2) < 6 + (2 if wide else 0):
                    continue
                self.box(cx + wx, cx + wx + 4, front - 1, front + 1, z0 + h - 13, z0 + h - 6, GLOW)

    def arrival_hollow(self):
        # Root flares into an arched mouth. The tangent runs mostly into the scene:
        # the small component toward camera keeps the recess visible in profile.
        b = self.b
        cy = -24 if b > 0 else 10
        cx = 42 * b
        for x in range(-76, 77):
            for y in range(cy - 34, cy + 35):
                dx, dy = (x - cx) * b, y - cy
                outward = dx * .84 - dy * .54
                tangent = dx * .54 + dy * .84
                for z in range(45):
                    radius = math.hypot(tangent, max(0, z - 16))
                    if radius > 23 or not -30 <= outward <= 6:
                        continue
                    if radius < 16 and outward > 4:
                        self.g.set(x, y, z, 0)
                    elif radius < 16:
                        self.g.set(x, y, z, HOLLOW)
                    elif radius >= 15:
                        self.g.set(x, y, z, BARK)
        # A tapering root defines the near lip and points out toward the board.
        self.tube([(32*b,cy-18,5),(55*b,cy-17,3),(75*b,cy-15,1)], (7,2), ROOT)

    def roof_flag(self, x, y, z, b):
        """A pole on the roof ridge with a pennant streaming towards the board."""
        self.box(x, x + 2, y, y + 2, z, z + 10, BEAM)
        lo, hi = sorted((x + 2, x + 2 + 11 * b))
        self.box(lo, hi, y, y + 2, z + 3, z + 10, CLOTH)

    def lantern(self, x, y, z):
        self.box(x - 1, x + 2, y - 1, y + 2, z, z + 14, BEAM)
        self.ell(x + 0.5, y + 0.5, z + 14, 3, 3, 4, GLOW)

    def build(self):
        b = self.b
        self.trunk()
        self.limbs()
        self.roots()
        self.crown()
        self.house(-62 * b, 4, 92, 46, 32, 26, 16)
        self.house(4, 16, 104, 30, 24, 20, 13)
        self.house(72 * b, 2, 92, 38, 26, 22, 14)
        self.arrival_hollow()
        # On the far side of the roots the hut has a smaller silhouette; its base
        # stays on the ground plane instead of being raised onto a canopy limb.
        near = b < 0
        x, y = 79*b, -44 if near else 46
        w, d, h = (47, 33, 26) if near else (29, 21, 17)
        roof = 17 if near else 12
        self.ell(x, y, 2, w//2+5, d//2+4, 3, LEDGE)
        self.house(x, y, 4, w, d, h, roof, wide=near)
        self.roof_flag(x,y,4+h+roof,b)


def bezier(pts, t):
    pts = list(pts)
    while len(pts) > 1:
        pts = [tuple(a + (c - a) * t for a, c in zip(p, q)) for p, q in zip(pts, pts[1:])]
    return pts[0]


def pick(ramp, light, bonus=0):
    n = len(ramp)
    i = round((light + 0.5) / 1.3 * (n - 1)) + bonus
    return ramp[max(0, min(n - 1, i))]


def shade_factory(model):
    g = model.g

    def shade(hit):
        n = hit.normal()
        light = hit.light(n)
        l, mx, my, z = hit.label, hit.mx, hit.my, hit.z
        if l in (LEAF, LEAF_DARK, LEAF_LIGHT):
            clump = noise(mx // 4, z // 4, my // 4)
            bonus = -1 if clump < 0.2 else (1 if clump > 0.9 else 0)
            if hit.neighbor(0, -2, 0) and hit.neighbor(0, -2, 0) != LEAF:
                bonus -= 1
            return pick(LEAF_RAMP, light, bonus)
        if l in (BARK, ROOT):
            streak = noise(mx // 2, z // 7)
            bonus = -1 if streak < 0.2 else (1 if streak > 0.9 else 0)
            return pick(BARK_RAMP, light, bonus)
        if l == WALL:
            plank = noise(mx // 5, 0)
            return pick(WALL_RAMP, light, -1 if plank < 0.3 else 0)
        if l == MOSS:
            if noise(mx // 3, my // 3, z // 2) < 0.28:
                return pick(MOSSY, light + 0.3)
            course = (z + my // 2) % 4 == 0
            return pick(MOSS_RAMP, light, -1 if course else 0)
        if l == FRAME or l == BEAM:
            return pick(FRAME_RAMP, light)
        if l == PLANK:
            return pick(PLANK_RAMP, light, -1 if (mx // 4) % 2 else 0)
        if l == HOLLOW:
            return HOLLOW_RAMP[0] if hit.neighbor(0, -3, 0) != HOLLOW else HOLLOW_RAMP[1]
        if l == GLOW:
            return GLOW_RAMP[1] if light > 0 else GLOW_RAMP[0]
        if l == APPLE:
            return pick(APPLE_RAMP, light)
        if l == LEDGE:
            return pick(LEDGE_RAMP, light)
        if l == CLOTH:
            return pick(CLOTH_RAMP, light)
        return (255, 0, 255, 255)

    return shade


def footprint_shadow(model):
    g = model.g
    cols = set()
    for y in range(-g.half_y, g.half_y):
        for x in range(-g.half_x, g.half_x):
            if any(g.get(x, y, z) for z in (1, 2, 3)):
                cols.add((x, y - 0))
    margin = 5
    dist = {}
    for x, y in cols:
        for dx in range(-margin, margin + 1):
            for dy in range(-margin, margin + 1):
                d = abs(dx) + abs(dy)
                if d <= margin:
                    # shadow drops 3px towards the camera
                    k = (x + dx, y + dy - 3)
                    if d < dist.get(k, 99):
                        dist[k] = d

    def shape(x, y):
        return dist.get((math.floor(x), math.floor(y)), 99) / (margin * 0.8)

    return shape


def crack(label, other):
    if label in (LEAF, LEAF_DARK, LEAF_LIGHT) and other in (LEAF, LEAF_DARK, LEAF_LIGHT):
        return LEAF_RAMP[0]
    return None


def make(side):
    model = Model(1 if side == "left" else -1)
    model.build()
    sprite = render(
        model.g, 0, WIDTH, HEIGHT, ORIGIN_Y, shade_factory(model), (1, 1),
        shadow_jitter=0.3, shadow_shape=footprint_shadow(model),
    )
    outline(sprite, crack, depth_gap=9, depth_width=1)
    return side, sprite


def main():
    args = sys.argv[1:]
    preview = None
    if "--preview" in args:
        i = args.index("--preview")
        preview = Path(args[i + 1])
        del args[i : i + 2]
    sides = ["left", "right"] if not args or args[0] == "both" else [args[0]]
    with Pool(len(sides)) as pool:
        results = pool.map(make, sides)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for side, sprite in results:
        write_png(OUT_DIR / f"board-{side}.png", sprite.pixels)
        print("wrote", OUT_DIR / f"board-{side}.png")


if __name__ == "__main__":
    main()
