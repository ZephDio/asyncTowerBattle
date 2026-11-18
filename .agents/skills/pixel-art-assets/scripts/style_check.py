#!/usr/bin/env python3
"""Checks a sprite against the tower/house style rules and prints what drifts.

Usage: python3 style_check.py <png> [<png> ...]

Reports, per image:
- colors not in the house palette (with pixel counts), and semi-transparent pixels that are not the shadow;
- outline run lengths: the references are dominated by runs of 2 (2px outline), a sprite dominated by
  runs of 1 has a too thin outline;
- silhouette edge colors: every opaque pixel touching transparency should be the outline color;
- the most frequent color adjacencies, which should pair neighbors of the same ramp (see SKILL.md).
"""

import argparse
from collections import Counter

from PIL import Image

OUTLINE = (22, 28, 46)
SHADOW = (22, 28, 46, 80)
PALETTE = {
    OUTLINE,
    # stone ramp
    (72, 63, 97), (67, 91, 125), (68, 142, 159), (90, 185, 187), (143, 226, 185),
    # wood ramp
    (90, 70, 70), (134, 99, 83), (180, 131, 85), (218, 181, 112),
    # thatch ramp
    (94, 71, 78), (138, 103, 99), (175, 140, 121), (227, 193, 140), (245, 239, 169),
}


def runs(values: list[bool]) -> list[int]:
    out, run = [], 0
    for value in values + [False]:
        if value:
            run += 1
        elif run:
            out.append(run)
            run = 0
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+")
    args = parser.parse_args()
    for path in args.paths:
        image = Image.open(path).convert("RGBA")
        width, height = image.size
        px = image.load()
        is_outline = [[px[x, y] == (*OUTLINE, 255) for x in range(width)] for y in range(height)]
        outline_runs: Counter[int] = Counter()
        for y in range(height):
            outline_runs.update(runs(is_outline[y]))
        for x in range(width):
            outline_runs.update(runs([is_outline[y][x] for y in range(height)]))

        foreign: Counter[tuple[int, ...]] = Counter()
        edge: Counter[tuple[int, ...]] = Counter()
        pairs: Counter[tuple[tuple[int, ...], ...]] = Counter()
        for y in range(height):
            for x in range(width):
                color = px[x, y]
                if color[3] == 0:
                    continue
                if color[3] != 255:
                    if color != SHADOW:
                        foreign[color] += 1
                    continue
                if color[:3] not in PALETTE:
                    foreign[color[:3]] += 1
                neighbors = [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
                if any(not (0 <= nx < width and 0 <= ny < height) or px[nx, ny][3] != 255 for nx, ny in neighbors):
                    edge[color[:3]] += 1
                for nx, ny in neighbors[::2]:
                    if nx < width and ny < height:
                        other = px[nx, ny]
                        if other[3] == 255 and other != color and OUTLINE not in (color[:3], other[:3]):
                            pairs[tuple(sorted((color[:3], other[:3])))] += 1

        print(f"== {path}")
        print(f"outline runs (want 2 most common): {sorted(outline_runs.items())[:6]}")
        print(f"silhouette edge colors (want only {OUTLINE}): {edge.most_common(4)}")
        print(f"off-palette colors: {len(foreign)}")
        for color, count in foreign.most_common(10):
            print(f"  {color}  x{count}")
        print("top adjacencies:")
        for pair, count in pairs.most_common(8):
            print(f"  {pair[0]} | {pair[1]}  x{count}")


if __name__ == "__main__":
    main()
