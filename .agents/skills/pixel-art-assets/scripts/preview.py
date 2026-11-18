#!/usr/bin/env python3
"""Lays PNG assets side by side on a grass-like background, bottom aligned, upscaled with nearest neighbor.

Usage: python3 preview.py <out.png> <png> [<png> ...] [--scale 3]

Read the output image to judge new art next to existing references (e.g. a tower front view).
"""

import argparse

from PIL import Image

BACKGROUND = (200, 210, 170, 255)
GAP = 10


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("out")
    parser.add_argument("paths", nargs="+")
    parser.add_argument("--scale", type=int, default=3)
    args = parser.parse_args()
    images = [Image.open(path).convert("RGBA") for path in args.paths]
    width = sum(image.width for image in images) + GAP * (len(images) + 1)
    height = max(image.height for image in images) + GAP * 2
    sheet = Image.new("RGBA", (width, height), BACKGROUND)
    x = GAP
    for image in images:
        sheet.alpha_composite(image, (x, height - GAP - image.height))
        x += image.width + GAP
    sheet.resize((width * args.scale, height * args.scale), Image.NEAREST).save(args.out)
    print(f"wrote {args.out}")


if __name__ == "__main__":
    main()
