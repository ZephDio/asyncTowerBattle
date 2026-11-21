#!/usr/bin/env python3
"""Draw the Fury HUD icon: a fighter charging inside a rising aura."""
from pathlib import Path

from sprite_sheet import outline, to_pixels
from voxel_sprite import write_png

OUTPUT = Path(__file__).resolve().parents[1] / "public/resources/hud/furry.png"
PALETTE = {
    "#": (24, 20, 37, 255),
    "K": (52, 28, 40, 255),  # fighter silhouette
    "g": (250, 157, 39, 255),  # amber tips
    "Y": (255, 222, 91, 255),  # luminous core
    "B": (126, 201, 255, 255),  # sparks
}
SPRITE = [
    "........................",
    ".............g..........",
    ".......g....gg....g.....",
    ".......gg..gYg...gg.....",
    "....g..gYggYYgg.gYg.....",
    "....gggYYYYYYYggYYg..g..",
    "....gYYYYYKYKYYYYYggg...",
    "..g..gYYYKKKKKYYYYYYg...",
    "..gggYYYYYKKKKYYYYYg....",
    "...gYYYYYYKKKKYYYYYggg..",
    "...gYKKYYYYKKYYYYKKYg...",
    ".gggYKKKYYKKKKYYKKKYg...",
    "..gYYYKKKKKKKKKKKKYYgg..",
    "..ggYYYKKYKKKKYYKYYYYg..",
    "...gYBYYYYKKKKYYYYBYYg..",
    "..ggYYBBYYYKKKYYYBBYYgg.",
    "...gYYYBYYKKKKYYBYYYgg..",
    "...ggYYYYKKKKKKYYYYYg...",
    "..ggYYYKKKYYYYKKKYYYgg..",
    "...ggYYKKYYYYYYKKYYgg...",
    "....ggYKKYYYYYYKKYgg....",
    ".....ggKKgYYYYgKKgg.....",
    "......KKKg....gKKK......",
    "........................",
]

if __name__ == "__main__":
    write_png(OUTPUT, to_pixels(outline(SPRITE, "#"), PALETTE, scale=4))
