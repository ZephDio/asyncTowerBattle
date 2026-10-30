---
name: pixel-art-assets
description: Create or restyle game sprites (towers, barracks/houses, totems, units...) as pixel art matching the existing tower and house art, from a sketch or description. Covers style analysis, procedural PNG generation with a Python script, previewing next to references, and wiring the single front-view image into src/renderer/resources. Use when asked to draw, update, redesign or restyle a resource visual / asset / sprite.
---

# Pixel art assets

Sprites are PNGs in `public/resources/`, loaded by `src/renderer/resources/*.resources.ts`. There is no image
editor in the loop: art is drawn procedurally by a Python script, checked visually by reading a scaled preview
image, and iterated on.

## Tooling

- `python3` (stdlib only) is always available: generator scripts must use only the stdlib, writing PNGs with
  `zlib` + `struct`, so anyone can rerun them. See `scripts/generate-gobelin-portal.py` (`write_png`).
- Pillow is not installed globally. Use the skill's nix shell for analysis and previews:
  ```sh
  nix-shell .claude/skills/pixel-art-assets/shell.nix --run "python3 .claude/skills/pixel-art-assets/scripts/analyze.py public/resources/towers/blue.png"
  ```
  The first call can take a while to fetch from the binary cache; give it a long timeout.
- `scripts/analyze.py <png>...`: size, bbox, run-length histogram (pixel scale) and palette.
- `scripts/preview.py <out.png> <png>...`: composite side by side on a grass background, upscaled 3x
  nearest-neighbor. Write `<out.png>` to the scratchpad, then **Read it** to look at the result.
  Always include a reference sprite (e.g. `public/resources/towers/blue.png`) to compare style.

## House style (towers, houses)

- Native 1px pixel art, no upscaling, no anti-aliasing, roughly 10-15 colors per sprite.
- Outline `(22, 28, 46)` 1px around the silhouette and between distinct parts.
- Drop shadow: ellipse under the base in `(22, 28, 46, 80)`.
- Light from the top left: highlight on top/left edges of each block, shade on bottom/right edges.
- 3/4 top-down view, base sitting near the bottom of the canvas.
- Shared palette entries: teal `(90,185,187)` `(68,142,159)`, slate `(67,91,125)`, violet-dark `(72,63,97)`,
  wood `(180,131,85)` `(218,181,112)` `(134,99,83)`, mint `(143,226,185)`.
- Canvas: towers 128x256, houses 128x192, gobelin portal 128x160.
- Some older totems (anvil, windmill...) are painted/high-res and are **not** the reference style.

Run `analyze.py` on a reference before starting; don't trust this list blindly if the art has changed.

## Unit style (dragon)

Units are a different, chunkier style, matched on `public/resources/units/dragon.png`: a 16x16 front-facing
sprite upscaled 4x to 64x64 (`analyze.py` shows runs of 4), flat colors with one or two shades per part,
light from the top left, a near-black `(29, 29, 28)` outline around the silhouette, no ground shadow, and a
single image like every other piece. The voxel renderer is overkill at
that size: hand place the pixels as a character grid and let a script add the outline and upscale, see
`scripts/generate-ent.py`. Preview with `--scale 6` next to the dragon.

## One front view

Pieces cannot be rotated, so every piece ships a single image, the front view facing the camera, as
`<piece>.png` next to its folder (e.g. `public/resources/towers/blue.png`, `public/resources/totem/anvil.png`),
loaded with `createImage(...)` in its `*.resources.ts` entry. On the opponent board the same image is drawn rotated
by π with the piece's mirrored footprint, so don't draw a back view. Older pieces still keep their unused
`front-view.png`, `back-view.png`, `left-view.png` and `right-view.png` in a folder; new pieces don't need one.

Draw the image in the shape of the piece's footprint as written in its `GridShape`: a horizontal two-cell piece
(brewery) gets a wide canvas, a vertical one (witch house) a tall canvas.

The resource `size` is in grid units; keep `width / height` equal to the image aspect ratio
(e.g. 128x160 → `{ width: 5, height: 6.25 }`) so the art is not stretched. The hitbox lives in the blueprint
and is independent of the drawn size.

## Camera

The art is seen from above at roughly 45°, not straight on: top faces (plinth steps, tower floor, ring tops)
must be visible and lighter than the vertical faces. A flat front-on drawing looks wrong next to the towers.
The working oblique projection (x right, y away from camera, z up, all in pixels):
`screen_x = x + 64`, `screen_y = ORIGIN_Y - 0.7 * y - 0.75 * z`.

## Generator approach (what worked)

Write `scripts/generate-<asset>.py` in the repo, with tunable constants at the top (palette, sizes, shape
parameters) and a docstring explaining the outputs. The camera, ray casting, normals, outlines and PNG writing
live in the shared `scripts/voxel_sprite.py` (`VoxelGrid`, `render`, `Hit`, `outline`, `write_png`): a
generator only builds the voxel model and a `shade(hit)` function. Examples, about 2s each:
`scripts/generate-gobelin-portal.py` (stone ring on a plinth, emissive ether, block cracks) and
`scripts/generate-crops-field.py` (framed soil bed with wheat tufts, thin shapes, square footprint).

1. **Voxel model**: fill a `bytearray` 3D grid with small int labels (step, stone block id, ether...). Build
   shapes from simple math: boxes for plinths, polar segments for stone blocks (each block bulging out for a
   lumpy silhouette and thicker in its middle), a thin membrane for flat effects like the ether.
2. **Ray cast per pixel** through the oblique camera: march along depth in 0.25 steps until a voxel is hit,
   record label and depth. Rays reaching the ground inside the shadow ellipse get the shadow color.
3. **Shade the hit**: estimate a normal from the empty voxels in a 5x5x5 neighborhood (another block counts as
   partly empty, which bevels block edges), dot it with a top-left light, quantize into a 4-5 color ramp.
   Decorative patterns (paving joints, swirls) are computed in model coordinates so they stay attached to the model.
   Emissive parts (ether) ignore lighting: Bayer-dithered gradient plus precomputed curve cells.
4. **Screen-space pass**: outline where a neighbor is empty or much farther away, crack color between
   adjacent blocks at similar depth, dark front edge on top faces so steps read as ledges.
5. **View**: render only the front view (model turned 0° around z).

Pitfalls met so far:
- Anything laid out in strict rows collapses into vertical lines when seen along the rows. Scatter on a jittered grid, and group thin things (plants) into tufts with gaps so they don't merge into
  one flat mass.
- Thin shapes (1-2 voxel stems, ears) get noisy estimated normals: shade them from their empty neighbors
  instead (top/left empty → lit, right occupied → shade).
- The depth outline (`depth_gap`) on dense foliage paints everything dark; raise the gap for such sprites.

Then: run the generator, run `preview.py` with a reference sprite, Read the preview, adjust constants, repeat.
Finally update the `*.resources.ts` entry, `git rm` the replaced image, and run `pnpm typecheck`.
