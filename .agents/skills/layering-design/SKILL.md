---
name: layering-design
description: Extract or create rarity decorations as transparent overlays and deliver final PNGs composited over the unchanged common image. Use for parchment descriptor sheets, rarity borders, vines, and layered game assets, preserving the foreground scroll footer.
compatibility: Python 3 with Pillow; optional librsvg for SVG artwork. A Nix shell is bundled.
---

# Rarity overlays

Paths in this file are relative to this skill directory unless explicitly described as repository-relative. This skill is self-contained; do not depend on an external image-generation workspace.

## Assets in this repository

- Game-ready PNGs (repository-relative): `client/public/resources/hud/banner-descriptor/{common,uncommon,rare,epic,legendary}.png`. Keep these names: the resource loader already uses them.
- Immutable common/base for the approved extraction: `assets/common.png` (576 × 945).
- Original flattened extraction references: `assets/{uncommon,rare,epic,legendary}.png`. These are NOT ready-to-use game images; they have different parchment geometry and dimensions.
- Approved reusable transparent overlays: `assets/overlays/{uncommon,rare,epic,legendary}.png`. These include footer occlusion in their alpha and can be directly composited over the common base.
- Supporting foreground geometry: `assets/footer/common-paper-mask.png` and `scripts/fix_footer_overlap.py`. The trace is specific to the bundled common image and protected by its SHA-256 hash. `assets/footer/extraction-history.json` records the original historical workflow; old versioned filenames in that history are not required inputs.

## Non-negotiable constraints

1. Common is the original image with no added border. Never repaint, regenerate, resize, warp, recolor, sharpen, or overwrite the base while creating decorations.
2. Read base width/height programmatically. Allocate the transparent overlay at EXACTLY those dimensions, including SVG width/height/viewBox where applicable. Do not crop to decoration bounds or resize the entire overlay during final composition. Composite at (0, 0), original size.
3. Matching dimensions alone does not guarantee a fitting design. Follow the actual left/right paper contours independently; do not assume symmetry or fix contour errors by blindly moving/scaling the whole decoration.
4. Treat the footer as FOREGROUND. Lower stems must emerge from behind its curved top edge, with no visible gap or exposed terminal tip. Extend artwork underneath the footer, then occlude it using a precisely traced foreground mask. Preserve the original footer pixels and outline. The outer silhouette alone cannot enforce this stacking.
5. Generate/draw/extract only decoration. The paper texture, silhouette, shading, folds, and rolled ends come exclusively from the base. Keep the center fully transparent; no full-image tint or replacement paper.
6. When asked to extract a border, preserve the actual reference artwork, not a procedural redraw. Isolate decoration with color/alpha masks; never subtract two regenerated sheets or transplant rectangular paper patches. Transfer only isolated decoration to base coordinates and smooth raster alignment noise. Remove stray fragments from reference paper/curl outlines.
7. The primary deliverable is a final PNG containing the original base plus decorations already composited, with transparency outside the scroll. Keep the overlay as a secondary reusable asset. PNG does not preserve editable layers.
8. Do not invent higher-rarity themes. Use the requested reference: uncommon green vines; rare blue leaves/berries/diamonds; epic purple/gold; legendary red/gold.
9. Save intermediate work outside the delivered game assets. Never silently overwrite inputs or existing outputs. Version staging outputs; only replace the canonical game PNG when explicitly requested or approved. Do not overwrite the bundled extraction references with flattened final images.

## Tools

Use Nix-managed dependencies, not global installs or pip. From the repository root:

```sh
nix-shell .agents/skills/layering-design/shell.nix --run 'python3 .agents/skills/layering-design/scripts/composite.py --help'
```

The shell provides Python/Pillow and `rsvg-convert`. Add missing tooling to `shell.nix` or the project's devenv configuration. A compositing script does not generate finished artwork. If drawing new art without an image-generation tool, explain the procedural/vector approach and get agreement.

## Existing approved overlays: compose without re-extraction

From the repository root, with the bundled tools available:

```sh
python3 .agents/skills/layering-design/scripts/composite.py \
  --base client/public/resources/hud/banner-descriptor/common.png \
  --overlay .agents/skills/layering-design/assets/overlays/legendary.png \
  --output /tmp/legendary-final.png
```

The compositor rejects mismatched dimensions, missing transparency, empty overlays, marks outside the base silhouette, and overwriting inputs/existing outputs. It verifies unchanged pixels wherever the overlay is transparent. It does not judge contour fit or remove paper contamination: inspect the result yourself.

## Rebuild all four approved designs from original references

Run this only when re-extraction is necessary. Choose a NEW staging directory:

```sh
nix-shell .agents/skills/layering-design/shell.nix --run \
  'python3 .agents/skills/layering-design/scripts/fix_footer_overlap.py --destination /tmp/rarity-rebuild'
```

This extracts the four references in memory, aligns each side, applies the approved legendary raised/outer placement, extends lower tails beneath the footer, and applies foreground occlusion. It creates `overlays/<rarity>.png`, `output/<rarity>.png`, and `footer-validation.json` inside the destination. It checks both contacts with the footer and verifies that foreground-footer pixels remain identical to the base. It refuses existing delivery files.

`extract_uncommon.py`, `extract_rare.py`, `extract_epic.py`, and `extract_legendary.py` supply extraction functions and landmark alignment. Their standalone entrypoints produce pre-footer intermediate layers, NOT final approved overlays. Prefer the full footer pipeline. For a different base/reference, inspect and adjust segmentation and landmarks; re-trace the footer instead of disabling its hash guard.

## Validation and delivery

1. Inspect the current base/reference files before assuming an earlier image is still current. Check dimensions, real transparency (not a painted checkerboard), and intended safe decoration regions.
2. Open the overlay and actual final PNG. Inspect top curls, side margins, diamonds, and both lower joins at full resolution. Ensure no transplanted paper, stray reference outlines, lost gold edging, footer gaps, or artwork painted on the foreground roll.
3. Confirm base, overlay, and output dimensions match; center remains fully transparent; original inputs are unchanged; undecorated output pixels and foreground footer pixels match the base.
4. Test the compositor from repository root:

   ```sh
   nix-shell .agents/skills/layering-design/shell.nix --run \
     'python3 -m unittest discover -s .agents/skills/layering-design/tests -v'
   ```

5. Deliver the composed PNG first and the overlay second. When replacing game assets, install the final PNGs under `client/public/resources/hud/banner-descriptor/` with the existing rarity names. Keep only approved overlays in `assets/overlays/`, and keep supporting metadata separate. State what was actually validated; do not claim an in-game visual check unless performed.
