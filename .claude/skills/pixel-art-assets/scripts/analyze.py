#!/usr/bin/env python3
"""Prints size, bounding box, pixel scale and palette of PNG assets.

Usage: python3 analyze.py <png> [<png> ...] [--colors N]

The run-length histogram tells the pixel scale: native 1px art has short runs (1, 2, 3...),
upscaled art has runs that are multiples of the scale. Smooth/painted art shows hundreds of colors.
"""

import argparse
from collections import Counter

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+")
    parser.add_argument("--colors", type=int, default=20)
    args = parser.parse_args()
    for path in args.paths:
        image = Image.open(path).convert("RGBA")
        width, height = image.size
        pixels = image.load()
        runs: Counter[int] = Counter()
        for y in range(0, height, 3):
            run = 1
            for x in range(1, width):
                if pixels[x, y] == pixels[x - 1, y]:
                    run += 1
                else:
                    runs[run] += 1
                    run = 1
        colors = Counter(image.get_flattened_data() if hasattr(image, "get_flattened_data") else image.getdata())
        print(f"== {path}")
        print(f"size {width}x{height}  bbox {image.getbbox()}  distinct colors {len(colors)}")
        print(f"run lengths {runs.most_common(6)}")
        for color, count in colors.most_common(args.colors):
            print(f"  {color}  x{count}")


if __name__ == "__main__":
    main()
