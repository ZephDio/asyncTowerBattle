#!/usr/bin/env python3
"""Builds the icon font that draws the game's pixel icons in place of emoji in canvas text.

Run from client/ with: pnpm generate:icon-font
(it runs this script in a nix shell providing fontTools).

Outputs:
- public/font/icons.ttf: a color font (COLR v0 / CPAL) with one glyph per emoji in EMOJI, drawn from the icon PNG
  in public/resources/icons/. The bottom layer is the whole silhouette in the outline ink, then each other palette
  color is a layer made of the icon's pixels as squares, so the glyph is the pixel art itself at any font size. The
  ink silhouette under everything keeps antialiased seams between colors dark instead of letting the background
  show through the 1px outline. U+FE0F (emoji presentation selector) maps to an empty zero-width glyph so
  "⚔️" draws like "⚔" (same for "🗡️").
- public/font/icons.css: @font-face rules adding icons.ttf to the "text" and "title" families, limited by
  unicode-range to the emoji below. Canvas text set in those fonts then draws the icons for these characters and
  the regular font for everything else, so a description can just write "produce 5🌽".

Rerun it after changing an icon PNG or EMOJI.
"""

import math
from pathlib import Path

from fontTools.colorLib.builder import buildCOLR, buildCPAL
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

from sprite_sheet import read_png

ROOT = Path(__file__).resolve().parent.parent
ICONS_DIR = ROOT / "public" / "resources" / "icons"
FONT = ROOT / "public" / "font" / "icons.ttf"
CSS = ROOT / "public" / "font" / "icons.css"
FAMILIES = ["text", "title"]

# Emoji and the icon drawn in their place.
EMOJI = {
    "🪙": "gold",
    "🌽": "corn",
    "❤": "heart-container",
    "🖤": "heart-container-empty",
    "🥾": "unit-speed",
    "💚": "unit-health",
    "⚔": "tower-attack",
    "🗡": "unit-castle-damage",
    "💠": "tower-cast-speed",
    "▣": "pattern-star-active",
    "☆": "pattern-star-inactive",
}
VARIATION_SELECTOR = 0xFE0F

# Metrics, on the 2048 units per em of text.ttf (cap height 1438). Every icon is drawn ICON_SIZE units square, 1.25em
# so it pops out of the text, whatever its sprite size (16px for most, 24px for the pattern stars). It goes from
# BOTTOM under the baseline up to well above the cap height, with SIDE_BEARING on each side.
UNITS_PER_EM = 2048
ICON_SIZE = 2560
BOTTOM = -440
SIDE_BEARING = 64
ADVANCE = ICON_SIZE + 2 * SIDE_BEARING
ASCENT, DESCENT = 1868, -692

Color = tuple[int, int, int, int]
Cells = set[tuple[int, int]]
Rect = tuple[int, int, int, int]


def runs(line: list[Color]) -> list[int]:
    lengths = [1]
    for previous, color in zip(line, line[1:]):
        if color == previous:
            lengths[-1] += 1
        else:
            lengths.append(1)
    return lengths


def sprite_pixels(path: Path) -> list[list[Color]]:
    """The icon at one value per sprite pixel. The PNG is the sprite upscaled by a whole factor: the largest one
    dividing every run of equal colors along the rows and the columns."""
    pixels = read_png(path)
    size = len(pixels)
    assert size == len(pixels[0]), f"{path.name} is not square"
    columns = [[row[x] for row in pixels] for x in range(size)]
    scale = math.gcd(*(length for line in pixels + columns for length in runs(line)))
    return [[pixels[y][x] for x in range(0, size, scale)] for y in range(0, size, scale)]


def rectangles(cells: Cells, size: int) -> list[Rect]:
    """Covers the (x, y) cells with rectangles (x0, y0, x1, y1): horizontal runs, merged down while they repeat."""
    row_runs: dict[int, list[tuple[int, int]]] = {}
    for y in range(size):
        x = 0
        while x < size:
            if (x, y) in cells:
                start = x
                while x < size and (x, y) in cells:
                    x += 1
                row_runs.setdefault(y, []).append((start, x))
            x += 1
    rects: list[Rect] = []
    open_rects: dict[tuple[int, int], int] = {}
    for y in range(size + 1):
        row = set(row_runs.get(y, []))
        for run in list(open_rects):
            if run not in row:
                rects.append((run[0], open_rects.pop(run), run[1], y))
        for run in row:
            open_rects.setdefault(run, y)
    return rects


def to_units(sprite_x: int, size: int) -> int:
    """A sprite pixel edge in font units, from the left or top of the icon."""
    return round(sprite_x * ICON_SIZE / size)


def glyph(cells: Cells, size: int):
    """A TrueType glyph filling the sprite cells, row 0 at the top of the icon."""
    pen = TTGlyphPen(None)
    top = BOTTOM + ICON_SIZE
    for x0, y0, x1, y1 in rectangles(cells, size):
        left, right = SIDE_BEARING + to_units(x0, size), SIDE_BEARING + to_units(x1, size)
        upper, lower = top - to_units(y0, size), top - to_units(y1, size)
        # Clockwise, as TrueType fills it.
        pen.moveTo((left, lower))
        pen.lineTo((left, upper))
        pen.lineTo((right, upper))
        pen.lineTo((right, lower))
        pen.closePath()
    return pen.glyph()


def left_side_bearing(cells: Cells, size: int) -> int:
    """The glyph's leftmost x. hmtx must hold it exactly: renderers shift the outline so its leftmost point lands on
    the declared side bearing, which would misalign the color layers of one icon if they all declared the same."""
    return SIDE_BEARING + to_units(min(x for x, _ in cells), size) if cells else 0


def main() -> None:
    glyphs = {".notdef": glyph(set(), 1), "vs16": glyph(set(), 1)}
    metrics = {".notdef": (ADVANCE, 0), "vs16": (0, 0)}
    cmap = {VARIATION_SELECTOR: "vs16"}
    palette: list[Color] = []
    layers: dict[str, list[tuple[str, int]]] = {}

    for emoji, icon in EMOJI.items():
        pixels = sprite_pixels(ICONS_DIR / f"{icon}.png")
        size = len(pixels)
        by_color: dict[Color, set[tuple[int, int]]] = {}
        for y, row in enumerate(pixels):
            for x, color in enumerate(row):
                if color[3] >= 128:
                    by_color.setdefault(color, set()).add((x, y))
        # The outline ink is the darkest color. The silhouette is both the base glyph, for renderers without color
        # font support, and the bottom layer in ink.
        ink = min(by_color, key=lambda color: sum(color[:3]))
        silhouette = set().union(*by_color.values())
        glyphs[icon] = glyph(silhouette, size)
        metrics[icon] = (ADVANCE, left_side_bearing(silhouette, size))
        cmap[ord(emoji)] = icon
        layers[icon] = []
        fills = [(ink, silhouette)] + sorted((color, cells) for color, cells in by_color.items() if color != ink)
        for index, (color, cells) in enumerate(fills):
            if color not in palette:
                palette.append(color)
            layer = f"{icon}.{index}"
            glyphs[layer] = glyph(cells, size)
            metrics[layer] = (ADVANCE, left_side_bearing(cells, size))
            layers[icon].append((layer, palette.index(color)))

    builder = FontBuilder(UNITS_PER_EM, isTTF=True)
    builder.setupGlyphOrder(list(glyphs))
    builder.setupCharacterMap(cmap)
    builder.setupGlyf(glyphs)
    builder.setupHorizontalMetrics(metrics)
    builder.setupHorizontalHeader(ascent=ASCENT, descent=DESCENT)
    builder.setupNameTable({"familyName": "ATB Icons", "styleName": "Regular"})
    builder.setupOS2(sTypoAscender=ASCENT, sTypoDescender=DESCENT, usWinAscent=ASCENT, usWinDescent=-DESCENT)
    builder.setupPost()
    builder.font["COLR"] = buildCOLR(layers, version=0)
    builder.font["CPAL"] = buildCPAL([[tuple(channel / 255 for channel in color) for color in palette]])
    builder.save(FONT)

    unicode_range = ", ".join(f"U+{code:X}" for code in sorted(cmap))
    CSS.write_text(
        "/* Generated by scripts/generate-icon-font.py: the pixel icons drawn in place of emoji in canvas text. */\n"
        + "".join(
            f'@font-face {{\n\tfont-family: "{family}";\n\tsrc: url("/font/icons.ttf");\n\tunicode-range: {unicode_range};\n}}\n'
            for family in FAMILIES
        )
    )
    print(f"wrote {FONT.relative_to(ROOT)} ({len(EMOJI)} icons, {len(palette)} colors) and {CSS.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
