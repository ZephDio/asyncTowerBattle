# Async Tower Battle: game design

This document describes the game as it is built today: its loop, rules, pieces and visual style. It is written for a reader who has not seen the code, such as another model helping with game design or art direction. Numbers come from the code at the time of writing. When they change, the code is the source of truth.

## Pitch

A browser auto-battler that mixes **tower defense** and **deck-building on a grid**. Each round, the player buys buildings in a shop and places them on a small board. The board is both a fortress and an army: it holds the path that enemy units must walk, the towers that shoot them, the barracks that send the player's own units at the enemy, and the totems that run the economy. The board then fights another player's board automatically. Nobody plays live: opponents are boards that other players saved at the same round (asynchronous play, like Backpack Battles or Super Auto Pets).

The player picks a faction (Dwarf or Elf) and has **5 lives**. Each lost battle costs one life. The run ends at 0 lives.

## The round loop

1. **Shop phase.** The player gains `20 + 5 × round` gold (80 gold at the start of the run). They buy pieces, place and move them on the board, and fill barracks with units. The player must keep a complete path from the enemy door to their castle, or they cannot start the battle.
2. **Matchmaking.** The board, with the player's win/loss record, is sent to the server, which returns an opponent board from the same round. Offline, the game uses hand-made enemy boards per round.
3. **Battle.** Both boards fight automatically at 32 ticks per second. Battles are deterministic for a given seed.
4. **Summary.** Victory or defeat, life lost on defeat, then back to the shop.

Between rounds the board **grows** and nature **spawns** on it:

| Round | Board (w × h) | New rocks | New trees |
|---|---|---|---|
| 1 | 8 × 6 | 2 | 3 |
| 2 | 9 × 7 | 0 | 0 |
| 3 | 9 × 7 | 1 | 0 |
| 4 | 11 × 7 | 0 | 2 |
| 5 | 11 × 7 | 1 | 0 |
| 6 | 11 × 7 | 0 | 0 |
| 7 | 11 × 7 | 1 | 0 |
| 8+ | 13 × 8 | 0 (2 trees at round 8) | |

Each time the board grows, the player receives 2 free path tiles. Trees spawn in clusters. Rocks spawn apart from other nature. Rocks and trees (forests) take up cells and some pieces care about them (the Gold Mine and the Drill Tower want a rock next to them).

## The battlefield

The two boards are joined into one battlefield: the player's board at the bottom, the opponent's board on top, rotated 180°. Each board has:

- a **castle** (the thing to protect, 20 or 25 HP),
- a **door** in its top-right corner, where the other army's units enter,
- a **path** of tiles that the player built from the door to their castle.

**The player builds the maze that the enemy walks.** A player's own units walk the *opponent's* path to the opponent's castle. This makes the path a defensive tool: a long winding path keeps enemies inside tower range longer, but every path tile also takes a cell that a building could use.

How a battle plays out:

- **Barracks** summon units. Each unit enters the opponent's board at the door and walks the path.
- **Units do not fight units.** Towers shoot units. A unit that reaches the enemy castle deals its damage to the castle once and disappears.
- **Towers** fire at enemy units standing in their **target zone**: a set of cells relative to the tower, by default the 8 cells around it. In the shop, each target cell is marked with a bow icon, red when the cell holds a path tile (the tower will be useful there) and grey otherwise.
- **Totems** cast on a timer or react to events, and buff, feed or sabotage.
- The battle ends when a castle falls.

## Resources

### Gold (between battles)

Gold buys pieces and refreshes the shop (5 gold). Most pieces cost 10 or 15 gold, the White Stag 20. Unspent gold carries over, and some pieces reward hoarding (the Gold Mine pays interest, the Dragon gains health per 5 gold owned).

### Food (during battles)

Each army starts the battle with **100 food (full)** and a maximum of 100. The castle produces food over time: 3.5 per second for the Dwarf, 4 per second for the Elf.

- **Towers, barracks and some totems spend food each time they cast.** A building that cannot pay does not act.
- **Every unit eats** its upkeep every 2 seconds. If fed, it heals 1 HP. If not, it takes hunger damage that grows each time (2, 4, 6…).

So the starting food is a buffer. An aggressive board spends it fast with many units. A long-game board builds food production. A food-war board drains the opponent (the Glutton Fox steals food) so their units starve and their towers stop.

### Fury

Fury is the late-battle clock that prevents stalemates. Starting at 20 seconds, it triggers every 2 seconds. Each trigger adds one more than the last (1, then 2, then 3…), so fury grows as 1, 3, 6, 10, 15… Every unit **spawned** afterwards gets the current fury as +X% max health and +X% movement speed. Anything that triggers fury early (the Red Obelisk) speeds up every later step.

### Army buffs

Some effects buff the whole army for the rest of the battle: units get vitality (max health), movement speed or cast speed. Towers get attack or cast speed. Units receive the army buffs when they spawn.

## The shop

- The shop shows a row of offers. Each slot first rolls a **rarity** from the round's odds, then a piece of that rarity. A piece appears at most once per roll.
- Five rarities: Common, Uncommon, Rare, Epic, Legendary. Early rounds are almost all common. Odds flatten to 20% each by round 12:

| Round | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| 1 | 90 | 10 | 0 | 0 | 0 |
| 3 | 75 | 20 | 5 | 0 | 0 |
| 5 | 45 | 35 | 15 | 5 | 0 |
| 7 | 20 | 35 | 25 | 15 | 5 |
| 12+ | 20 | 20 | 20 | 20 | 20 |

- Within a rarity, categories are weighted: totems 100, towers 100, units 50, barracks 60, path tiles and traps 35.
- Bought pieces go on the board or into the **inventory** (a reserve).
- Pieces are dragged and dropped. **They never rotate**: a piece's shape and its synergy cells are fixed as drawn, facing the player.

## Grid synergies (stars)

Many pieces have a **pattern**: specific cells relative to the piece, shown as stars in the shop. A star lights up when the piece sitting there meets the condition ("a rock", "a tower that deals damage", "a barrack", "a Food building"...). Lit stars power the effect. In descriptions, `▣` means "on a star cell".

The opponent's board is a point mirror of its builder's board, so a star to the top right of a piece is at the bottom left when seen from the other side. The rules stay identical.

This is the main puzzle of the shop phase: where to put things so that the path, the tower target zones and the star patterns all line up on a small, growing board scattered with rocks and trees.

## Tags

Pieces carry tags that synergies and future pieces can target.

- **Building**: Tower, Barrack, Totem, Tile, Trap, Castle.
- **Alignment**: Food, Evil, Magic.
- **Biome**: Forest, Mountain, Sky.
- **Species** (units): Kinfolk, Animal, Monster.

## Factions

| Faction | Castle | Castle HP | Food / s | Default unit |
|---|---|---|---|---|
| Dwarf | Dwarf Mountain | 25 | 3.5 | Dwarf: slow, tough, spawns with a stone shield that blocks one hit |
| Elf | Castle | 20 | 4 | Elf: fast and fragile |

An empty barrack summons the faction's default unit. Factions are thin for now: castle stats and default unit. Faction-specific pieces are planned.

## The pieces

Prices are in gold. "Every Xs" is the cast time. Food is the food spent per cast (buildings) or per 2 s (units).

### Towers (defense)

| Tower | Rarity | Price | Damage | Every | Food | Effect |
|---|---|---|---|---|---|---|
| Miller's Bolt | Common | 10 | 10 | 1.5 s | 1.5 | Fast homing bullets. The first time an allied unit hits the enemy castle, gain 20 food. Tagged Food. |
| Blacksmith Tower | Common | 10 | 4 per spark | 1.5 s | 3 | Horizontal 2x1. Every cast (no target needed) shoots 7 sparks from its anvil in a wide cone (68 degrees above and 70 below the left direction) toward the 3 cells on the left of its left cell. The cone is cut in 7 equal slices and each spark takes a random direction in its own slice, and flies to the flat far edge of the zone's cells, so it crosses the whole path there, or to the top or bottom of the zone if its angle is steep (the direction is from the battle's seeded random). A spark stops on the first enemy it touches and hurts it. Kinfolk units also get max health from it: 0 at first, +1 every 4 casts (new Kinfolk units get the value reached so far). |
| Zapping Tower | Uncommon | 10 | 15 | 3.5 s | 3 | Lightning that chains between nearby enemies. |
| Frost Tower | Rare | 10 | 4 | 3 s | 3.5 | A frost boulder falls and explodes, slowing enemies. |
| Witch House | Rare | 10 | 6 | 6 s | 5 | Two cells tall. Targets the cells on either side of and below its base. Fills every path cell of its zone with poison puddles. |
| Drill Tower | Rare | 15 | 25 | 6 s | 5 | L-shaped, 3 cells. Targets the whole column below it. Fires a giant drill that pierces every enemy in line. With a rock on its star (left of the shed) it casts every 4.5 s. |

### Barracks (offense)

A barrack summons the unit placed into it (or the default unit). The unit's summon time sets the pace.

| Barrack | Rarity | Price | Food / summon | Effect |
|---|---|---|---|---|
| Basic Barrack | Common | 10 | 4 | One unit at a time. |
| Wave Barrack | Uncommon | 10 | 3 | Units come out 3 at a time. |
| Veteran Barrack | Epic | 10 | 5 | Slower (×0.6). Summons a giant version of its unit: slower, much more health. |
| Rush Barrack | Common | 15 | 3 | Two cells wide (`oo`). Faster (×1.2). Each unit it summons eats +1 food more at its 2 s upkeep for as long as it lives (a permanent buff on its upkeep, no icon); short of food, it goes hungry like any unit. |

### Units

Units are bought like pieces and placed into barracks. Health is how long they survive towers. Damage is what they deal to the castle on arrival.

| Unit | Rarity | Price | HP | Speed | Castle dmg | Food | Summon | Tags | Ability |
|---|---|---|---|---|---|---|---|---|---|
| Dwarf | default | — | 14 | 0.13 | 1.2 | 0.4 | 1.6 s | Kinfolk | Spawns with a stone shield (blocks one hit). |
| Elf | default | — | 10 | 0.32 | 1 | 0.4 | 1.2 s | Kinfolk | None. |
| Gobelin | token | — | 10 | 0.4 | 1 | 1 | 1 s | Evil, Monster | Small and fast. Made by the Gobelin Portal. |
| Glutton Fox | Uncommon | 15 | 22 | 0.18 | 1.5 | 0.5 | 1.8 s | Animal, Food | Every 4.5 s eats 2 food from the enemy (scales with attack). |
| Choupisson | Rare | 15 | 18 | 0.25 | 3 | 1.8 | 3.5 s | Animal | When hit, throws 3 spines in a cone. |
| White Stag | Rare | 20 | 42 | 0.13 | 1.5 | 1.3 | 3.5 s | Animal, Forest, Magic | Casts healing waves. Drops a healing antler at 50% life and on death. |
| Ent | Epic | 15 | 45 | 0.13 | 3 | 1.5 | 4.5 s | Forest | Every 6 s throws roots that slow a building by 50% for 4 s. |
| Brewmaster | Epic | 15 | 40 | 0.22 | 3.5 | 5 | 4 s | Kinfolk | Regenerates 15% of its life every 2 s. Very hungry. |
| Dragon | Legendary | 15 | 18 | 0.25 | 3 | 1.6 | 2.2 s | Evil, Mountain, Monster | +1 max health per 5 gold the player owns. |

### Totems (economy, buffs, tricks)

| Totem | Rarity | Price | Effect | Star pattern |
|---|---|---|---|---|
| Crops Field | Common | 10 | Every 3.5 s: +5 food. | none |
| Windmill | Common | 10 | Food buildings on its stars cast 25% faster. +5 max food per Food building on its stars. | a cross 2 cells long in each direction |
| Bakery | Uncommon | 10 | Every 4 s: spend 5 food to give units +2 vitality, or produce 3 food if it can't. | none |
| Brewery | Epic | 15 | Every 5 s: +0.5 food per allied unit (max 8). Hitting the max gives units speed. Start of battle: units gain speed per barrack on its stars. | 4 cells around and below |
| Gobelin Portal | Epic | 10 | When a caster on a star triggers: 30% chance to summon a Gobelin. | the 4 diagonals |
| Forging Anvil | Legendary | 10 | Damage towers on its stars deal +30% damage. | left and right |
| Gold Mine | Legendary | 15 | Shop entered: +5 gold if a rock is on its star, plus 1 gold per 10 gold owned (interest). | right |
| Powder Magazine | Legendary | 10 | Start of battle: towers get +4 cast speed or +4 attack. At 15 s: +8 more. | none |
| Red Obelisk | Legendary | 10 | Every 5 s: destroys one of your own units, and if it does, triggers fury. 10% faster per Evil piece on its stars. | 5 cells around and above |

### Path tiles and traps

| Piece | Rarity | Price | Effect |
|---|---|---|---|
| Basic Tile | Common | 10 | A dirt path cell. Shape (straight or turn) follows its neighbors. |
| Mud Trap | Common | 10 | Placed on a path tile. Slows enemies on it by 30%. |
| Stun Trap | Uncommon | 10 | Placed on a path tile. Stuns enemies on it for 2 s. |

Path rules (junctions, right-click to choose a direction) are in `docs/path.md`.

### Status effects

Frozen (slowed, wearing off), Rooted (cannot move), Stunned, Bogged down (mud), Poisoned (damage over time), Stone Shield (blocks the next hit).

## Strategic axes

The design intent is that each run leans on one to three of these axes, so boards feel different:

- **Defense / long game**: a winding path, well-placed towers and stacked tower buffs, outlasting the opponent.
- **Rush**: many cheap units early, while food is still full, to break the castle before the opponent scales.
- **Food war**: drain the opponent's food so their units starve and their towers stop casting.
- **Fury**: trigger fury early (Red Obelisk) so late units are much bigger.
- **Anti-scaling** (planned): remove or reduce the opponent's army buffs.
- **Tag synergies**: totems that reward a species, biome or alignment.
- **Gold greed**: hold gold for interest (Gold Mine) or power (Dragon) at the cost of a weaker board now.

## Current state and open design questions

The piece set was built to exercise the engine, not as a balanced first set. Known gaps:

- Factions differ only by castle and default unit.
- Unit-vs-unit combat does not exist. Units only race to the castle.
- Many legendary pieces cost the same as commons.
- Tags exist but few pieces use them yet (Sky has no piece, Magic only the White Stag).
- The anti-scaling axis has no pieces.
- A first common unit set was sketched in `docs/unit-matrice.md`.

## Art direction

### Overall look

- **Pixel art** on a 2D canvas, seen from a three-quarter top-down view (front-facing buildings standing on a grass grid).
- Every piece has **one front-view image**. The opponent's pieces reuse it rotated 180°, so the art must still read upside down.
- Units are small **16 × 16** sprites with idle animation sheets. Buildings are larger sprites anchored on their cells.
- Tone: light-hearted fantasy, storybook medieval. Dwarves, elves, goblins, forest spirits (ents, white stag), a dragon, a hedgehog (Choupisson), a fox. Some names are jokes ("Bakery Wryy", "Cow-boy Brewery", "Glutton Fox").

### House style for buildings

For new artwork, use Windmill (`client/public/resources/totem/windmill.png`), Bosquet (`client/public/resources/totem/bosquet.png`) and Cropfield (`client/public/resources/totem/crops-field.png`) together to calibrate lighting, voxel density, amount of detail and shadow treatment. They guide how a piece is rendered, not what it depicts: the subject, silhouette and composition come from its own brief. The older tower and cottage established the following pixel-art conventions; their exact measurements are not requirements for matching the newer sprites:

- Native 1 px pixels, no anti-aliasing, no gradients, no dithering. Chunky 2–3 px shapes.
- A **2 px ink outline**, `(22, 28, 46)`, around every silhouette. Ink also separates materials.
- Each material uses one 4–5 step **ramp** going from violet-dark to warm-light. Stone: violet → slate → teal-dark → teal → mint. Wood: brown-dark → brown → wood → wood-light. Thatch: mauve → straw → cream. A new material gets its own ramp in the same spirit.
- Light from the top left. Flat-shaded faces, with round shapes darkening at both edges.
- Masonry, plank and thatch textures with 1 px strokes in the neighboring ramp step.
- A single semi-transparent shadow color, `(22, 28, 46, 80)`, shaped like the piece seen from above, even on left and right, scaled with the piece's height.

The full rules and the generator workflow are in `.agents/skills/pixel-art-assets/SKILL.md`.

### Color coding

- Towers and houses come in color variants (blue, purple, red, yellow, green, frost), and castles in blue, purple, red and yellow.
- HUD icons: gold coin 🪙, food 🌽, health 💚, attack ⚔️, cast speed 💠, movement 🥾, a fury icon, and stars for synergy cells, bows for tower target cells.
- Path tiles have variants per surface: dirt, mud (slowing), and spikes (stun).

### Asset locations

- `client/public/resources/towers/`, `house/` (barracks), `totem/`, `castle/`, `units/` (with `.sheet.png` animation sheets), `projectiles/`, `path/`, `environment/` (rock, forest), `hud/`, `button/`, `economy/`, `verdict/` (victory and defeat banners).
