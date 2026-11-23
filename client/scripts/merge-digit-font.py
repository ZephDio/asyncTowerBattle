#!/usr/bin/env python3
"""Draws the digits 0-9 of the game fonts in the pixel style of x10y12pxDonguriDuel.

Run from client/ with: pnpm generate:digit-font
(it runs this script in a nix shell providing fontTools).

It replaces the glyphs of "0".."9" in public/font/text.ttf and public/font/title.ttf with the ones of
scripts/fonts/x10y12pxDonguriDuel.ttf (hicc, see docs/fonts.md), in place. Running it again gives the same result.
The icon font (generate-icon-font.py) is a separate file layered on top by unicode-range, so it does not touch them.

Each source digit is 5x8 pixels of 8 units on a 96 units em. Every pixel becomes PIXEL_SIZE units of the target
em (a whole number, so the edges stay sharp), which makes the digit as tall as the digits it replaces. The advance is
the 6 pixels of the source (5 plus one of spacing), and the digit sits on the baseline.
"""

from pathlib import Path

from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path(__file__).resolve().parent / "fonts" / "x10y12pxDonguriDuel.ttf"
SOURCE_PIXEL = 8
DIGITS = "0123456789"

# Pixel size in units of the 2048 em. text.ttf digits are 1333 tall (8 pixels: 1336), title.ttf ones about 1550 (1552).
TARGETS = {"text.ttf": 167, "title.ttf": 194}


def merge(target_path: Path, pixel_size: int) -> None:
    source = TTFont(SOURCE)
    target = TTFont(target_path)
    assert target["head"].unitsPerEm == 2048
    source_glyphs = source.getGlyphSet()
    source_cmap = source.getBestCmap()
    target_cmap = target.getBestCmap()
    scale = pixel_size / SOURCE_PIXEL
    glyf = target["glyf"]
    for digit in DIGITS:
        pen = TTGlyphPen(None)
        source_glyphs[source_cmap[ord(digit)]].draw(TransformPen(pen, (scale, 0, 0, scale, 0, 0)))
        name = target_cmap[ord(digit)]
        glyph = pen.glyph()
        glyf[name] = glyph
        advance = round(source["hmtx"][source_cmap[ord(digit)]][0] * scale)
        target["hmtx"][name] = (advance, 0)
    target.save(target_path)
    print(f"{target_path.relative_to(ROOT)}: digits drawn with {pixel_size} unit pixels")


for file, pixel in TARGETS.items():
    merge(ROOT / "public" / "font" / file, pixel)
