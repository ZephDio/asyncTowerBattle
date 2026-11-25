#!/usr/bin/env python3
"""Generates the science ribbon of the shop (src/shared/hud-element/science-hud.ts).

Run from anywhere: python3 scripts/generate-science-ribbon.py

Outputs, in public/resources/hud/science-ribbon/:
- top.png: the brass rod the ribbon hangs from, with the cloth sleeve looped over it.
- segment.png: a length of plain ribbon, one per science held, its seal drawn over it by the game.
- tail.png: the swallowtail end of the ribbon.

The ribbon is an undyed linen strip hanging right of the reserve, the seals of the army's sciences pressed on it like
wax seals on a charter. It mirrors the army banners (see generate-army-banners.py): the same pixel density (5 image
pixels per screen unit), the same ink and brass, and a muted cloth so the coloured seals stand out. The cloth is
14 pixels wide, so a 16 pixel stamp overhangs it by a pixel on each side.
"""

from pathlib import Path

from voxel_sprite import write_png

OUT = Path(__file__).resolve().parents[1] / "public" / "resources" / "hud" / "science-ribbon"
W = 30
CLOTH_LEFT, CLOTH_RIGHT = 8, 21
INK = (22, 28, 46)
BRASS = [(90, 70, 70), (180, 131, 85), (218, 181, 112), (245, 239, 169)]
# Selvage shadow, cloth face, folded edge (lit, on the left) and the stitching.
SHADE, FACE, FOLD, THREAD = (122, 98, 80), (180, 152, 114), (214, 192, 150), (236, 222, 186)
CLEAR = (0, 0, 0, 0)


def cloth(height, bottom=lambda c: 10**6, open_top=True, open_bottom=True, sleeve=None):
    """A strip of cloth `height` pixels tall, inked where it meets the outside. `bottom(c)` is the last row of the
    cloth column c; an open edge continues into the next part, so it gets no ink."""
    image = [[CLEAR] * W for _ in range(height)]
    columns = range(CLOTH_LEFT, CLOTH_RIGHT + 1)
    top = sleeve[0] if sleeve else 0

    def inside(x, y):
        if x not in columns:
            return False
        if y < 0:
            return open_top
        if y >= height:
            return open_bottom and bottom(x - CLOTH_LEFT) >= height
        return top <= y <= bottom(x - CLOTH_LEFT)

    for y in range(height):
        for x in columns:
            if not inside(x, y):
                continue
            c = x - CLOTH_LEFT
            edge = not all(inside(nx, ny) for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
            if edge:
                color = INK
            elif sleeve and y <= sleeve[1]:
                # The loop over the rod: lit on top, in shadow where it turns under.
                color = FOLD if y < (top + sleeve[1]) // 2 else SHADE
            elif sleeve and y <= sleeve[1] + 1:
                color = INK
            elif c == 1:
                color = FOLD
            elif c == CLOTH_RIGHT - CLOTH_LEFT - 1:
                color = SHADE
            elif c in (3, CLOTH_RIGHT - CLOTH_LEFT - 3) and y % 4 < 2:
                color = THREAD
            else:
                color = FACE
            image[y][x] = (*color, 255)
    return image


def top():
    image = cloth(14, open_top=False, sleeve=(1, 7))
    # The rod, behind the sleeve, with spear finials at both ends.
    for x in range(W):
        if CLOTH_LEFT <= x <= CLOTH_RIGHT:
            continue
        d = min(x, W - 1 - x)
        radius = min(d, 2) if d < 3 else 3 if d in (3, 4) else 1
        for dy in range(-radius, radius + 1):
            color = INK if abs(dy) == radius else BRASS[2 if dy < 0 else 1 if dy == 0 else 0]
            image[4 + dy][x] = (*color, 255)
    return image


def tail():
    height = 9
    middle = (CLOTH_RIGHT - CLOTH_LEFT) / 2
    # A short swallowtail, so a full ribbon keeps clear of the screen's bottom: the two points hang at the bottom, the
    # notch rises 5 pixels in the middle.
    return cloth(height, bottom=lambda c: height - 1 - round(5 * (1 - abs(c - middle) / middle)), open_bottom=False)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, image in (("top", top()), ("segment", cloth(22)), ("tail", tail())):
        write_png(OUT / f"{name}.png", image)
        print(f"wrote {(OUT / f'{name}.png').relative_to(OUT.parents[2])}")


if __name__ == "__main__":
    main()
