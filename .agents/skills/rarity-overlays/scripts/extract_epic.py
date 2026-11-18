#!/usr/bin/env python3
"""Extract epic's purple/gold side ornaments, leaving its paper and curls out."""
import hashlib
import json
from collections import deque
from PIL import Image, ImageFilter, ImageChops
from extract_uncommon import ROOT, align


def extract_epic(source):
    w, h = source.size
    src = source.load()
    purple = Image.new('L', source.size)
    seed = purple.load()
    bounds = {}
    # These side strips exclude the reference's differently shaped rolled ends.
    # Their purple curl outlines are not transferable side-border decorations.
    for y in range(round(h*.015), round(h*.86)):
        # Follow the inner curl boundary instead of a rectangular exclusion,
        # which would cut the sloping upper stems into disconnected pieces.
        landmarks = [(0,120),(100,125),(150,116),(200,94),(240,65),(270,50),(300,44)]
        yy = y*1606/h
        bound = 44
        for (y0,x0),(y1,x1) in zip(landmarks, landmarks[1:]):
            if y0 <= yy < y1:
                bound = x0+(x1-x0)*(yy-y0)/(y1-y0)
                break
        bounds[y] = (bound*w/979, w-bound*w/979)
        left = (bound*w/979, .23*w)
        right = (.77*w, w-bound*w/979)
        for lo, hi in (left, right):
            for x in range(round(lo), round(hi)):
                r, g, b, a = src[x, y]
                strength = min(b-g-3, r-g-1)
                if a and strength > 0:
                    seed[x, y] = round(a*min(1, strength/13))
    near = purple.filter(ImageFilter.MaxFilter(19))
    # Local paper estimate separates dark/saturated gold ink from the tan paper.
    background_b = source.getchannel('B').filter(ImageFilter.MedianFilter(21))
    nb, bg = near.load(), background_b.load()
    gold = Image.new('L', source.size)
    gp = gold.load()
    for y in range(h):
        for x in range(w):
            if not nb[x, y] or y not in bounds or not bounds[y][0] <= x <= bounds[y][1]:
                continue
            r, g, b, a = src[x, y]
            if r > g*1.06 and g > b*1.28 and bg[x, y]-b > 16:
                gp[x, y] = round(a*min(1, (bg[x,y]-b-16)/16))
    mask = ImageChops.lighter(purple, gold)
    mp = mask.load()
    seen = set()
    for y in range(h):
        for x in range(w):
            if not mp[x,y] or (x,y) in seen:
                continue
            queue = deque([(x,y)])
            seen.add((x,y))
            component = []
            while queue:
                xx, yy = queue.popleft()
                component.append((xx, yy))
                for nx, ny in ((xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)):
                    if 0<=nx<w and 0<=ny<h and (nx,ny) not in seen and mp[nx,ny]:
                        seen.add((nx,ny))
                        queue.append((nx,ny))
            if len(component) < 8:
                for xx,yy in component:
                    mp[xx,yy] = 0
    result = source.copy()
    result.putalpha(mask)
    pixels = result.load()
    for y in range(h):
        for x in range(w):
            if not mp[x,y]:
                pixels[x,y] = (0,0,0,0)
    return result


def main():
    base_path, source_path = ROOT/'common.png', ROOT/'epic.png'
    out = ROOT/'overlays/epic-extracted-v4.png'
    if out.exists():
        raise SystemExit(f'{out} already exists')
    with Image.open(base_path) as image:
        base = image.convert('RGBA')
    with Image.open(source_path) as image:
        source = image.convert('RGBA')
    decoration = extract_epic(source)
    layer = align(decoration, source, base, source_top=14, source_ends=(812,812), inset=4)
    out.parent.mkdir(parents=True, exist_ok=True)
    layer.save(out)
    report = {
        'base':base_path.name, 'source':source_path.name,
        'base_size':base.size, 'source_size':source.size, 'overlay_size':layer.size,
        'base_sha256':hashlib.sha256(base_path.read_bytes()).hexdigest(),
        'source_sha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),
        'method':'purple chroma and adjacent gold extraction; independent contour/roll alignment',
    }
    out.with_suffix('.json').write_text(json.dumps(report,indent=2)+'\n')
    print(report)


if __name__ == '__main__':
    main()
