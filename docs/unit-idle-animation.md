# Idle "bob" animation for every unit

## Goal

Every battle unit should breathe while it walks: a 2-frame loop where the upper body drops a little and comes back up,
with the feet planted. The fox and the dragon already have it. Give it to every other battle unit.

Scope: battle only. The shop, the inventory and the drag token keep drawing the unit's still `<unit>.png`, which must
not change.

## How the system works

- `src/shared/sprite-sheet.ts`: `SpriteSheet.fromJson(png, json)` loads a sheet in the TexturePacker / Aseprite
  "array" JSON format (one horizontal strip PNG, the JSON lists each frame's rectangle and `meta.frameTags` names
  animations by frame range). `SpriteSheet.still(image)` is a one-frame sheet over a whole still image.
- `src/shared/traits/render/idle-animation.ts`: `TIdleAnimation`, part of `TBattleUnit`, so every battle unit has
  it. It loops the sheet's `idle` tag on the unit's battle clock (`this.clock`, 32 ticks per second).
  - `idleSheet` defaults to `SpriteSheet.still(<the unit's image>)`: one frame, so no visible animation.
  - `idleFrameDuration` is the milliseconds per frame, `DEFAULT_IDLE_FRAME_DURATION = 450` (the fox's pace). It
    **replaces** the durations written in the JSON. Override it on a unit only if the user asks for a different pace.
- `TImageDrawable.draw` (`src/shared/traits/render/image-drawable.ts`) draws the sprite frame when the entity has
  `TSpriteAnimation`, and falls back to the still image while the JSON is loading.
- `scripts/sprite_sheet.py` (stdlib only):
  - `write_sheet(png, animations, palette, scale, canvas, offset)` writes the strip PNG and the JSON next to it from
    character grids.
  - `breath_out(frame, squeezed_row)` builds the bob frame: one plain row is removed and every row above it moves down
    by 1px, while the rows below stay where they are.

## What "done" looks like for one unit

1. `scripts/generate-<unit>-sheet.py`, which writes `public/resources/units/<unit>.sheet.png` and
   `<unit>.sheet.json` with one tag, `idle`, holding 2 frames at 450 ms each.
2. **Frame 1 is `<unit>.png`, identical pixel for pixel**, in the same canvas size. Check it (see Verification).
   Every frame of a sheet has the canvas size of the still image, so the resource `size` in `unit.resources.ts`
   stays correct.
3. Frame 2 is the breath out (see "The bob" below).
4. In `src/renderer/resources/unit.resources.ts`, next to the unit's entry:
   ```ts
   static elfSheet = SpriteSheet.fromJson("/resources/units/elf.sheet.png", "/resources/units/elf.sheet.json");
   ```
5. In `src/engine/units/battle/implementation/battle-<unit>.ts`, as the first field of the class:
   ```ts
   override idleSheet = UnitResources.elfSheet;
   ```
6. `pnpm typecheck` passes and `pnpm exec biome format src` changes nothing.

References: `scripts/generate-fox.py` (4x pixel art, still image and sheet from one grid) and `scripts/generate-dragon-sheet.py` (4x pixel art in an
offset canvas), plus `battle-fox.ts` and `battle-dragon.ts`.

## The bob

- The head and the upper body drop, the feet and anything on the ground (a ground shadow) stay planted. Nothing moves
  sideways.
- Amount: the approved fox and dragon drop by about 1/13 to 1/15 of the sprite's height (one sprite pixel on a 13 to
  15 pixel tall sprite). Keep that ratio for every unit so they all bob alike.
- Pick a region with no detail to squeeze: a plain torso, neck or body row. Never squeeze through the eyes, a
  face, a stripe pattern (the dragon's belly) or the feet. Look at the preview to choose it.
- Don't redraw anything else: same palette, same outline, no new pixels.

## The units

`soldier.png` is not used by any battle unit: skip it. Fox and dragon are done.

| Unit | Still image | Kind | Approach |
| --- | --- | --- | --- |
| ent | 64x64 | pixel art, 16x16 at 4x, no offset | Reuse the `SPRITE` grid and palette from `scripts/generate-ent.py`. That script adds the outline on the 16x16 grid, then upscales: apply `breath_out` to `SPRITE` *before* the outline pass, outline each frame, then write with `scale=4`. Factor the outline pass out of `generate-ent.py` rather than copying it. |
| gobelin | 86x91 | detailed pixel art at 1x, 4-bit palette, has a ground shadow | Too big to transcribe by hand: read the PNG (below) and shift in image space. The shadow stays planted with the feet. |
| dwarf | 330x330 | smooth cartoon, anti-aliased | Image space. |
| elf | 330x330 | smooth cartoon, anti-aliased | Image space. |
| brewmaster | 512x512 | smooth cartoon, anti-aliased | Image space. |
| choupisson | 1024x1024 | smooth cartoon (a hedgehog, no visible legs) | Image space, anchored on the bottom of the body. |

### Image-space units

For a unit too big or too smooth for a character grid, the generator reads `<unit>.png`, keeps it as frame 1 and
builds frame 2 from its pixels:

- Choose a **feet line** `y_feet`: everything below it is copied unchanged.
- Choose a **squeezed band** of `n` rows in a plain region above it, where `n` is about 1/14 of the opaque height
  (Pillow's `getbbox()` in the nix shell gives it).
- Frame 2: rows below the band are unchanged, the band disappears, the rows above it move down by `n`, and the top `n`
  rows become transparent.
- On anti-aliased art a hard cut can leave a visible seam. If it does, squash the region between the top of the
  sprite and `y_feet` vertically instead, with a nearest-neighbor resample, anchored at `y_feet`, so the top drops by
  `n`. Compare both in the preview and keep the cleaner one.

Generators must stay stdlib only (see the pixel-art-assets skill). There is no PNG reader yet: add a `read_png(path)`
to `scripts/sprite_sheet.py`, using `zlib` and `struct`, returning rows of RGBA tuples. It must handle 8-bit RGBA
(color type 6), 8-bit RGB (type 2) and **palette images with a bit depth of 1, 2, 4 or 8** (type 3, with the `tRNS`
chunk for alpha): gobelin is a 4-bit palette file. Undo the five PNG row filters (none, sub, up,
average, Paeth). Then add a `write_strip(png, frames, duration)` beside `write_sheet` that takes frames already as
RGBA rows, and make `write_sheet` use it so the JSON is written in one place.

## Verification for each unit

Pillow is only available in the skill's nix shell:
`nix-shell .claude/skills/pixel-art-assets/shell.nix --run "..."`.

1. **Frame 1 equals the still image**: crop the first frame from the sheet and compare it with `<unit>.png`, pixel by
   pixel. Treat any two fully transparent pixels as equal, whatever their RGB.
2. **Preview**: `python3 .claude/skills/pixel-art-assets/scripts/preview.py --scale <s> <out.png>
   public/resources/units/<unit>.png public/resources/units/<unit>.sheet.png`, writing `<out.png>` to the scratchpad.
   Then Read the image and check that frame 2 drops the head, keeps the feet, and shows no seam or cut detail.
   Use `--scale` 4 to 8 for small sprites and 1 for the big ones.
3. Rerun `generate-fox.py` and `generate-dragon-sheet.py` after changing `sprite_sheet.py`. `git status` must
   show no change on `fox.sheet.*` and `dragon.sheet.*`.
4. `pnpm typecheck` and `pnpm exec jest`.

## Don't

- Don't change `<unit>.png`, the resource `size`, or anything the shop uses.
- Don't change `DEFAULT_IDLE_FRAME_DURATION`, `TIdleAnimation` or `SpriteSheet`'s behavior. If a unit seems to need
  it, stop and ask.
- Don't add an npm package or a Python dependency to the generators.
- Don't commit unless the user asks. Report, for each unit, the squeezed region you chose and the drop in pixels.
