#!/usr/bin/env python3
"""Generates the fox unit's sprite sheet.

Run from anywhere: python3 scripts/generate-fox-sheet.py

Outputs public/resources/units/fox.sheet.png and public/resources/units/fox.sheet.json.

The sheet uses the TexturePacker / Aseprite "array" JSON format: the PNG is a horizontal strip of equal frames, the
JSON lists each frame's rectangle and duration in milliseconds, and meta.frameTags names the animations by frame
range. src/shared/sprite-sheet.ts reads it.

Frame 1 is fox.png pixel for pixel, still used alone in the shop. Frame 2 breathes out: every row above the belly
drops 1px (row 8, a plain body row, is the one squeezed out) so the head and back bob down while the legs stay
planted. Cycling the two makes the "idle" loop.
"""

import json
from pathlib import Path

from voxel_sprite import TRANSPARENT, write_png

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PNG = ROOT / "public" / "resources" / "units" / "fox.sheet.png"
OUTPUT_JSON = ROOT / "public" / "resources" / "units" / "fox.sheet.json"

PALETTE = {
    "a": (29, 29, 28, 255),  # outline
    "b": (227, 230, 255, 255),
    "c": (179, 185, 209, 255),
    "d": (255, 255, 255, 255),
    "e": (234, 234, 232, 255),
    "f": (206, 202, 201, 255),
    "g": (95, 95, 110, 255),
    "h": (171, 175, 185, 255),
    "i": (123, 131, 130, 255),
}

# fox.png, one character per pixel.
REST = [
    ".........a...a..",
    "........abaaaba.",
    "........acdddca.",
    "........aeedeea.",
    ".......affaeaffa",
    "...aaaaagbfefba.",
    "..addddddgbaba..",
    ".adeffffffggga..",
    "adgfhfffhffffa..",
    "adgfiiiihfccfa..",
    "adghghgaghggha..",
    ".aahgha.ahaaha..",
    "...afafa.afaafa.",
]

SQUEEZED_ROW = 8
BREATH_OUT = ["." * len(REST[0])] + REST[:SQUEEZED_ROW] + REST[SQUEEZED_ROW + 1 :]

# (tag, frames, duration of each frame in ms)
ANIMATIONS = [("idle", [REST, BREATH_OUT], 450)]


def main() -> None:
    frames = [(tag, frame, duration) for tag, tag_frames, duration in ANIMATIONS for frame in tag_frames]
    width = len(REST[0])
    height = len(REST)
    assert all(len(row) == width for _, frame, _ in frames for row in frame)
    assert all(len(frame) == height for _, frame, _ in frames)

    pixels = [
        [PALETTE[c] if c != "." else TRANSPARENT for _, frame, _ in frames for c in frame[y]] for y in range(height)
    ]
    write_png(OUTPUT_PNG, pixels)

    frame_tags = []
    index = 0
    for tag, tag_frames, _ in ANIMATIONS:
        frame_tags.append({"name": tag, "from": index, "to": index + len(tag_frames) - 1, "direction": "forward"})
        index += len(tag_frames)
    data = {
        "frames": [
            {"frame": {"x": i * width, "y": 0, "w": width, "h": height}, "duration": duration}
            for i, (_, _, duration) in enumerate(frames)
        ],
        "meta": {
            "image": OUTPUT_PNG.name,
            "size": {"w": width * len(frames), "h": height},
            "frameTags": frame_tags,
        },
    }
    OUTPUT_JSON.write_text(json.dumps(data, indent=2) + "\n")
    print(f"wrote {OUTPUT_PNG.relative_to(ROOT)} and {OUTPUT_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
