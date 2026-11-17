#!/usr/bin/env python3
"""Generates the army buff icons shown in the battle HUD (src/shared/hud-element/battle/army-resume/army-buff-hud.ts).

Run from anywhere: python3 scripts/generate-buff-icons.py

Outputs, in public/resources/icons/:
- unit-speed.png: a winged boot, the unit movement speed buff.
- unit-health.png: a green heart, the unit vitality buff.
- tower-cast-speed.png: three cannonballs flying with speed streaks, the tower cast speed buff.
- tower-attack.png: a sword, the tower attack buff.

They follow the corn and heart container icons (see generate-corn.py): 16x16 sprites upscaled 4x, flat colors with
one or two shades per part, light from the top left, and the icons' dark ink outline drawn around the silhouette.
The sprites are hand placed below (one character per pixel), the outline is added automatically on the transparent
pixels around them.
"""

from pathlib import Path

from sprite_sheet import Frame, outline, to_pixels
from voxel_sprite import write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public" / "resources" / "icons"
SCALE = 4

OUTLINE = (24, 20, 37, 255)
PALETTE = {
    # Leather, from light to dark
    "l": (181, 120, 78, 255),
    "m": (137, 84, 58, 255),
    "b": (92, 54, 44, 255),
    # Sole, its dark rubber and the light welt above it
    "k": (60, 36, 40, 255),
    "n": (214, 170, 110, 255),
    # Gold cuff, the gold coin's yellows
    "G": (254, 231, 97, 255),
    "g": (254, 174, 52, 255),
    "o": (205, 112, 38, 255),
    # Feathers, from white to shade
    "W": (250, 250, 240, 255),
    "F": (200, 214, 226, 255),
    "S": (132, 150, 176, 255),
    # Green heart, from glint to shade
    "w": (230, 255, 210, 255),
    "H": (156, 219, 67, 255),
    "L": (89, 193, 53, 255),
    "M": (20, 160, 46, 255),
    "D": (26, 122, 62, 255),
    # Cast iron cannonballs, from highlight to shade
    "1": (196, 206, 222, 255),
    "2": (124, 136, 160, 255),
    "3": (78, 86, 110, 255),
    "4": (48, 52, 72, 255),
    "K": OUTLINE,
}

# A leather boot tilted forward mid-stride, heel lifted and toe down, with a gold cuff, a welted sole and a three
# feathered wing rising from the back of its shaft.
# The first and last rows and columns stay empty for the outline.
UNIT_SPEED = [
    "................",
    "....WW...GG.....",
    ".WW..WW.lgGGG...",
    "..WWWSWWlmggGGG.",
    "...WWWSWmmmmmgo.",
    ".WWSWWWSWmmmbb..",
    "..WWWSWWWmmmb...",
    "...FFFWWWmmb....",
    "...nlSFFFmbb....",
    "..knlmmmmmb.....",
    "...kknmmmmmlb...",
    ".....kknmmlllb..",
    "......knnnnnnb..",
    "........kkkkkk..",
    "................",
    "................",
]

# The heart container's heart without its rim, in the leaf greens of the corn husk.
UNIT_HEALTH = [
    "................",
    "................",
    "..HHHH....HHHH..",
    ".HLwHLL..HLLLMD.",
    ".HwLLLLHHLLLLMD.",
    ".HLLLLLLLLLLMMD.",
    ".HLLLLLLLLLLMMD.",
    ".MLLLLLLLLLMMMD.",
    "..MLLLLLLLLMMD..",
    "...MLLLLLLMMD...",
    "....MLLLLMMD....",
    ".....MMMMMD.....",
    "......MMDD......",
    ".......DD.......",
    "................",
    "................",
]

# Three cannonballs of different sizes flying right, lit from the top left, with speed streaks trailing behind them.
TOWER_CAST_SPEED = [
    "................",
    "................",
    "................",
    "..........1122..",
    "....112..112233.",
    "....1234.122333.",
    "....234..223334.",
    ".........233344.",
    "..........3344..",
    "...W..WW........",
    "..WW.WW.........",
    "..W.WW..123.....",
    ".WW.W...234.....",
    ".W.W..W..4......",
    ".....W..........",
    "................",
]

# A sword pointing up and right: a steel blade in the cannonballs' iron (lit edge, middle, shaded edge), a gold
# crossguard and pommel, and a leather grip.
TOWER_ATTACK = [
    "................",
    "..............1.",
    ".............12.",
    "............123.",
    "...........123..",
    "..........123...",
    ".........123....",
    "....gG..123.....",
    ".....gG123......",
    "......gG........",
    ".....lmgG.......",
    "....lm..gG......",
    "...lm...........",
    "..Gg............",
    "..go............",
    "................",
]

ICONS: dict[str, Frame] = {
    "unit-speed.png": UNIT_SPEED,
    "unit-health.png": UNIT_HEALTH,
    "tower-cast-speed.png": TOWER_CAST_SPEED,
    "tower-attack.png": TOWER_ATTACK,
}


def main() -> None:
    for name, sprite in ICONS.items():
        assert all(len(row) == len(sprite) for row in sprite), f"{name}: every row must be as long as the sprite is tall"
        write_png(OUTPUT_DIR / name, to_pixels(outline(sprite, "K"), PALETTE, scale=SCALE))
        print(f"wrote {(OUTPUT_DIR / name).relative_to(ROOT)}")


if __name__ == "__main__":
    main()
