#!/usr/bin/env python3
"""Extract rare.png's blue border and align it to the unchanged common.png."""
import hashlib
import json
from PIL import Image
from extract_uncommon import ROOT, extract, align


def main():
    base_path = ROOT / 'common.png'
    source_path = ROOT / 'rare.png'
    output = ROOT / 'overlays/rare-extracted.png'
    if output.exists():
        raise SystemExit(f'{output} already exists')
    with Image.open(base_path) as image:
        base = image.convert('RGBA')
    with Image.open(source_path) as image:
        source = image.convert('RGBA')
    decoration = extract(source, color='blue')
    # Measured rare-reference landmarks normalized to a 945px-tall canvas.
    # Bottom leaves meet the source roll at ~1390/1606; preserve those leaves
    # while moving each endpoint just above the target's asymmetric roll.
    overlay = align(decoration, source, base, source_top=31, source_ends=(820, 820))
    output.parent.mkdir(parents=True, exist_ok=True)
    overlay.save(output)
    report = {
        'source': source_path.name, 'source_size': source.size,
        'base': base_path.name, 'base_size': base.size,
        'overlay_size': overlay.size,
        'base_sha256': hashlib.sha256(base_path.read_bytes()).hexdigest(),
        'source_sha256': hashlib.sha256(source_path.read_bytes()).hexdigest(),
        'method': 'blue chroma extraction; independent contour and roll alignment of decoration only',
    }
    output.with_suffix('.json').write_text(json.dumps(report, indent=2)+'\n')
    print(report)


if __name__ == '__main__':
    main()
