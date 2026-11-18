#!/usr/bin/env python3
"""Extract the green artwork (not paper) from the supplied uncommon reference.

Color segmentation is specific to these green-on-tan assets. Decoration-only
resampling is permitted; the destination common image is never transformed.
"""
from pathlib import Path
from collections import deque
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'assets'
BASE = ROOT / 'common.png'
SOURCE = ROOT / 'uncommon.png'
OUT = ROOT / 'overlays/uncommon-extracted-aligned-v2.png'


def extract(source, color='green'):
    width, height = source.size
    pixels = source.load()
    mask = Image.new('L', source.size)
    mp = mask.load()
    # Paper is red-dominant. Restrict chroma extraction to the border regions.
    rare = color == 'blue'
    if color not in ('green', 'blue'):
        raise ValueError('Supported extraction colors: green, blue')
    outer = .04 if rare else .045
    end = .875 if rare else .86
    for y in range(round(height*.015), round(height*end)):
        for x in list(range(round(width*outer), round(width*.23))) + list(range(round(width*.77), round(width*(1-outer)))):
            r, g, b, a = pixels[x, y]
            if rare:
                valid = a and b > g and b > 18
                coverage = max(0, min(1, (b-r+5)/16))
            else:
                valid = a and g > b * 1.18 and g > 18
                coverage = max(0, min(1, (g-r+5)/12))
            if valid:
                # Smooth alpha across the decoration/tan transition; no paper
                # rectangles or differences between regenerated sheets.
                mp[x, y] = round(a*coverage)
    # Discard tiny disconnected green noise without filling gaps with paper.
    seen = set()
    for y in range(height):
        for x in range(width):
            if mp[x, y] == 0 or (x, y) in seen:
                continue
            component = []
            queue = deque([(x, y)])
            seen.add((x, y))
            while queue:
                px, py = queue.popleft()
                component.append((px, py))
                for nx, ny in ((px-1,py),(px+1,py),(px,py-1),(px,py+1)):
                    if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in seen and mp[nx, ny]:
                        seen.add((nx, ny))
                        queue.append((nx, ny))
            if len(component) < (24 if rare else 80):
                for px, py in component:
                    mp[px, py] = 0
    result = source.copy()
    result.putalpha(mask)
    # Avoid storing parchment RGB in fully transparent areas.
    clean = Image.new('RGBA', source.size)
    clean.paste(result, (0, 0))
    cp = clean.load()
    for y in range(height):
        for x in range(width):
            if cp[x, y][3] == 0:
                cp[x, y] = (0, 0, 0, 0)
    return clean


def edge(image, y, right):
    x = image.width // 2
    step = 1 if right else -1
    while 0 <= x+step < image.width and image.getpixel((x+step, y))[3] >= 240:
        x += step
    return x


def align(extracted, source, base, source_top=17, source_ends=(810, 800), inset=0,
          target_top=35, top_shift=8):
    """Reposition decoration only, with independent contour/roll landmarks."""
    scaled = extracted.resize(base.size, Image.Resampling.LANCZOS)
    guide = source.resize(base.size, Image.Resampling.LANCZOS)
    result = Image.new('RGBA', base.size)
    w, h = base.size
    scale = h/945
    mid = w//2
    for right in (False, True):
        # Measured source tips and base fold endpoints, expressed in the common
        # canvas after initial coordinate transfer. Paper is never transplanted.
        source_end = source_ends[1 if right else 0]
        target_end = 789 if right else 803
        half_left = mid if right else 0
        half = scaled.crop((half_left, 0, w if right else mid, h))

        def contour_shift(y, sy):
            # Smooth raster silhouette noise so a one-pixel edge fluctuation
            # cannot produce a visible step in the transferred stem.
            radius = max(1, round(12*scale))
            return sum(edge(base, max(0,min(h-1,y+k)), right) -
                       edge(guide, max(0,min(h-1,sy+k)), right)
                       for k in range(-radius, radius+1))/(2*radius+1)

        for y in range(round(target_top*scale), round(target_end*scale)+1):
            if y < 180*scale:
                source_y = (source_top+(y/scale-target_top)*(180-source_top)/(180-target_top))*scale
            else:
                source_y = (180+(y/scale-180)*(source_end-180)/(target_end-180))*scale
            sy = max(0, min(h-1, round(source_y)))
            if y >= 180*scale:
                shift = contour_shift(y, sy)
            else:
                t = (y/scale-target_top)/(180-target_top)
                lower_shift = contour_shift(round(180*scale), round(180*scale))
                shift = (1-t)*(-top_shift if right else top_shift)*w/576+t*lower_shift
            shift += (-1 if right else 1)*inset*w/576
            row = half.transform((w, 1), Image.Transform.AFFINE,
                                 (1, 0, -shift-half_left, 0, 1, source_y),
                                 Image.Resampling.BICUBIC)
            # Halves occupy disjoint border strips; paste without erasing the
            # opposite side's already transferred decoration.
            x0, x1 = (mid, w) if right else (0, mid)
            result.paste(row.crop((x0, 0, x1, 1)), (x0, y))
    return result


def main():
    if OUT.exists():
        raise SystemExit(f'{OUT} already exists')
    with Image.open(BASE) as image:
        base = image.convert('RGBA')
    with Image.open(SOURCE) as image:
        source = image.convert('RGBA')
    extracted = extract(source)
    # Transfer only isolated decoration into the destination coordinate space.
    layer = align(extracted, source, base)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    layer.save(OUT)
    report = {'base': str(BASE), 'source': str(SOURCE), 'base_size': base.size,
              'source_size': source.size, 'overlay_size': layer.size,
              'method': 'green chroma extraction; independent contour and fold landmark alignment of decoration only'}
    OUT.with_suffix('.json').write_text(json.dumps(report, indent=2)+'\n')
    print(report)


if __name__ == '__main__':
    main()
