#!/usr/bin/env python3
"""Generates the tag badge icons and their resource file.

Run from anywhere: python3 scripts/generate-tag-icons.py

Outputs:
- public/resources/hud/tags/<tag>.svg: one icon per tag, drawn in the tag's ink color.
- src/renderer/resources/tag.resources.ts: badge colors and icon image for every tag.

Shapes are described in a unit box going from -0.5 to 0.5 on both axes.
Cutout shapes are punched out of the icon (transparent), so the badge color shows through.
"""

from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ICONS_DIR = ROOT / "public" / "resources" / "hud" / "tags"
RESOURCES_FILE = ROOT / "src" / "renderer" / "resources" / "tag.resources.ts"
SCALE = 100
PIXEL_SIZE = 64


def n(value: float) -> str:
    return f"{round(value * SCALE, 3):g}"


def rect(x1: float, y1: float, x2: float, y2: float, radius: float = 0) -> str:
    rounded = f' rx="{n(radius)}"' if radius else ""
    return f'<rect x="{n(x1)}" y="{n(y1)}" width="{n(x2 - x1)}" height="{n(y2 - y1)}"{rounded}/>'


def circle(cx: float, cy: float, r: float) -> str:
    return f'<circle cx="{n(cx)}" cy="{n(cy)}" r="{n(r)}"/>'


def ellipse(cx: float, cy: float, rx: float, ry: float) -> str:
    return f'<ellipse cx="{n(cx)}" cy="{n(cy)}" rx="{n(rx)}" ry="{n(ry)}"/>'


def polygon(points: list[tuple[float, float]]) -> str:
    return f'<polygon points="{" ".join(f"{n(x)},{n(y)}" for x, y in points)}"/>'


def polyline(points: list[tuple[float, float]], width: float) -> str:
    coordinates = " ".join(f"{n(x)},{n(y)}" for x, y in points)
    return f'<polyline points="{coordinates}" fill="none" stroke="black" stroke-width="{n(width)}" stroke-linejoin="round"/>'


def merlons(x1: float, x2: float, y: float, count: int) -> list[str]:
    width = (x2 - x1) / (count * 2 - 1)
    return [rect(x1 + i * width * 2, y, x1 + i * width * 2 + width, y + 0.14) for i in range(count)]


def sparkle(cx: float, cy: float, r: float) -> str:
    inner = r * 0.22
    return polygon(
        [
            (cx, cy - r),
            (cx + inner, cy - inner),
            (cx + r, cy),
            (cx + inner, cy + inner),
            (cx, cy + r),
            (cx - inner, cy + inner),
            (cx - r, cy),
            (cx - inner, cy - inner),
        ]
    )


@dataclass
class Icon:
    shapes: list[str]
    cutouts: list[str] = field(default_factory=list)


# Buildings


def tower() -> Icon:
    return Icon(
        [
            *merlons(-0.36, 0.36, -0.5, 3),
            rect(-0.36, -0.37, 0.36, -0.18),
            rect(-0.2, -0.19, 0.2, 0.27),
            rect(-0.4, 0.26, 0.4, 0.5),
        ]
    )


def castle() -> Icon:
    gate = f'<path d="M {n(-0.11)} {n(0.32)} A {n(0.11)} {n(0.11)} 0 0 1 {n(0.11)} {n(0.32)} L {n(0.11)} {n(0.5)} L {n(-0.11)} {n(0.5)} Z"/>'
    return Icon(
        [
            # Side towers
            *merlons(-0.5, -0.22, -0.32, 2),
            rect(-0.5, -0.19, -0.22, 0.5),
            *merlons(0.22, 0.5, -0.32, 2),
            rect(0.22, -0.19, 0.5, 0.5),
            # Wall
            *merlons(-0.22, 0.22, -0.08, 3),
            rect(-0.23, 0.05, 0.23, 0.5),
            # Flag
            rect(-0.02, -0.5, 0.02, -0.08),
            polygon([(0.02, -0.5), (0.22, -0.42), (0.02, -0.34)]),
        ],
        [gate],
    )


def totem() -> Icon:
    return Icon(
        [
            # Head
            rect(-0.24, -0.5, 0.24, -0.1),
            # Wings
            polygon([(-0.24, -0.08), (-0.5, -0.24), (-0.42, 0.04), (-0.24, 0.08)]),
            polygon([(0.24, -0.08), (0.5, -0.24), (0.42, 0.04), (0.24, 0.08)]),
            # Pole
            rect(-0.17, -0.12, 0.17, 0.4),
            rect(-0.28, 0.38, 0.28, 0.5),
        ],
        [
            # Face
            rect(-0.15, -0.38, -0.05, -0.28),
            rect(0.05, -0.38, 0.15, -0.28),
            rect(-0.12, -0.21, 0.12, -0.16),
            rect(-0.17, 0.12, 0.17, 0.16),
        ],
    )


def barrack() -> Icon:
    return Icon(
        [
            # Flag
            rect(-0.02, -0.5, 0.02, -0.2),
            polygon([(0.02, -0.5), (0.24, -0.42), (0.02, -0.34)]),
            # Tent
            polygon([(0, -0.26), (0.5, 0.5), (-0.5, 0.5)]),
        ],
        [polygon([(0, 0.08), (0.16, 0.5), (-0.16, 0.5)])],
    )


def food() -> Icon:
    # Apple
    return Icon(
        [
            circle(-0.15, 0.14, 0.31),
            circle(0.15, 0.14, 0.31),
            rect(-0.03, -0.42, 0.04, -0.12, 0.02),
            polygon([(0.05, -0.28), (0.18, -0.46), (0.4, -0.44), (0.26, -0.27)]),
        ],
        [ellipse(-0.24, 0.02, 0.06, 0.12)],
    )


def tile() -> Icon:
    # Paving stones
    return Icon(
        [
            rect(-0.46, -0.46, -0.04, -0.04, 0.06),
            rect(0.04, -0.46, 0.46, -0.04, 0.06),
            rect(-0.46, 0.04, -0.04, 0.46, 0.06),
            rect(0.04, 0.04, 0.46, 0.46, 0.06),
        ]
    )


def trap() -> Icon:
    # Spikes
    return Icon(
        [
            polygon([(-0.48, 0.3), (-0.32, -0.26), (-0.16, 0.3)]),
            polygon([(-0.16, 0.3), (0, -0.48), (0.16, 0.3)]),
            polygon([(0.16, 0.3), (0.32, -0.26), (0.48, 0.3)]),
            rect(-0.5, 0.28, 0.5, 0.46, 0.04),
        ]
    )


# Species


def kinfolk() -> Icon:
    # Person
    shoulders = f'<path d="M {n(-0.42)} {n(0.5)} L {n(-0.42)} {n(0.24)} A {n(0.42)} {n(0.29)} 0 0 1 {n(0.42)} {n(0.24)} L {n(0.42)} {n(0.5)} Z"/>'
    return Icon([circle(0, -0.29, 0.2), shoulders])


def animal() -> Icon:
    # Paw
    return Icon(
        [
            ellipse(0, 0.22, 0.27, 0.23),
            ellipse(-0.37, -0.06, 0.11, 0.13),
            ellipse(-0.14, -0.3, 0.11, 0.14),
            ellipse(0.14, -0.3, 0.11, 0.14),
            ellipse(0.37, -0.06, 0.11, 0.13),
        ]
    )


def monster() -> Icon:
    # Horned head with fangs
    return Icon(
        [
            circle(0, 0.1, 0.38),
            polygon([(-0.32, -0.08), (-0.46, -0.5), (-0.08, -0.26)]),
            polygon([(0.32, -0.08), (0.46, -0.5), (0.08, -0.26)]),
        ],
        [
            polygon([(-0.26, -0.02), (-0.05, 0.06), (-0.22, 0.12)]),
            polygon([(0.26, -0.02), (0.05, 0.06), (0.22, 0.12)]),
            polygon(
                [
                    (-0.2, 0.24),
                    (0.2, 0.24),
                    (0.15, 0.36),
                    (0.08, 0.29),
                    (0, 0.38),
                    (-0.08, 0.29),
                    (-0.15, 0.36),
                ]
            ),
        ],
    )


# Biomes


def forest() -> Icon:
    # Pine tree
    return Icon(
        [
            polygon([(0, -0.5), (0.25, -0.18), (-0.25, -0.18)]),
            polygon([(0, -0.34), (0.36, 0.06), (-0.36, 0.06)]),
            polygon([(0, -0.12), (0.46, 0.32), (-0.46, 0.32)]),
            rect(-0.08, 0.3, 0.08, 0.5),
        ]
    )


def mountain() -> Icon:
    # Two peaks, the front one with a snow line
    return Icon(
        [
            polygon([(-0.02, 0.42), (0.26, -0.1), (0.5, 0.42)]),
            polygon([(-0.5, 0.42), (-0.1, -0.42), (0.3, 0.42)]),
        ],
        [polyline([(-0.28, -0.08), (-0.18, -0.16), (-0.1, -0.06), (-0.01, -0.16), (0.08, -0.06)], 0.06)],
    )


def sky() -> Icon:
    # Cloud
    return Icon(
        [
            circle(-0.24, 0.1, 0.22),
            circle(0.06, -0.04, 0.3),
            circle(0.3, 0.14, 0.18),
            rect(-0.24, 0.02, 0.3, 0.32),
        ]
    )


# Alignments


def evil() -> Icon:
    # Skull
    return Icon(
        [
            circle(0, -0.1, 0.38),
            rect(-0.22, 0.1, 0.22, 0.46, 0.06),
        ],
        [
            circle(-0.15, -0.06, 0.11),
            circle(0.15, -0.06, 0.11),
            polygon([(0, 0.08), (0.06, 0.2), (-0.06, 0.2)]),
            rect(-0.085, 0.32, -0.045, 0.47),
            rect(0.045, 0.32, 0.085, 0.47),
        ],
    )


def magic() -> Icon:
    # Sparkles
    return Icon([sparkle(-0.06, 0.06, 0.44), sparkle(0.32, -0.32, 0.17)])


@dataclass
class TagStyle:
    icon: Icon
    fill: str
    ink: str


TAGS: dict[str, TagStyle] = {
    # Buildings
    "Tower": TagStyle(tower(), "#A5D8FF", "#1971C2"),
    "Barrack": TagStyle(barrack(), "#B2F2BB", "#2B8A3E"),
    "Totem": TagStyle(totem(), "#FFD8A8", "#D9480F"),
    "Castle": TagStyle(castle(), "#D0BFFF", "#5F3DC4"),
    "Food": TagStyle(food(), "#FFE3E3", "#E03131"),
    "Tile": TagStyle(tile(), "#E9ECEF", "#495057"),
    "Trap": TagStyle(trap(), "#CED4DA", "#212529"),
    # Species
    "Kinfolk": TagStyle(kinfolk(), "#FFEC99", "#E67700"),
    "Animal": TagStyle(animal(), "#FCC2D7", "#C2255C"),
    "Monster": TagStyle(monster(), "#96F2D7", "#087F5B"),
    # Biomes
    "Forest": TagStyle(forest(), "#D8F5A2", "#5C940D"),
    "Mountain": TagStyle(mountain(), "#BAC8FF", "#364FC7"),
    "Sky": TagStyle(sky(), "#99E9F2", "#0C8599"),
    # Alignments
    "Evil": TagStyle(evil(), "#343A40", "#FF8787"),
    "Magic": TagStyle(magic(), "#EEBEFA", "#9C36B5"),
}


def to_svg(icon: Icon, ink: str) -> str:
    half = SCALE // 2
    view_box = f'viewBox="{-half} {-half} {SCALE} {SCALE}" width="{PIXEL_SIZE}" height="{PIXEL_SIZE}"'
    lines = [f'<svg xmlns="http://www.w3.org/2000/svg" {view_box}>']
    if icon.cutouts:
        lines += [
            '  <mask id="cutout">',
            f'    <rect x="{-half}" y="{-half}" width="{SCALE}" height="{SCALE}" fill="white"/>',
            '    <g fill="black">',
            *(f"      {cutout}" for cutout in icon.cutouts),
            "    </g>",
            "  </mask>",
        ]
    mask = ' mask="url(#cutout)"' if icon.cutouts else ""
    lines += [f'  <g fill="{ink}"{mask}>', *(f"    {shape}" for shape in icon.shapes), "  </g>", "</svg>", ""]
    return "\n".join(lines)


def to_resources() -> str:
    lines = [
        "// Generated by scripts/generate-tag-icons.py, do not edit by hand.",
        'import { createImage } from "../../shared/image";',
        'import { Tag } from "../../shared/traits/engine/tags/tagged";',
        "",
        "export type TagResource = {",
        "\tfill: string;",
        "\tink: string;",
        "\timage: HTMLImageElement;",
        "};",
        "",
        "export const TagResources: Record<Tag, TagResource> = {",
    ]
    for tag, style in TAGS.items():
        lines += [
            f"\t{tag}: {{",
            f'\t\tfill: "{style.fill}",',
            f'\t\tink: "{style.ink}",',
            f'\t\timage: createImage("/resources/hud/tags/{tag.lower()}.svg"),',
            "\t},",
        ]
    lines += ["};", ""]
    return "\n".join(lines)


def main() -> None:
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    for tag, style in TAGS.items():
        (ICONS_DIR / f"{tag.lower()}.svg").write_text(to_svg(style.icon, style.ink))
    RESOURCES_FILE.write_text(to_resources())
    print(f"wrote {len(TAGS)} icons to {ICONS_DIR.relative_to(ROOT)} and {RESOURCES_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
