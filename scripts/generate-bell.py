#!/usr/bin/env python3
"""Generates the shop's refresh bell pixel art.

Run from anywhere: python3 scripts/generate-bell.py

Outputs public/resources/button/bell.png, the button that rerolls the shop offers, and bell.sheet.png with its JSON
next to it: the "press" animation played once on click. The plunger goes halfway down, hits the bottom while ring
marks burst out on both sides, then comes back up halfway as the marks fly further out and shrink.

A counter bell: a black round base with a flared foot, a chrome rim ring, a chrome dome and a plunger on top. It is
modeled as voxels and rendered by voxel_sprite.py, which holds the camera, lighting and outlines.
"""

import json
import math
from pathlib import Path

from sprite_sheet import Pixels, write_strip
from voxel_sprite import EMPTY, OUTLINE, TRANSPARENT, Hit, VoxelGrid, outline, render, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "resources" / "button" / "bell.png"
SHEET = OUTPUT.with_name("bell.sheet.png")
WIDTH = 88
HEIGHT = 88
ORIGIN_Y = 52

# Ramps from dark to light
CHROME = [(54, 60, 84, 255), (92, 102, 128, 255), (142, 154, 176, 255), (196, 206, 220, 255), (240, 244, 248, 255)]
BASE = [(32, 32, 44, 255), (46, 48, 64, 255), (68, 70, 90, 255), (104, 108, 132, 255)]

# Base: a short cylinder flaring out at the foot
BASE_RADIUS = 30
FOOT_RADIUS = 34
FOOT_HEIGHT = 4
BASE_HEIGHT = 11
# Chrome ring between the base and the dome
RING_RADIUS = 28
RING_HEIGHT = 4
# Dome: a flattened half sphere
DOME_RADIUS = 26
DOME_HEIGHT = 22
# Plunger: a thin stem, a collar and a round knob
STEM_RADIUS = 3
STEM_HEIGHT = 7
COLLAR_RADIUS = 5.5
COLLAR_HEIGHT = 3
KNOB_RADIUS = 5.5

# Press animation: (plunger drop in voxels, ring marks stage or None, milliseconds) per frame. Frame 0 is the still image
PRESS_FRAMES = [(0, None, 50), (3, None, 50), (6, 0, 140), (3, 1, 160)]
# Ring marks: three strokes on each side, radiating from a point above the dome at these angles above the horizontal,
# from an inner to an outer radius per stage
RING_CENTER = (44, 27)
RING_ANGLES = (12, 38, 64)
RING_RADII = [(22, 30), (28, 33)]
RING_COLOR = CHROME[4]

# A light from above: an even rim around the foot
SHADOW_RADII = (40, 40)

BASE_LABEL, RING_LABEL, DOME_LABEL, PLUNGER_LABEL = range(1, 5)

DOME_Z = BASE_HEIGHT + RING_HEIGHT


def build_model(press: int) -> VoxelGrid:
    grid = VoxelGrid()
    reach = FOOT_RADIUS + 1
    for y in range(-reach, reach):
        for x in range(-reach, reach):
            r = math.hypot(x + 0.5, y + 0.5)
            for z in range(BASE_HEIGHT):
                # The foot flares out over its first rows
                radius = BASE_RADIUS + (FOOT_RADIUS - BASE_RADIUS) * max(0, 1 - z / FOOT_HEIGHT)
                if r <= radius:
                    grid.set(x, y, z, BASE_LABEL)
            if r <= RING_RADIUS:
                for z in range(BASE_HEIGHT, DOME_Z):
                    grid.set(x, y, z, RING_LABEL)
            if r <= DOME_RADIUS:
                top = DOME_HEIGHT * math.sqrt(1 - (r / DOME_RADIUS) ** 2)
                for z in range(DOME_Z, DOME_Z + math.ceil(top)):
                    grid.set(x, y, z, DOME_LABEL)
            stem_bottom = DOME_Z + DOME_HEIGHT - 1
            if r <= STEM_RADIUS:
                for z in range(stem_bottom, stem_bottom + STEM_HEIGHT - press):
                    grid.set(x, y, z, PLUNGER_LABEL)
            if r <= COLLAR_RADIUS:
                for z in range(stem_bottom, stem_bottom + COLLAR_HEIGHT):
                    grid.set(x, y, z, PLUNGER_LABEL)
    knob_z = DOME_Z + DOME_HEIGHT + STEM_HEIGHT - press + round(KNOB_RADIUS) - 2
    reach = math.ceil(KNOB_RADIUS)
    for z in range(knob_z - reach, knob_z + reach):
        for y in range(-reach, reach):
            for x in range(-reach, reach):
                if math.hypot(x + 0.5, y + 0.5, z + 0.5 - knob_z) <= KNOB_RADIUS:
                    grid.set(x, y, z, PLUNGER_LABEL)
    return grid


def ramp(colors: list[tuple[int, int, int, int]], light: float, steps: list[float]) -> tuple[int, int, int, int]:
    return colors[sum(light >= step for step in steps)]


def shade(hit: Hit) -> tuple[int, int, int, int]:
    normal = hit.normal()
    light = hit.light(normal)
    if hit.label == BASE_LABEL:
        if hit.neighbor(0, 0, 1) == EMPTY:
            # The top of the base around the ring catches a little light
            return BASE[3] if normal[0] < 0.2 else BASE[2]
        # The cylinder darkens toward both edges, a bit less on the lit left side
        return ramp(BASE, light, [0.3, 0.6])
    if hit.label == RING_LABEL:
        if hit.neighbor(0, 0, 1) == EMPTY:
            return CHROME[4]
        # A bright band on the lit left, a dark reflection on the right edge
        return ramp(CHROME, light, [0.1, 0.35, 0.6, 0.7])
    if hit.label == PLUNGER_LABEL:
        return ramp(CHROME, light, [0.0, 0.4, 0.7, 0.85])
    # Chrome mirrors the room: the upper dome reflects the light sky, a dark band near the rim reflects the counter,
    # and a hot spot sits on the top left
    if light > 0.9:
        return CHROME[4]
    if normal[2] < 0.4:
        return CHROME[0] if light < 0.45 else CHROME[1]
    if normal[2] < 0.55:
        return CHROME[1] if light < 0.6 else CHROME[2]
    return ramp(CHROME, light, [0.3, 0.55, 0.8])


def crack(label: int, other: int) -> tuple[int, int, int, int] | None:
    if {label, other} in ({BASE_LABEL, RING_LABEL}, {RING_LABEL, DOME_LABEL}, {DOME_LABEL, PLUNGER_LABEL}):
        return OUTLINE
    return None


def draw_ring_marks(pixels: Pixels, stage: int) -> None:
    """Draws the ring marks as 2px strokes on the transparent pixels, outlined in ink."""
    inner, outer = RING_RADII[stage]
    segments = []
    for angle in RING_ANGLES:
        for side in (-1, 1):
            dx, dy = side * math.cos(math.radians(angle)), -math.sin(math.radians(angle))
            segments.append(((RING_CENTER[0] + dx * inner, RING_CENTER[1] + dy * inner), (dx, dy), outer - inner))

    def on_stroke(x: int, y: int) -> bool:
        for (sx, sy), (dx, dy), length in segments:
            px, py = x + 0.5 - sx, y + 0.5 - sy
            along = max(0, min(length, px * dx + py * dy))
            if math.hypot(px - along * dx, py - along * dy) <= 1.1:
                return True
        return False

    stroke = {(x, y) for y in range(HEIGHT) for x in range(WIDTH) if pixels[y][x] == TRANSPARENT and on_stroke(x, y)}
    for x, y in stroke:
        pixels[y][x] = RING_COLOR
    for x, y in stroke:
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < WIDTH and 0 <= ny < HEIGHT and pixels[ny][nx] == TRANSPARENT:
                pixels[ny][nx] = OUTLINE


def render_frame(press: int, ring: int | None) -> Pixels:
    sprite = render(build_model(press), 0, WIDTH, HEIGHT, ORIGIN_Y, shade, SHADOW_RADII, shadow_jitter=0.08)
    outline(sprite, crack, depth_gap=8)
    if ring is not None:
        draw_ring_marks(sprite.pixels, ring)
    return sprite.pixels


def main() -> None:
    frames = [(render_frame(press, ring), duration) for press, ring, duration in PRESS_FRAMES]
    write_png(OUTPUT, frames[0][0])
    print(f"wrote {OUTPUT.relative_to(ROOT)}")
    # Each frame has its own duration, so each one is its own tag run; they are merged into one "press" tag below
    write_strip(SHEET, [("press", [frame], duration) for frame, duration in frames])
    data = json.loads(SHEET.with_suffix(".json").read_text())
    data["meta"]["frameTags"] = [{"name": "press", "from": 0, "to": len(frames) - 1, "direction": "forward"}]
    SHEET.with_suffix(".json").write_text(json.dumps(data, indent=2) + "\n")
    print(f"wrote {SHEET.relative_to(ROOT)} and its JSON")


if __name__ == "__main__":
    main()
