---
name: pixel-art-assets
description: Create or restyle game sprites (towers, barracks/houses, totems, units...) as pixel art matching the existing tower and house art, from a sketch or description. Covers style analysis, procedural PNG generation with a Python script, previewing next to references, and wiring the single front-view image into client/src/renderer/resources. Use when asked to draw, update, redesign or restyle a resource visual / asset / sprite.
---

# Pixel art assets

Sprites are PNGs in `client/public/resources/`, loaded by `client/src/renderer/resources/*.resources.ts`. There is no image
editor in the loop: art is drawn procedurally by a Python script, checked visually by reading a scaled preview
image, and iterated on.

## Tooling

- `python3` (stdlib only) is always available: generator scripts must use only the stdlib, writing PNGs with
  `zlib` + `struct`, so anyone can rerun them. See `client/scripts/generate-gobelin-portal.py` (`write_png`).
- Pillow is not installed globally. Use the skill's nix shell for analysis and previews:
  ```sh
  nix-shell .agents/skills/pixel-art-assets/shell.nix --run "python3 .agents/skills/pixel-art-assets/scripts/analyze.py client/public/resources/towers/blue.png"
  ```
  The first call can take a while to fetch from the binary cache; give it a long timeout.
- `scripts/analyze.py <png>...`: size, bbox, run-length histogram (pixel scale) and palette.
- `scripts/style_check.py <png>...`: off-palette colors, outline thickness, silhouette edge colors and the
  most common color adjacencies, compared with the house style below.
- `scripts/preview.py <out.png> <png>...`: composite side by side on a grass background, upscaled 3x
  nearest-neighbor. Write `<out.png>` to the scratchpad, then **Read it** to look at the result.
  Always include a reference sprite (e.g. `client/public/resources/towers/blue.png`) to compare style.

## House style (towers, houses)

The references are `client/public/resources/towers/blue.png` (stone tower on a wooden palisade) and
`client/public/resources/house/blue.png` (thatched cottage). Both were measured with `analyze.py` and
`scripts/style_check.py`; the numbers below come from them.

### Pixels

- Native 1px pixel art at 1x: no upscaling, no anti-aliasing, no gradients. Every opaque pixel is one of the
  palette entries below. 12 colors on the tower, 16 on the house, transparent and shadow included.
- The only semi-transparent color is the shadow. Everything else is alpha 255.
- No orphan pixels: color areas are clusters of at least 2x2 pixels. The exceptions are texture strokes,
  1px wide and 3-10px long, and plank seams.
- The common horizontal run length is 2-3px: shapes are chunky, with no 1px checkerboards and no dithering
  inside the sprite. The shadow edge is the only place with a broken, stair-stepped edge.

### Outline

- Ink `(22, 28, 46)`, the darkest color, used as the outline. Nothing else is that dark.
- The silhouette outline is **2px thick**: in both references, runs of 2 are the most common outline run, and
  every opaque pixel touching transparency is ink. A 1px outline looks thin next to them.
  Where a silhouette steps diagonally, the outline is 2-3px wide on the steps.
- Separations between parts are also ink, 2px where the parts are far apart in depth (rampart rim over
  the trunk, roof eave over the wall, door arch) and 1px between touching parts (a merlon and its wall,
  palisade planks).
- Ink also draws small interior lines: horizontal plank seams as 1px dashes 3-8px long, the split between
  door leaves, and the window mullions.

### Ramps (dark → light)

Each material uses one ramp. Neighboring pixels go up or down one step at a time: the most common
adjacencies in the references are always two consecutive steps of the same ramp. A material switch
always has ink between the two materials.

| Material | Ramp |
| --- | --- |
| Stone | violet `(72,63,97)` → slate `(67,91,125)` → teal-dark `(68,142,159)` → teal `(90,185,187)` → mint `(143,226,185)` |
| Wood | brown-dark `(90,70,70)` → brown `(134,99,83)` → wood `(180,131,85)` → wood-light `(218,181,112)` |
| Thatch | mauve-dark `(94,71,78)` → mauve `(138,103,99)` → straw-shade `(175,140,121)` → straw `(227,193,140)` → cream `(245,239,169)` |
| Glass / door | slate `(67,91,125)` → teal-dark → teal (the stone ramp, with vertical streaks) |

A new material, such as red brick, iron or leaves, gets its own ramp of 4-5 steps. The steps rise in
value and shift hue toward warm or yellow as they get lighter, and the darkest step leans toward
violet/blue so it sits well next to the ink. Reuse the existing ramps first: wood and stone are shared by
every piece.

When the user gives a photo or a colored sketch for a material, derive its ramp from the reference, keeping the
dark end leaning violet: the Bosquet's owl statue got a sandstone ramp from the user's photo
`(76,64,74)` → `(114,100,100)` → `(156,142,130)` → `(196,184,162)` → `(228,220,194)`, and its boulder a grey granite
`(58,54,72)` → `(88,86,102)` → `(124,122,134)` → `(164,162,166)` → `(204,202,194)` (see `generate-bosquet.py`).

### Light and form

Each face gets a flat base step from its orientation, then texture. Faces have no smooth shading.

- **Top faces** (merlon tops, floor, thatch ridge) take the lightest step: mint on stone, wood-light on the
  floor, cream down the roof ridge.
- **Front faces in light** take the middle-high step: teal on stone, wood or straw.
- **Faces in shade** take a low step, with the next lower step for texture: the inner side of the rampart
  is slate with violet mortar, and the walls under the roof are slate with teal-dark.
- **Cylinders and cones** darken by one step over the outer 6-12px on *both* sides. The tower trunk and the
  rampart ring are teal in the middle and teal-dark at the edges, and the roof is cream in the middle,
  straw-shade on the sides and mauve at the edges. Light still comes from the top left: the left side keeps
  slightly more light than the right.
- **Contact shadow**: right under an overhang (rampart over trunk, eave over wall), the surface drops one or
  two steps for 8-15px: the trunk under the rampart is slate and violet instead of teal.

### Texture

- **Masonry**: bricks are 6-10px wide and 4-5px tall in staggered rows. The mortar is a 1px line in the next
  lower step of the same ramp (teal-dark on teal, violet on slate, teal on mint), never ink. Mortar lines are
  ragged, with 1px jogs, and some bricks are cut by a short crack. On a cylinder, the brick rows follow the
  curve of the ellipse and the bricks get narrower toward the edges.
- **Planks**: 4-6px wide. They are vertical on the palisade, the door frame and the walls, and horizontal on
  floors and beams. Wood grain is 1px streaks of the next lower or higher step, 3-10px long, along the
  plank. Floor seams are ink dashes. Plank ends at the bottom are ragged: 1-2px notches in the outline.
- **Thatch**: strands are vertical 1px streaks, 4-12px long, mixed from the steps next to the area's base
  step. The silhouette is jagged, with a spike or notch every 3-5px, and the eave hangs in uneven tufts
  2-6px deep. Clumps of mauve "V" shapes down the ridge show the layered bundles.
- **Arches and openings**: a thick 2px ink frame, a wood-colored arch with a lit top edge (wood-light) and a
  shaded inner edge (brown), and a recessed interior in the stone ramp.

### Shadow

- One flat color `(22, 28, 46, 80)` on the ground, drawn only on transparent pixels, never over the sprite.
  It is the only semi-transparent color.
- It fits the **global shape of the construct seen from above**, not a fixed ellipse: the round tower base
  casts a rounded shadow (113x53px), the square cottage a near-rectangle whose bottom rows keep a constant
  width (103x35px). The anvil casts its own top-down outline: a flat band under the pedestal and body that
  tapers to points under the horn tips. Thin add-ons up in the air (hammers, gears, flags) don't count.
  The shadow follows the outline of the piece, notches and protrusions included (a stair sticking out of a
  platform gets its own rim, and the corners beside it stay empty): never fill the footprint's bounding box.
- The shadow is cast by a **light from above**: it rims the piece **evenly on the left and the right** and
  drops 1-3px further toward the camera (the bottom of the image). Don't shift it sideways: the top-left light
  only drives the shading of the faces, not the shadow. A box shadow shifted to the right leaves the left side
  bare, which the user rejected on the obelisk.
- It scales with the **height** of the piece: it pokes out about 10-15px past the footprint for a tall tower,
  5-10px for a house, and almost nothing for a flat piece. The crops field or a lawn yard lying on the ground
  have close to no shadow, at most a 1-2px rim.
- The edge is stair-stepped and slightly ragged with 1-3px jitter, not a clean curve or line.
- In the voxel renderer, pass `shadow_shape(x, y)` to `render` for anything that isn't round: it returns a
  normalized distance on the model ground, 1 or less inside. The simplest way to fit the construct is to
  derive it from the model: collect the (x, y) columns holding the main body labels, grow them by a margin
  with a diamond (L1) distance so pointed parts stay pointed, and offset them toward the camera. See
  `footprint_shadow` in `generate-anvil.py`. For a piece made of boxes, take the min over the boxes of the
  distance outside each box, divided by the margin: see `footprint_shadow` in `generate-obelisk.py`. Keep `shadow_radii` for round bases, and make them small enough
  to stay hidden under the base when the piece should have no shadow.

What worked, piece by piece:

| Piece | Shadow | How |
| --- | --- | --- |
| Anvil (tall, horns) | flat band tapering to points under the horns | `footprint_shadow`: iron and stone columns, margin 3 with an L1 distance, offset `(2, -5)` |
| Crops field (low box) | thin square rim, 1-3px on the right and bottom | `square_shadow`: `max(abs(x - ox), abs(y - oy)) / (HALF_SIZE + 2)`, offset `(1, -2)` |
| Obelisk (raised platform with a stair) | even 2-3px rim on the left, right and bottom, around the stair too | `footprint_shadow`: min over the platform and stair boxes of the distance outside them, margin 3, offset `(0, -2)`, jitter 0.3 |
| Witch house (lawn yard) | none | the yard is already ground, `shadow_radii=(1, 1)` hides it under the base |
| Bosquet (grove with a pond) | blobs under each canopy, the bush, the owl and the boulder; none under the flat pond | `ground_shadow`: min over round blobs, canopies dropped `-3` toward the camera |

Pitfalls:
- A round margin (Euclidean distance) around a pointed footprint turns it into a capsule: the user asked for
  the horn points, so grow with an L1 (diamond) distance and a small margin.
- `shadow_jitter` is relative to the normalized distance, so its size in voxels is jitter × the shadow half
  size. 0.15 is fine for a small round radius but gives an 8 voxel fringe on a 52 voxel square: scale it down
  (0.04 there) so the edge stays a 1-2 voxel stair step. With a footprint distance in units of the margin,
  0.2 is about one voxel.
- `shadow_radii` is ignored when `shadow_shape` is passed; set it to `(1, 1)` and say so in a comment.
- The shadow offset is toward -y in model coordinates (toward the camera), with x left at 0. The anvil and
  crops field shadows predate this rule and still lean right.
- A big shadow sets the canvas size. After shrinking or removing one, re-crop the canvas to the art (see
  Cropping below) or the piece looks small on its tile.
- Keep the replaced image as `<piece>.old.png` next to the new one when the user asks to compare.

### Composition

- 3/4 top-down view, light from the top left, base sitting about 20px above the bottom of the canvas,
  centered horizontally.
- Proportions are toy-like: the top part is wider than what holds it up. The tower rampart (about 108px)
  is about 1.4x the trunk (about 76px) and overhangs it. The thatch roof takes about 70% of the house's
  height and overhangs the walls by about 10px on each side.
- The silhouette is readable at small size: one big shape, a few protrusions (merlons, roof tufts) and one
  focal detail in the lower middle (door or window).
- A scene of several objects on one cell (the Bosquet: trees, a pond, a bush, a statue) puts the tall things at
  the back and the low details (water, rocks, a statue) in a front strip. Pushing the trees back (and their trunks
  a little taller) frees room in front: the oblique camera draws far objects higher on the image.
- Canvas: towers 128x256, houses 128x192, gobelin portal 128x160.
- Some older totems (bakery...) are painted/high-res and are **not** the reference style.

Run `analyze.py` and `style_check.py` on a reference before starting; don't trust this section blindly if
the art has changed. Run `style_check.py` on every new sprite too: off-palette colors, a run length of 1
as the most common outline run, or non-ink silhouette edges mean the sprite drifted from the style.

Carrying these rules into the voxel renderer:
- `outline(sprite, crack, depth_gap, width=2, depth_width=2)` draws the 2px silhouette by growing it 1px outward,
  and outlines both sides of a depth edge. Pass `depth_width=1` when thin parts (posts, stems, 1-2px rods)
  stand in front of a wall, or they become solid ink bars (see `generate-brewery.py`). `crack` seams stay 1px.
- In `shade`, quantize to a material's ramp by face orientation (top, front, side, under an overhang) and
  not only by the light dot product. Then add mortar, grain or strands in model coordinates, one step
  lower or higher.
- Apply the cylinder edge darkening and the contact shadow as explicit step offsets.

## From a user sketch

When the user sketches a building or a scene, read the sketch for its **layout, proportions and colors** (what
stands where, which part is bigger or lighter, the materials) and build the voxel model directly from that. Don't
trace the sketch into pixels first: the Bosquet's traced raster looked like the drawing but the user found its 3D
"mediocre", and the voxel model reused none of its pixels. Tracing first only helps for 16x16 icons (see the unit
style and the buff icons).

Mapping the sketch to the model is done by eye: left and right on the drawing is x, and higher on the drawing is
either further back (y) or taller (z). Expect a few rounds of moving things after each preview. The user's
paint-overs on a preview (a blob where a rock goes, water extended to the back, a reference photo pasted over a
part) are the clearest instructions: follow them literally.

How a voxel model is put together, in plain terms, so you can explain it to the user. Each object is a few simple
3D shapes filled into a grid of small cubes (voxels):
- a tree is a cylinder trunk flaring at the roots plus a canopy of one big sphere and about ten smaller spheres
  around it;
- a pond is a flat shape one voxel thick on the ground, its outline an ellipse made irregular by a few sine waves;
- a bush or a boulder is a cluster of overlapping spheres;
- a statue is stacked horizontal slices whose width follows a profile by height (feet, belly, head), with small
  cones for protrusions;
- small props (a lotus, reeds, lily pads) are placed by hand.

The renderer then shoots one ray per pixel from the towers' camera angle, colors the first voxel it hits by which
way its surface faces (a step of the material's ramp), paints carvings on top, and adds the ink outline and the
ground shadow.

### Recipes from the Bosquet

- **Water**: no rim of stones around a pond, which makes it read as a pool. The water lies almost level with the
  ground (1 voxel), inside an irregular shoreline (an ellipse scaled by a sum of a few sines of the angle). Shade a
  dark band along the back shore (reflecting the bank and trees) and a lighter ragged band of shallows along the
  front, by testing whether the water continues a few voxels behind or in front of the hit. Scatter a few pebbles,
  grass tufts or reeds on the bank instead of a continuous border. Stretch the water toward the back with a second
  overlapping shape.
- **Organic bushes**: build them from clumps like the tree canopies (a core sphere and spheres of different sizes
  around and on top of it), not one ellipsoid with noise, which reads as a ball.
- **Small round props on a surface** (fruits on a bush): march from the bush center out to its real surface, sink
  the prop only about 20%, space them apart, and use about 5 on a small bush. Sunk halfway or crowded, they merge
  with their ink seams into one squiggle.
- **Carved statues at small size**: carvings must be big (eyes about 4 voxels in radius, a lit rim, a shaded
  socket and a dark pupil). Give the front face one flat lit step (lighter on the left edge, darker on the right)
  instead of shading it by the estimated normal, and keep weathering flecks off the face. Anything meant to stick
  out of the silhouette, like an owl's ear tufts, needs a notch cut between them: the camera sees the top of the
  head, which otherwise hides them.

## Transforming an existing building

When a request describes a transformed version of an existing piece, preserve enough of its recognizable structure,
materials, proportions and footprint to show its origin; change the parts that explain its new purpose. Inspect the
original generator and image first. Prefer reusing its model-building functions, palette and camera in a separate
variant generator so the original asset stays unchanged. A visual design alone does not imply new game mechanics:
register the resource as appropriate, but don't invent stats or replace a playable piece without a request.

For the windmill-to-war-turret example (`generate-windmill-turret.py`), the transformation evolved through feedback:
- Start with the mill's base, timber body and sails, add an arbalest, then make the damage structural rather than
  just a new weapon on an intact building. Break both upper sails into stubs and make the lower remnants unequal;
  keep the hub and enough of the original silhouette to recognize the mill.
- Rip open the roof with irregular missing sections and exposed rafters; seat the weapon on the wreckage, not a
  separate platform. Replace the food sacks with a bolt rack and add a fallen sail spar. These are choices for this
  design, not requirements for every damaged building. Build damage and props in model space, with a ground shadow
  that follows the remaining base and ground debris, not airborne parts.
- Use deliberately readable shapes for small props (visible bolt shafts and tips), then inspect the variant next to
  the original both in a nearest-neighbor preview and at actual game scale. If there is no playable variant, a
  temporary existing-piece image substitution can check scale and layering; restore it afterward and don't mistake
  that visual check for a gameplay test. Check the browser console too.

## Unit style (dragon)

Units are a different, chunkier style, matched on `client/public/resources/units/dragon.png`: a 16x16 front-facing
sprite upscaled 4x to 64x64 (`analyze.py` shows runs of 4), flat colors with one or two shades per part,
light from the top left, a near-black `(29, 29, 28)` outline around the silhouette, no ground shadow, and a
single image like every other piece. The voxel renderer is overkill at
that size: hand place the pixels as a character grid and let a script add the outline and upscale, see
`client/scripts/generate-ent.py`. Preview with `--scale 6` next to the dragon.

## One front view

Pieces cannot be rotated, so every piece ships a single image, the front view facing the camera, as
`<piece>.png` next to its folder (e.g. `client/public/resources/towers/blue.png`, `client/public/resources/totem/anvil.png`),
loaded with `createImage(...)` in its `*.resources.ts` entry. On the opponent board the same image is drawn rotated
by π with the piece's mirrored footprint, so don't draw a back view.

Draw the image in the shape of the piece's footprint as written in its `GridShape`: a horizontal two-cell piece
(brewery) gets a wide canvas, a vertical one (witch house) a tall canvas.

A non-rectangular piece (the L shaped drill tower) is drawn over its footprint's bounding box, and each cell of
that box is one quadrant of the image: the art for a cell must stay inside its quadrant, and an empty cell of the
box stays fully transparent, shadow included. Don't model it as a 3D diorama of the footprint, because the oblique
camera pushes the back row down into the front cells. Lay the parts out in screen space first, then place the
model so the camera lands each part in its quadrant: in `generate-drill-tower.py` the shed stands far back so it
fills the top left quadrant, and the tower stands on the front cell and is tall enough to reach the top of the
image. Check it with a 2x2 grid overlay and count the opaque pixels in the empty quadrant.

### Cropping

Crop the canvas to the art, shadow included, with 0-3px of padding: change `WIDTH`, `HEIGHT` and `ORIGIN_Y` in
the generator so it renders the cropped image directly instead of cropping afterwards. `render` centers the
model on `WIDTH // 2`, so measure the bbox (Pillow's `getbbox()`) and pick a width that keeps both sides
inside. Then size the resource so the piece fills its footprint: a one-cell piece is `STANDARD_CELL_SIZE`
(4.9) wide, e.g. the crops field at 110x92 is `{ width: 4.9, height: 4.098 }`. Wide padding makes a piece
look lost on its tile even when the resource size matches the cell.

The resource `size` is in grid units; keep `width / height` equal to the image aspect ratio
(e.g. 128x160 → `{ width: 5, height: 6.25 }`) so the art is not stretched. The hitbox lives in the blueprint
and is independent of the drawn size.

Related variants with the same building base need the same **ground anchor**, not merely similar bottom padding.
Images are drawn centered on their position (`TDrawable.drawImage`), so for the same camera and pixel-to-grid scale,
match `ORIGIN_Y - HEIGHT / 2` between generators. The windmill turret uses
`ORIGIN_Y = HEIGHT / 2 + (windmill.ORIGIN_Y - windmill.HEIGHT / 2)` while keeping both sprites at the same
pixels per grid unit. Otherwise a taller canvas moves its foundation even if the model is unchanged. This may
require transparent padding beyond the usual tight crop: don't rescale or crop it away at the expense of alignment.
Check the shared foundation side by side in-game, not the lowest pixel of loose debris or shadow. Mirrored pieces
rotate around the same center, so preserve the existing centered drawing convention.

## Camera

The art is seen from above at roughly 45°, not straight on: top faces (plinth steps, tower floor, ring tops)
must be visible and lighter than the vertical faces. A flat front-on drawing looks wrong next to the towers.
The working oblique projection (x right, y away from camera, z up, all in pixels):
`screen_x = x + 64`, `screen_y = ORIGIN_Y - 0.7 * y - 0.75 * z`.

## Generator approach (what worked)

Write `client/scripts/generate-<asset>.py` in the repo, with tunable constants at the top (palette, sizes, shape
parameters) and a docstring explaining the outputs. The camera, ray casting, normals, outlines and PNG writing
live in the shared `client/scripts/voxel_sprite.py` (`VoxelGrid`, `render`, `Hit`, `outline`, `write_png`): a
generator only builds the voxel model and a `shade(hit)` function. Examples, about 2s each:
`client/scripts/generate-gobelin-portal.py` (stone ring on a plinth, emissive ether, block cracks) and
`client/scripts/generate-crops-field.py` (framed soil bed with wheat tufts, thin shapes, square footprint).

1. **Voxel model**: fill a `bytearray` 3D grid with small int labels (step, stone block id, ether...). Build
   shapes from simple math: boxes for plinths, polar segments for stone blocks (each block bulging out for a
   lumpy silhouette and thicker in its middle), a thin membrane for flat effects like the ether.
2. **Ray cast per pixel** through the oblique camera: march along depth in 0.25 steps until a voxel is hit,
   record label and depth. Rays reaching the ground inside the shadow shape (see Shadow) get the shadow color.
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
- Anything 1 voxel thick (reed stems, grass blades) comes out as solid ink, even with `depth_width=1`: make it
  2 voxels thick.

Then: run the generator, run `preview.py` with a reference sprite, Read the preview, adjust constants, repeat.
Write straight to the piece's real PNG (the one its `*.resources.ts` entry loads, the pink placeholder at first)
and, after every round, reload the game, `give` the piece and take `screenshot army` next to the zoomed preview:
the user wants to see each version in the game. When the canvas size changes, update the resource `size` so it
keeps the image's aspect ratio (the Bosquet went from 112x112 to 112x116, `{ width: 4.9, height: 5.075 }`).
Finally update the `*.resources.ts` entry, `git rm` the replaced image, and run `pnpm typecheck`.
Then check the sprite in the real game with the game-testing skill. For a shop piece, `give` it and take
`screenshot army`. For a battle look, `start_battle`, `step` and take `screenshot battle`. Scale and draw order
only show up there.
