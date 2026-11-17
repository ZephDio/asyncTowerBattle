"""Writes a unit's sprite sheet: a horizontal strip PNG and its TexturePacker / Aseprite "array" JSON.

The JSON lists each frame's rectangle and duration in milliseconds, and meta.frameTags names the animations by
frame range. src/shared/sprite-sheet.ts reads it. In battle the frame durations are replaced by the unit's
idleFrameDuration (src/shared/traits/render/idle-animation.ts).

Frames come in two forms:
- character grids, one character per sprite pixel, "." for transparent (write_sheet). Each sprite pixel is drawn as
  a scale x scale block at offset inside a canvas, so a sheet frame can match an existing upscaled image exactly.
- RGBA rows (write_strip), for units too big or too smooth for a grid: read_png reads the still image, and
  drop_band or squash build the bob frame from its pixels.
"""

import json
import struct
import zlib
from pathlib import Path

from voxel_sprite import TRANSPARENT, Color, write_png

Frame = list[str]
Pixels = list[list[Color]]


def breath_out(frame: Frame, squeezed_row: int) -> Frame:
    """The idle bob: every row above squeezed_row drops 1px and squeezed_row disappears, the rows below stay planted."""
    return ["." * len(frame[0])] + frame[:squeezed_row] + frame[squeezed_row + 1 :]


def outline(frame: Frame, ink: str) -> Frame:
    """Draws ink on every transparent pixel next to the sprite (4-neighborhood): the 1 sprite pixel unit outline."""
    height, width = len(frame), len(frame[0])

    def touches_sprite(x: int, y: int) -> bool:
        neighbors = [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
        return any(0 <= nx < width and 0 <= ny < height and frame[ny][nx] != "." for nx, ny in neighbors)

    return [
        "".join(ink if c == "." and touches_sprite(x, y) else c for x, c in enumerate(row))
        for y, row in enumerate(frame)
    ]


def to_pixels(
    frame: Frame,
    palette: dict[str, Color],
    scale: int = 1,
    canvas: tuple[int, int] | None = None,
    offset: tuple[int, int] = (0, 0),
) -> Pixels:
    """Draws a character grid as RGBA rows, each sprite pixel a scale x scale block at offset inside the canvas."""
    rows, columns = len(frame), len(frame[0])
    assert all(len(row) == columns for row in frame)
    width, height = canvas or (columns * scale, rows * scale)
    ox, oy = offset

    def pixel(x: int, y: int) -> Color:
        sx, sy = (x - ox) // scale, (y - oy) // scale
        if x < ox or y < oy or sx >= columns or sy >= rows or frame[sy][sx] == ".":
            return TRANSPARENT
        return palette[frame[sy][sx]]

    return [[pixel(x, y) for x in range(width)] for y in range(height)]


def write_sheet(
    png: Path,
    animations: list[tuple[str, list[Frame], int]],
    palette: dict[str, Color],
    scale: int = 1,
    canvas: tuple[int, int] | None = None,
    offset: tuple[int, int] = (0, 0),
) -> None:
    """Writes png and the JSON next to it (same name, .json). animations is a list of (tag, frames, ms per frame)."""
    write_strip(
        png,
        [
            (tag, [to_pixels(frame, palette, scale, canvas, offset) for frame in frames], duration)
            for tag, frames, duration in animations
        ],
    )


def write_strip(png: Path, animations: list[tuple[str, list[Pixels], int]]) -> None:
    """Like write_sheet, with frames already as RGBA rows, all of the same size."""
    frames = [(frame, duration) for _, tag_frames, duration in animations for frame in tag_frames]
    height = len(frames[0][0])
    width = len(frames[0][0][0])
    assert all(len(frame) == height and all(len(row) == width for row in frame) for frame, _ in frames)

    write_png(png, [[pixel for frame, _ in frames for pixel in frame[y]] for y in range(height)])

    frame_tags = []
    index = 0
    for tag, tag_frames, _ in animations:
        frame_tags.append({"name": tag, "from": index, "to": index + len(tag_frames) - 1, "direction": "forward"})
        index += len(tag_frames)
    data = {
        "frames": [
            {"frame": {"x": i * width, "y": 0, "w": width, "h": height}, "duration": duration}
            for i, (_, duration) in enumerate(frames)
        ],
        "meta": {"image": png.name, "size": {"w": width * len(frames), "h": height}, "frameTags": frame_tags},
    }
    png.with_suffix(".json").write_text(json.dumps(data, indent=2) + "\n")


def opaque_rows(pixels: Pixels) -> tuple[int, int]:
    """The first and one past the last row holding an opaque pixel."""
    rows = [y for y, row in enumerate(pixels) if any(pixel[3] for pixel in row)]
    return rows[0], rows[-1] + 1


def drop_band(pixels: Pixels, band_top: int, n: int) -> Pixels:
    """The bob in image space: rows band_top to band_top + n disappear, the rows above drop by n, the rows below stay."""
    width = len(pixels[0])
    return [[TRANSPARENT] * width for _ in range(n)] + pixels[:band_top] + pixels[band_top + n :]


def squash(pixels: Pixels, y_feet: int, n: int) -> Pixels:
    """The bob for smooth art: the rows above y_feet are squashed by n rows (nearest neighbor), anchored at y_feet."""
    width = len(pixels[0])
    top, _ = opaque_rows(pixels)
    source = y_feet - top
    target = source - n
    squashed = [pixels[top + (i * source) // target] for i in range(target)]
    return [[TRANSPARENT] * width for _ in range(top + n)] + squashed + pixels[y_feet:]


def read_png(path: Path) -> Pixels:
    """Reads an 8-bit RGBA or RGB PNG, or a 1, 2, 4 or 8-bit palette PNG (alpha from tRNS), as rows of RGBA tuples."""
    data = path.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", f"{path} is not a PNG"
    chunks: dict[bytes, bytes] = {}
    position = 8
    while position < len(data):
        (length,) = struct.unpack(">I", data[position : position + 4])
        kind = data[position + 4 : position + 8]
        chunks[kind] = chunks.get(kind, b"") + data[position + 8 : position + 8 + length]
        position += 12 + length
    width, height, depth, color_type, _, _, interlace = struct.unpack(">IIBBBBB", chunks[b"IHDR"])
    assert interlace == 0, "interlaced PNGs are not supported"
    channels = {6: 4, 2: 3, 3: 1}[color_type]
    assert depth == 8 or color_type == 3, "only palette PNGs may have a bit depth under 8"

    bits_per_pixel = channels * depth
    stride = (width * bits_per_pixel + 7) // 8
    bpp = max(1, bits_per_pixel // 8)  # the byte distance the filters look back
    raw = zlib.decompress(chunks[b"IDAT"])
    rows: list[bytearray] = []
    previous = bytearray(stride)
    for y in range(height):
        start = y * (stride + 1)
        kind = raw[start]
        row = bytearray(raw[start + 1 : start + 1 + stride])
        for i in range(stride):
            left = row[i - bpp] if i >= bpp else 0
            up = previous[i]
            up_left = previous[i - bpp] if i >= bpp else 0
            if kind == 1:
                row[i] = (row[i] + left) & 0xFF
            elif kind == 2:
                row[i] = (row[i] + up) & 0xFF
            elif kind == 3:
                row[i] = (row[i] + (left + up) // 2) & 0xFF
            elif kind == 4:
                estimate = left + up - up_left
                pa, pb, pc = abs(estimate - left), abs(estimate - up), abs(estimate - up_left)
                predictor = left if pa <= pb and pa <= pc else up if pb <= pc else up_left
                row[i] = (row[i] + predictor) & 0xFF
        rows.append(row)
        previous = row

    if color_type == 6:
        return [[tuple(row[x * 4 : x * 4 + 4]) for x in range(width)] for row in rows]  # type: ignore[misc]
    if color_type == 2:
        return [[(row[x * 3], row[x * 3 + 1], row[x * 3 + 2], 255) for x in range(width)] for row in rows]

    plte = chunks[b"PLTE"]
    alphas = chunks.get(b"tRNS", b"")
    palette = [
        (plte[i * 3], plte[i * 3 + 1], plte[i * 3 + 2], alphas[i] if i < len(alphas) else 255)
        for i in range(len(plte) // 3)
    ]
    per_byte = 8 // depth
    mask = (1 << depth) - 1

    def index(row: bytearray, x: int) -> int:
        shift = 8 - depth * (x % per_byte + 1)
        return (row[x // per_byte] >> shift) & mask

    return [[palette[index(row, x)] for x in range(width)] for row in rows]
