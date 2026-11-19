#!/usr/bin/env python3
"""Validate a decoration-only layer and composite without modifying its base."""
import argparse
from pathlib import Path

from PIL import Image, ImageChops


def composite(base_path, overlay_path, output_path):
    base_path, overlay_path, output_path = map(
        Path, (base_path, overlay_path, output_path)
    )
    if output_path.resolve() in (base_path.resolve(), overlay_path.resolve()):
        raise ValueError("Output must not overwrite either input")
    if output_path.exists():
        raise ValueError("Output already exists; choose a new preview path")
    if output_path.suffix.lower() != ".png":
        raise ValueError("Output must be a PNG")
    with Image.open(base_path) as source:
        base = source.convert("RGBA")
    with Image.open(overlay_path) as source:
        if source.format != "PNG":
            raise ValueError("Overlay must be a PNG")
        if "A" not in source.getbands() and "transparency" not in source.info:
            raise ValueError("Overlay must have real transparency")
        overlay = source.convert("RGBA")
    if base.size != overlay.size:
        raise ValueError(f"Dimensions differ: base {base.size}, overlay {overlay.size}")
    alpha = overlay.getchannel("A")
    low, high = alpha.getextrema()
    if high == 0:
        raise ValueError("Overlay is empty")
    if low != 0:
        raise ValueError("Overlay must contain fully transparent pixels")
    outside = base.getchannel("A").point(lambda value: 255 if value == 0 else 0)
    if ImageChops.multiply(alpha, outside).getbbox():
        raise ValueError("Decoration extends outside the base silhouette")
    result = Image.alpha_composite(base, overlay)
    untouched = alpha.point(lambda value: 255 if value == 0 else 0)
    for before, after in zip(base.split(), result.split()):
        if ImageChops.multiply(ImageChops.difference(before, after), untouched).getbbox():
            raise ValueError("Pixels changed outside decoration")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation protects inputs and existing output even against path races.
    with output_path.open("xb") as target:
        result.save(target, format="PNG")
    print(f"Saved {output_path} ({base.width} x {base.height}); untouched pixels verified")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", required=True, type=Path)
    parser.add_argument("--overlay", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    try:
        composite(args.base, args.overlay, args.output)
    except (ValueError, OSError) as error:
        parser.exit(1, f"Error: {error}\n")


if __name__ == "__main__":
    main()
