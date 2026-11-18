#!/usr/bin/env python3
"""Extend existing border tails behind the unchanged foreground scroll footer.

The explicit fold trace is measured from this project's common.png. It must be
re-traced for another base; canvas equality alone is not sufficient.
"""
from pathlib import Path
import argparse
import hashlib
import json
from PIL import Image, ImageChops
from extract_uncommon import ROOT, extract, align
from extract_epic import extract_epic
from extract_legendary import extract_legendary
import importlib.util

INPUTS = {name: f'{name}.png' for name in ('uncommon','rare','epic','legendary')}


def build_border(name, source, base):
    # Rebuild in memory from the original references: old intermediate files
    # are intentionally not needed after cleaning the approved asset folders.
    if name == 'uncommon':
        return align(extract(source),source,base)
    if name == 'rare':
        return align(extract(source,color='blue'),source,base,
                     source_top=31,source_ends=(820,820))
    if name == 'epic':
        return align(extract_epic(source),source,base,
                     source_top=14,source_ends=(812,812),inset=4)
    return align(extract_legendary(source),source,base,source_top=14,
                 source_ends=(812,812),inset=8,target_top=18,top_shift=2)
# Center of the dark fold outline, independently traced across the base.
FOLD = [(0,832),(20,820),(40,813),(60,809),(80,808),(100,808),
        (120,809),(140,811),(160,813),(180,815),(200,817),(220,819),
        (240,821),(260,822),(280,823),(300,824),(320,825),(340,825),
        (360,825),(380,824),(400,821),(420,818),(440,814),(460,809),
        (480,804),(500,801),(520,796),(535,793),(540,793),(560,812),(575,850)]
BASE_SHA256 = '1500b665ec1b1f1807d062266e82e799d6c8cc60d743a8cc22bdb6b8573ec2a1'


def fold_y(x):
    for (x0,y0),(x1,y1) in zip(FOLD,FOLD[1:]):
        if x0 <= x <= x1:
            return y0+(y1-y0)*(x-x0)/(x1-x0)
    raise ValueError('Column outside fold trace')


def paper_mask(size):
    """Visible backing paper only; footer's top outline stays in foreground."""
    mask = Image.new('L',size)
    pixels = mask.load()
    for x in range(size[0]):
        cutoff = fold_y(x)-1
        for y in range(max(0,int(cutoff)+1)):
            pixels[x,y] = round(255*max(0,min(1,cutoff-y)))
    return mask


def fix_overlap(layer, mask):
    """Keep upper art fixed; extend only its last 100px behind the footer."""
    result = Image.new('RGBA',layer.size)
    w,h = layer.size
    join = 700
    for right in (False,True):
        x0,x1 = (w//2,w) if right else (0,w//2)
        half = layer.crop((x0,0,x1,h))
        bounds = half.getchannel('A').getbbox()
        if not bounds:
            raise ValueError('Missing side decoration')
        last = bounds[3]
        # Terminal artwork is carried below the lowest nearby fold position,
        # so its natural tip cannot remain visibly stranded above the footer.
        columns = [x0+x for x in range(half.width)
                   if half.getchannel('A').crop((x,join,x+1,last)).getbbox()]
        destination_end = round(max(fold_y(x) for x in columns)+12)
        result.paste(half.crop((0,0,half.width,join)),(x0,0))
        tail = half.crop((0,join,half.width,last))
        tail = tail.resize((half.width,destination_end-join),Image.Resampling.BICUBIC)
        result.paste(tail,(x0,join))
    result.putalpha(ImageChops.multiply(result.getchannel('A'),mask))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--destination',type=Path,default=ROOT/'build',
                        help='New output directory containing overlays/ and output/')
    args = parser.parse_args()
    base_path = ROOT/'common.png'
    if hashlib.sha256(base_path.read_bytes()).hexdigest()!=BASE_SHA256:
        raise SystemExit('Base changed: re-trace the foreground footer before proceeding.')
    with Image.open(base_path) as image:
        base = image.convert('RGBA')
    mask_path = ROOT/'footer/common-paper-mask.png'
    jobs = [(name,ROOT/source,
             args.destination/'overlays'/f'{name}.png',
             args.destination/'output'/f'{name}.png') for name,source in INPUTS.items()]
    for _,_,overlay,output in jobs:
        if overlay.exists() or output.exists():
            raise SystemExit('An output already exists; choose new versioned filenames.')
    mask = paper_mask(base.size)
    mask_path.parent.mkdir(parents=True,exist_ok=True)
    if not mask_path.exists():
        mask.save(mask_path)
    spec = importlib.util.spec_from_file_location('compositor',Path(__file__).with_name('composite.py'))
    compositor = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(compositor)
    for name,source,overlay,output in jobs:
        with Image.open(source) as image:
            reference = image.convert('RGBA')
        layer = build_border(name,reference,base)
        if layer.size!=base.size:
            raise ValueError('Overlay canvas must match the base')
        fixed = fix_overlap(layer,mask)
        overlay.parent.mkdir(parents=True,exist_ok=True)
        fixed.save(overlay)
        compositor.composite(base_path,overlay,output)
        with Image.open(output) as image:
            result = image.convert('RGBA')
        foreground = mask.point(lambda value:255 if value==0 else 0)
        for before,after in zip(base.split(),result.split()):
            assert not ImageChops.multiply(ImageChops.difference(before,after),foreground).getbbox()
        # Both sides must visibly reach the fold, not just pass a silhouette test.
        for right in (False,True):
            x0,x1 = (base.width//2,base.width) if right else (0,base.width//2)
            contact = any(fixed.getpixel((x,y))[3]>32 for x in range(x0,x1)
                          for y in range(int(fold_y(x))-3,int(fold_y(x)))
                          if 0<=y<base.height)
            assert contact, f'{name}: border does not reach the footer'
        print(f'{name}: both sides meet fold; foreground footer pixels unchanged')
    (args.destination/'footer-validation.json').write_text(json.dumps({
        'base_sha256':BASE_SHA256,'fold_trace':FOLD,'paper_mask':str(mask_path),
        'sources':INPUTS,'method':'lower-tail extension followed by foreground-footer occlusion',
    },indent=2)+'\n')


if __name__=='__main__':
    main()
