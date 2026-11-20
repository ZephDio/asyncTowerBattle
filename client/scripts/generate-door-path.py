#!/usr/bin/env python3
"""Generates the path tiles of the two locked path ends: stone bricks fading into the dirt path.

Run from the repo root (needs Pillow):
  nix-shell .agents/skills/pixel-art-assets/shell.nix --run "python3 client/scripts/generate-door-path.py"

Outputs public/resources/path/door-{straight,turn-left,turn-right}.png, for the enemy door with a painted arrow
showing where the enemy comes in, and castle-entry-{straight,turn-left,turn-right}.png, for the tile under the castle,
without the arrow.

Both tiles always connect up, to the enemy half or into the castle, and to one tile of the grid: below (straight)
or on a side (turn). Unlike the other path images these are drawn as they are, never rotated, so the stone always
sits on the up arm. They reuse the dirt tiles' footprint and texture (normal-straight.png, normal-turn.png): the bricks
cover the up end of the path, then drop out one by one, leaving scattered stones and pebbles on the dirt.
"""

import math
import random
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PATH_DIR = ROOT / "public" / "resources" / "path"

# Grey stones warmed toward the dirt (248, 201, 132) so the two blend.
STONES = [
    {"light": (170, 162, 152, 255), "base": (138, 130, 122, 255), "dark": (104, 97, 92, 255)},
    {"light": (160, 155, 150, 255), "base": (126, 121, 117, 255), "dark": (94, 89, 87, 255)},
    {"light": (176, 164, 146, 255), "base": (144, 133, 116, 255), "dark": (110, 100, 88, 255)},
]
MORTAR = (122, 96, 74, 255)

BRICK_W, BRICK_H = 7, 5  # with the one pixel mortar gap on the right and bottom
PATH_LEFT = 7  # the path's left edge, where the brick courses start

# Progress along the path: whole bricks before FADE_START, plain dirt after FADE_END, bricks thinning out between.
FADE_START, FADE_END = 0.22, 0.8
PEBBLE_END = 0.95


def straight_progress(x: int, y: int, height: int) -> float:
    return y / height


# The up and left arms meet around the inner corner (7, 7): a short stub down the up arm, a quarter turn around the
# corner, then a short stub along the left arm.
def turn_left_progress(x: int, y: int, _height: int) -> float:
    stub, arc = 7, 16
    total = stub + arc + stub
    if y < 7:
        return y / total
    if x < 7:
        return (stub + arc + (7 - x)) / total
    angle = math.atan2(y - 7, x - 7)
    return (stub + angle / (math.pi / 2) * arc) / total


def smoothstep(t: float) -> float:
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


# Each brick gets its own wear threshold: past it the brick is broken into a loose stone, and well past it, gone.
def brick_state(t: float, rng: random.Random) -> str:
    wear = smoothstep((t - FADE_START) / (FADE_END - FADE_START))
    threshold = rng.random()
    if wear < threshold * 0.75:
        return "whole"
    if wear < threshold * 0.75 + 0.5:
        return "broken"
    return "gone"


def paint_loose_stone(image, mask, left, top, rng):
    stone = rng.choice(STONES)
    width, height = rng.choice(((4, 3), (3, 3), (4, 2)))
    x0 = left + rng.randint(0, BRICK_W - 1 - width)
    y0 = top + rng.randint(0, BRICK_H - 1 - height)
    for dy in range(height):
        for dx in range(width):
            x, y = x0 + dx, y0 + dy
            if not mask(x, y):
                continue
            key = "light" if dy == 0 or dx == 0 else "dark" if dy == height - 1 or dx == width - 1 else "base"
            image.putpixel((x, y), stone[key])


def paint_brick(image, mask, left, top, rng):
    stone = rng.choice(STONES)
    for dy in range(BRICK_H):
        for dx in range(BRICK_W):
            x, y = left + dx, top + dy
            if not (0 <= x < image.width and 0 <= y < image.height) or not mask(x, y):
                continue
            image.putpixel((x, y), brick_pixel(stone, dx, dy))


def brick_pixel(stone, dx, dy):
    if dx == BRICK_W - 1 or dy == BRICK_H - 1:
        return MORTAR
    if dy == 0 or dx == 0:
        return stone["light"]
    if dy == BRICK_H - 2 or dx == BRICK_W - 2:
        return stone["dark"]
    return stone["base"]


def paint_pebble(image, mask, x, y, rng):
    stone = rng.choice(STONES)
    for (dx, dy), key in (((0, 0), "light"), ((1, 0), "base"), ((0, 1), "base"), ((1, 1), "dark")):
        if mask(x + dx, y + dy):
            image.putpixel((x + dx, y + dy), stone[key])


# A worn red arrow painted on the bricks, pointing down into the grid: the enemy units come in here. It sits on the
# up arm, which every door tile has, so the turn images get it too. The paint is darker where it covers the mortar.
ARROW = [
    "....###....",
    "....###....",
    "....###....",
    "....###....",
    "....###....",
    "....###....",
    "....###....",
    "....###....",
    "....###....",
    "....###....",
    "###########",
    ".#########.",
    "..#######..",
    "...#####...",
    "....###....",
    ".....#.....",
]
ARROW_TOP = 2
PAINT = (196, 64, 46, 255)
PAINT_IN_JOINTS = (148, 46, 36, 255)
PAINT_ON_DIRT = (214, 104, 72, 255)
PAINT_CHIPS = 0.08  # share of the arrow's pixels where the paint flaked off


def paint_arrow(image, dirt, mask, rng):
    left = PATH_LEFT + (21 - len(ARROW[0])) // 2
    for dy, row in enumerate(ARROW):
        for dx, pixel in enumerate(row):
            x, y = left + dx, ARROW_TOP + dy
            if pixel != "#" or not mask(x, y) or rng.random() < PAINT_CHIPS:
                continue
            image.putpixel((x, y), paint_over(image.getpixel((x, y)), dirt.getpixel((x, y))))


# Bright on the stones, darker in the mortar joints, soaked and faded where the tip runs onto the dirt.
def paint_over(under, dirt_under):
    if under == MORTAR:
        return PAINT_IN_JOINTS
    if under == dirt_under:
        return PAINT_ON_DIRT
    return PAINT


def door_tile(dirt: Image.Image, progress, seed: int, arrow: bool = True) -> Image.Image:
    image = dirt.copy()
    width, height = image.size
    rng = random.Random(seed)

    def mask(x, y):
        return 0 <= x < width and 0 <= y < height and dirt.getpixel((x, y))[3] > 0

    for row in range(-1, height // BRICK_H + 1):
        top = row * BRICK_H
        offset = (BRICK_W // 2) * (row % 2)
        for column in range(-1, width // BRICK_W + 2):
            left = PATH_LEFT - offset + column * BRICK_W
            cx, cy = left + BRICK_W // 2, top + BRICK_H // 2
            covered = [
                (x, y) for x in range(left, left + BRICK_W - 1) for y in range(top, top + BRICK_H - 1) if mask(x, y)
            ]
            if not covered:
                continue
            centers = covered if not mask(cx, cy) else [(cx, cy)]
            t = progress(*centers[len(centers) // 2], height)
            state = brick_state(t, rng)
            if state == "whole":
                paint_brick(image, mask, left, top, rng)
            if state == "broken":
                paint_loose_stone(image, mask, left, top, rng)

    # Its own random draws, so the bricks and pebbles stay where they were.
    if arrow:
        paint_arrow(image, dirt, mask, random.Random(seed + 100))

    for y in range(height):
        for x in range(width):
            t = progress(x, y, height)
            if FADE_START < t < PEBBLE_END and mask(x, y) and image.getpixel((x, y)) == dirt.getpixel((x, y)):
                chance = 0.02 * (1 - smoothstep((t - FADE_END) / (PEBBLE_END - FADE_END)))
                if rng.random() < chance:
                    paint_pebble(image, mask, x, y, rng)
    return image


def main() -> None:
    straight = Image.open(PATH_DIR / "normal-straight.png").convert("RGBA")
    # normal-turn connects up and right: mirrored, it connects up and left.
    turn_left_dirt = ImageOps.mirror(Image.open(PATH_DIR / "normal-turn.png").convert("RGBA"))

    outputs = {
        "door-straight.png": door_tile(straight, straight_progress, seed=3),
        "door-turn-left.png": door_tile(turn_left_dirt, turn_left_progress, seed=11),
    }
    outputs["door-turn-right.png"] = ImageOps.mirror(outputs["door-turn-left.png"])
    # The tile under the castle: the same stone road, leading up into the castle, without the arrow.
    outputs["castle-entry-straight.png"] = door_tile(straight, straight_progress, seed=5, arrow=False)
    outputs["castle-entry-turn-left.png"] = door_tile(turn_left_dirt, turn_left_progress, seed=13, arrow=False)
    outputs["castle-entry-turn-right.png"] = ImageOps.mirror(outputs["castle-entry-turn-left.png"])
    for name, image in outputs.items():
        image.save(PATH_DIR / name)
        print(f"wrote {(PATH_DIR / name).relative_to(ROOT)}")


if __name__ == "__main__":
    main()
