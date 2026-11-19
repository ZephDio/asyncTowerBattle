#!/usr/bin/env python3
"""Generates the blacksmith's ember spark pixel art.

Run from anywhere: python3 scripts/generate-ember-spark.py

Outputs public/resources/projectiles/ember-spark.png, a 28x12 comet facing right (the way a projectile with no
rotation points): a thin red tail growing into a round white-hot head, with the ink outline of the other pieces. It is
drawn 1.2 x 0.52 board units wide, a bit over 23 px per unit like the other projectiles, so it is much shorter than
the Zapping Tower's lightning.
"""

from pathlib import Path

from voxel_sprite import OUTLINE, TRANSPARENT, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "projectiles" / "ember-spark.png"
WIDTH, HEIGHT = 28, 12
# The body spans these columns, one pixel inside for the outline
BODY_FROM, BODY_TO = 2, 26
CENTER = (HEIGHT - 1) / 2

# Hot colors, from the cooling tail to the white-hot head
EMBER = [(150, 48, 44, 255), (214, 84, 40, 255), (244, 140, 44, 255), (252, 200, 80, 255), (255, 244, 190, 255)]


def half_thickness(column: int) -> float:
    """How far the body reaches above and under the middle row: thin tail, round head."""
    t = (column - BODY_FROM) / (BODY_TO - BODY_FROM)
    reach = 0.6 + 3.9 * min(t, 0.8) ** 0.8
    # The last columns round off the head
    if t > 0.8:
        reach *= max(0.0, 1 - ((t - 0.8) / 0.2) ** 2) ** 0.5
        reach = max(reach, 0.9)
    return reach


def build() -> list[list[tuple[int, int, int, int]]]:
    pixels = [[TRANSPARENT] * WIDTH for _ in range(HEIGHT)]
    body = set()
    for x in range(BODY_FROM, BODY_TO):
        reach = half_thickness(x)
        for y in range(HEIGHT):
            if abs(y - CENTER) <= reach:
                body.add((x, y))
    for x, y in body:
        t = (x - BODY_FROM) / (BODY_TO - BODY_FROM)
        # Hotter toward the head, and toward the middle row
        heat = t * 4.2 + (1 - abs(y - CENTER) / (half_thickness(x) + 0.5)) * 0.9
        pixels[y][x] = EMBER[max(0, min(len(EMBER) - 1, int(heat)))]
    for x, y in body:
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if (nx, ny) not in body and 0 <= nx < WIDTH and 0 <= ny < HEIGHT:
                pixels[ny][nx] = OUTLINE
    return pixels


def main() -> None:
    write_png(OUTPUT, build())
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
