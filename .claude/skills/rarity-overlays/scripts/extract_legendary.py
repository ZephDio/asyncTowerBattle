#!/usr/bin/env python3
"""Extract legendary's actual red/gold artwork; never transform the base."""
from collections import deque
import hashlib
import json
from PIL import Image, ImageChops, ImageFilter
from extract_uncommon import ROOT, align


def region_bound(y):
    # Inner curl boundary, measured on this reference's 979x1606 canvas.
    landmarks = [(0,120),(100,125),(150,116),(200,94),(240,65),(270,44)]
    for (y0,x0),(y1,x1) in zip(landmarks,landmarks[1:]):
        if y0 <= y < y1:
            return x0+(x1-x0)*(y-y0)/(y1-y0)
    # Diamond silhouette excludes the reference's vertical paper-edge outline
    # while retaining its projecting left/right tips.
    diamond = [(730,60),(740,62),(750,51),(760,37),(769,23),
               (778,37),(790,54),(800,65),(810,62),(825,65),(840,68)]
    for (y0,x0),(y1,x1) in zip(diamond,diamond[1:]):
        if y0 <= y < y1:
            return x0+(x1-x0)*(y-y0)/(y1-y0)
    return 22 if 280 <= y <= 375 else 44


def inner_bound(y):
    # Keep the red top plumes, not the source sheet's dark upper outline.
    if y < 30:
        return 148+(y-24)*4
    if y < 45:
        return 172+(y-30)*2.2
    return 235


def extract_legendary(source):
    w,h = source.size
    pixels = source.load()
    red = Image.new('L',source.size)
    rp = red.load()
    bounds = {}
    for y in range(round(h*.015),round(h*.859)):
        bound = region_bound(y*1606/h)*w/979
        inner = min(w*.24,inner_bound(y*1606/h)*w/979)
        bounds[y] = (bound,w-bound,inner)
        for lo,hi in ((bound,inner),(w-inner,w-bound)):
            for x in range(round(lo),round(hi)):
                r,g,b,a = pixels[x,y]
                # Scarlet ink and its dark outlines, not ordinary tan paper.
                # Red curvature exceeds the approximately linear RGB ramp of
                # brown parchment/fold shadows, which must not become ink.
                strength = r-2*g+b-38
                if a and r-g>35 and g<r*.62 and strength>0:
                    rp[x,y] = round(a*min(1,strength/14))
    nearby = red.filter(ImageFilter.MaxFilter(11))
    np = nearby.load()
    background = source.convert('RGB').filter(ImageFilter.MedianFilter(21))
    bg = background.load()
    gold = Image.new('L',source.size)
    gp = gold.load()
    for y,(lo,hi,inner) in bounds.items():
        for x in list(range(round(lo),round(inner)))+list(range(round(w-inner),round(hi))):
            if not np[x,y]:
                continue
            r,g,b,a = pixels[x,y]
            br,bg_,bb = bg[x,y]
            dark_gold = g>b*1.4 and r>g*1.04 and bb-b>14
            bright_gold = r>br+12 and g>bg_+18 and r>b*1.28
            saturated_gold = b<g*.55 and r-b>90
            if dark_gold or bright_gold or saturated_gold:
                gp[x,y] = a
    mask = ImageChops.lighter(red,gold)
    mp = mask.load()
    seen = set()
    for y in range(h):
        for x in range(w):
            if not mp[x,y] or (x,y) in seen:
                continue
            todo = deque([(x,y)])
            seen.add((x,y))
            component = []
            while todo:
                xx,yy = todo.popleft()
                component.append((xx,yy))
                for nx,ny in ((xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)):
                    if 0<=nx<w and 0<=ny<h and (nx,ny) not in seen and mp[nx,ny]:
                        seen.add((nx,ny))
                        todo.append((nx,ny))
            if len(component)<20:
                for xx,yy in component:
                    mp[xx,yy] = 0
    result = source.copy()
    result.putalpha(mask)
    out = result.load()
    for y in range(h):
        for x in range(w):
            if not mp[x,y]:
                out[x,y] = (0,0,0,0)
    return result


def main():
    base_path,source_path = ROOT/'common.png',ROOT/'legendary.png'
    out = ROOT/'overlays/legendary-extracted-v5.png'
    if out.exists():
        raise SystemExit(f'{out} already exists')
    with Image.open(base_path) as image:
        base = image.convert('RGBA')
    with Image.open(source_path) as image:
        source = image.convert('RGBA')
    decoration = extract_legendary(source)
    layer = align(decoration,source,base,source_top=14,source_ends=(812,812),
                  inset=8,target_top=18,top_shift=2)
    out.parent.mkdir(parents=True,exist_ok=True)
    layer.save(out)
    report = {
        'base':base_path.name,'source':source_path.name,
        'base_size':base.size,'source_size':source.size,'overlay_size':layer.size,
        'base_sha256':hashlib.sha256(base_path.read_bytes()).hexdigest(),
        'source_sha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),
        'method':'red/gold extraction; contour-aligned closer to sides with raised top plumes',
        'alignment':{'inset':8,'target_top':18,'top_shift':2},
    }
    out.with_suffix('.json').write_text(json.dumps(report,indent=2)+'\n')
    print(report)


if __name__=='__main__':
    main()
