---
name: unit-design
description: Design, add, replace or rebalance a battle unit (dragon, fox, ent, white stag...) - its stats, tags, cast, files in the blueprint / recruit / battle layers, and its 16x16 pixel art sprite drawn as a character grid. Use when the user asks for a new unit, to rework or rename one, to tune a unit's stats ("slow", "tanky", "average damage"), or to draw or fix a unit sprite.
---

# Unit design

A unit is a shop piece that walks the enemy path in battle. It lives in three layers (see CLAUDE.md, "Three-layer
entity model"), plus one image. This skill covers the gameplay side (stats, tags, cast, files) and the sprite.
For idle animation sheets, see `docs/unit-idle-animation.md`. For general pixel art tooling (preview, analyze,
nix shell), see the `pixel-art-assets` skill.

## Files to touch

Adding a unit `<unit>` (kebab case file names, PascalCase classes):

| Layer | File | Notes |
| --- | --- | --- |
| Blueprint | `src/engine/units/blueprint/implementation/<unit>-blueprint.ts` | rarity, shop price and share, hitbox, image, base stats, tags, description, `toRecruit` |
| Blueprint union | `src/engine/units/blueprint/units-blueprint.ts` | add to `AnyUnitBlueprint` |
| Blueprint fixtures | `src/engine/units/blueprint/unit-blueprint-fixtures.ts` | `build<Unit>()` and `static get <unit>()` |
| Recruit | `src/engine/units/recruit/implementation/<unit>.ts` | `Derive(Unit)`, plus `RecruitCaster` if it casts; `toBattle` |
| Recruit fixtures | `src/engine/units/recruit/unit-fixtures.ts` | `UnitRecruitFixture.<unit>`, used by armies and barracks |
| Battle | `src/engine/units/battle/implementation/battle-<unit>.ts` | `Derive(TBattleUnit)`, plus `Caster` if it casts |
| Image | `public/resources/units/<unit>.png`, entry in `src/renderer/resources/unit.resources.ts` | `size` in grid units, `shape: "ellipse"` |
| Generator | `scripts/generate-<unit>.py` | writes the PNG (and the idle sheet, if any) |
| Shop | `src/engine/shop/retail/retail-filler.ts` | add the blueprint to the units pool to sell it |
| Enemies | `src/engine/match-maker/local-match-maker.ts`, `src/engine/constructs/barrack/recruit/barrack-fixtures.ts` | only if the opponent armies should field it |

To **replace** a unit (priest → white stag), `git mv` the three layer files, then rename every reference with a
grep across `src` (classes, `build*`, fixture getters, `*With<Unit>` barrack helpers, recruit constructor params).
Delete the old PNG, sheet and generator, and drop its rows from `docs/unit-idle-animation.md`. Finish with
`grep -rn <old> src scripts docs`: it must find nothing.

Then `pnpm exec biome format --write src`, `pnpm typecheck`, `pnpm exec jest`.

## Stats

`TBaseStats` on the blueprint. Units without `TShopBlueprint` (dwarf, elf, gobelin) are enemy and barrack only.
Current values, to judge what "slow" or "average" means:

| Unit | Rarity | Health | Speed | Damage | Food | Cast every | Summon (s) | Tags |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gobelin | common | 10 | 0.40 | 1 | 1 | - | 1 | Evil, Monster |
| elf | common | 10 | 0.32 | 1 | 0.4 | - | 1.2 | Kinfolk |
| dwarf | common | 14 | 0.13 | 1.2 | 0.4 | - | 1.6 | Kinfolk |
| choupisson | rare | 18 | 0.25 | 3 | 1.8 | - | 3.5 | Animal |
| brewmaster | epic | 40 | 0.22 | 3.5 | 5 | 2s | 4 | Kinfolk |
| fox | uncommon | 22 | 0.18 | 1.5 | 0.5 | 4.5s | 1.8 | Animal, Food |
| white stag | rare | 42 | 0.13 | 1.5 | 1.3 | 2s | 3.5 | Animal, Forest, Magic |
| ent | epic | 45 | 0.13 | 3 | 1.5 | 6s | 4.5 | Forest |
| dragon | legendary | 18 | 0.25 | 3 | 1.6 | - | 2.2 | Evil, Mountain, Monster |

Reading the table (re-measure if it has drifted):
- **Health**: low 10-14, average about 18-22, great 40-45.
- **Speed**: slow 0.13 (dwarf, ent), average 0.18-0.25, fast 0.32-0.40.
- **Damage**: average about 2 (mean of the roster), low 1, high 3-3.5. "Slightly under average" is 1.5.
- **Food consumption**: the median is 1.3, so "normal" is 1.3. 0.4-0.5 is cheap, 5 is very expensive.
- **Summon time** grows with power: about 1-2s for light units, 3.5-4.5s for the tanks.
- Every unit uses `attackSpeed: secondsToFrame(0.3)` and `range: NaN` (melee). `foodConsumptionOnCast: NaN`.

Time helpers (`src/shared/seconds.ts`, 32 ticks per second): `secondsToFrame(s)` for summon and attack times,
`castSpeedFromSeconds(s)` for `castSpeed`, the cast happening every `s` seconds. `castSpeed: NaN` means no cast.

The shop: `TShopBlueprint(price, share)`. Units cost 15, 20 for the rare ones; `share` weighs how often it is
offered. `TRarity(Rarity.X)` drives the rarity frame.

## Tags

One trait per tag, listed after `TBaseStats` in the blueprint's `Derive`:
- species (`tags/species/species-tag.ts`): `KinfolkTag` (people), `AnimalTag` (beasts), `MonsterTag`
- biome (`tags/biome/biome-tags.ts`): `ForestTag`, `MountainTag`, `SkyTag`
- alignment (`tags/alignment/alignment-tags.ts`): `EvilTag`, `MagicTag`, and `FoodTag` lives in `building-tags.ts`

"Beast" is `AnimalTag`. Tags feed synergies, so ask before inventing a new one.

## Casts

A caster's recruit derives `RecruitCaster` and its battle unit `Caster`, passes `casterRecruit: recruit` to
`super`, implements `casts()` by setting `this.castInProgress = new Cast(this, this.<effect>.bind(this))`, and
calls `this.tickCast()` in `tick()`. The effect calls `this.finishCast()` when done. Effects reach the battlefield
only through `this.hooks` (`addAreaEffect`, `addProjectile`, ally/enemy searches): see `battle-white-stag.ts`
(heal wave), `battle-ent.ts` (root projectile). Reuse an effect when the user says "same as X".

**Reacting to health or death** (the white stag drops an antler at 50% health and the other on death, each one a
`FallenAntler` area effect healing where it fell):
- a threshold: check `this.stats.health <= this.stats.maxHealth / 2` in `tick()`, once, guarded by a field. Don't
  hook `takeHit`: statuses like poison call `stats.takeDamage` directly and skip it.
- death: do the work in the `onDeath` callback passed to `super`, before `this.hooks.removeUnit(this)`. It can fire
  more than once (several hits on the same tick), so guard it too. Area effects belong to the army, so they keep
  ticking after the unit is gone.
- a different look for a phase: set `this.idleSheet = UnitResources.<variant>Sheet` (or
  `SpriteSheet.still(<other image>)` for a unit without idle animation), the variant being a second still image and
  sheet in `unit.resources.ts`. Cut the variant from the same grid in the generator, before `breath_out`, so the
  images and sheets stay in sync (`scripts/generate-white-stag.py`).
- an object left on the ground: a new class in `src/engine/area-effect/implementation/`, added to the
  `AreaEffect` union, drawn at `DrawPriority.CarpetStyleGridElement` so units walk over it.

The description is three short lines (about 20 characters each): `new UnitDescription(name, [lines], this)`.

## Sprite

The reference is `public/resources/units/dragon.png`; the ent, choupisson, brewmaster and white stag follow it.

- **A character grid, upscaled 4x** with nearest neighbor: one character per sprite pixel, `.` transparent. 16x16
  is the norm (64x64 PNG). A big creature may take more (the white stag is 23x23 for its antlers and long legs),
  never smaller pixels. A 16x16 stag was judged "poor": don't squeeze a detailed creature into the minimum grid.
- **Outline**: leave the first and last rows and columns empty and let `outline(SPRITE, "#")` from
  `scripts/sprite_sheet.py` draw the near-black `(29, 29, 28)` outline around the silhouette. Write the image with
  `to_pixels(..., scale=4)` and `voxel_sprite.write_png`. Template: `scripts/generate-brewmaster.py`.
- **Colors**: flat, one or two shades per part, light from the top left (lighter left and top, darker right and
  bottom). Reuse existing colors: the dragon's amber `(241, 147, 25)` for gold, the towers' mint
  `(143, 226, 185)` for magic glows, the ent's bark browns, the skin `(255, 205, 166)`.
- **Gaps**: the outline fills any 1px gap between two parts, so a 1px gap reads as a black line and a 2px gap as a
  black slot. Separate parts that must read apart (antler tines, legs) by 2px or more.
- **Faces**: a big flat white face with colored eyes reads as a skull (first white stag draft). Prefer dark `#`
  eyes, a nose or muzzle, and keep glow colors for small accents (antler tips).
- **Pose**: bipeds face the camera (dragon, ent, brewmaster). Quadrupeds stand in profile with the head turned to
  the camera (fox, white stag), so both ears or antlers show. A quadruped body seen from the front reads as a box
  on table legs: tried and dropped for the stag.
- **Quadruped details that made the stag work** (from a reference deer the user gave):
  - a long neck rising from the front of the body to the head, and long legs;
  - a contrasting underside: cream throat, muzzle and belly stripe under a white body;
  - near legs in the body color, the hind one bent at the hock; far legs as 1px lines in the shade step, between
    the near ones; dark hooves;
  - a short tail tuft at the back;
  - antlers or horns with several tines on a curved beam, two tones (shade under the beam);
  - a symmetric head and headgear: mirror the columns around the head's center (column `c` ↔ `2 * center - c`).
- **Resource size**: about 21 image pixels per grid unit, like the ent (64px at 3 units). Cap big sprites so the
  unit doesn't dwarf the others: the 92px stag is 3.6, not 4.3. Keep `width / height` equal to the image's aspect
  ratio.
- Place the sprite low in the canvas: the feet on the row above the bottom outline row.

Iterate: run the generator, `preview.py --scale 4` next to `dragon.png`, `ent.png` and `fox.png` (see the
pixel-art-assets skill), Read the preview, fix, repeat. Keep a generator per unit so the art can be regenerated.
For fast drafts, keep the grid in a text file in the scratchpad and render it with a throwaway script; copy the
final grid into the generator. When the user shares a reference image, take its treatment (shading bands,
contrasting underside, joints, proportions), not its exact pixels, and keep this palette and outline.

### Existing art the user likes

When an old sprite is small or blurry but the user likes its drawing (the fox), **don't redraw it**: transcribe
the PNG pixel for pixel into a grid (`read_png`, one letter per color) and write it at 4x. My redraws of the fox
and the priest were rejected as much worse than the originals; the 1:1 upscale was approved. Redraw only when the
user asks for a new design. Old images stay in git: `git show HEAD:public/resources/units/<unit>.png`.

### Idle animation

Optional, and only when asked. The 2-frame bob, the squeezed-row rule and the sheet wiring
(`override idleSheet = UnitResources.<unit>Sheet`) are in `docs/unit-idle-animation.md`. Without a sheet, the
battle unit draws its still image.
