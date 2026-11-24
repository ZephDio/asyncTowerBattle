# Common neutral unit matrix

## My understanding of the task

The current units, towers, totems and barracks were built to push the engine and test ideas. They do not yet form a coherent set. The goal is to design the first real set, starting with the **common** rarity: the units the shop offers during the first rounds.

These 6 units are **neutral**: they are neither dwarf nor elf, and both classes (castles) can buy them. Class-specific units come later and will carry the race identity. The neutral pool must therefore support every strategy without belonging to a race.

A board is an army grid made of three things: **defense** (towers, traps), **offense** (barracks that summon units) and **economy** (food and gold totems). Two broad game plans exist:

- **Long game / defense**: survive, stack buffs on units or towers, and out-scale the opponent.
- **Rush / offense**: summon many units fast while food is full at the start of the battle, and kill the opponent before their scaling kicks in.

Several levers serve one plan or the other:

- **Food war**: drain the opponent's food until their units starve.
- **Fury**: fury grows polynomially, so whoever starts it earlier gets the edge.
- **Anti-scaling**: strip the opponent's army buffs in mid or late game while keeping your own.
- **Tag synergies** (a totem buffs one species, biome or alignment) and **specific mechanics** (debuffs, traps, projectiles) support these plans.

A good set lets each game cross one, two or three of these axes, so boards feel different from run to run. Each of the 6 commons is simple but leans toward one axis.

## How the engine shapes these units

These facts come from the current code and drive the numbers below.

- **Units do not fight units.** A unit walks the enemy path. Towers shoot it. If it reaches the castle, it deals its `damage` once and dies. **Life** means surviving towers, and **damage** means castle damage. Castles have 20 HP (elf) or 25 HP (dwarf).
- **Barrack cost is the unit's `summonTime`**, so summon time sets throughput.
- **Food**: each army starts at 100🌽 (full). Every 2 s, each unit eats `foodConsumption`: if there is food, it heals 1. If not, it takes growing hunger damage (2, 4, 6…). The castle produces 5🌽/s (dwarf and elf), so about 10🌽 per 2 s tick. That sustains roughly 10 units at 1🌽 upkeep. A rush spends the 100🌽 buffer, and a food war attacks it.
- **Fury** starts at 20 s and triggers every 2 s. Each trigger adds the next step (1, 2, 3…), so the total is triangular: 1, 3, 6, 10, 15… and 55 at 38 s. A unit receives the current fury **when it spawns**, as +X% max health and +X% movement speed. Two consequences:
  - Every **extra trigger** (the Red Obelisk, or a unit below) raises all later steps. That is the "start your fury early" lever.
  - Fury is a percentage, so **high-life units gain the most** from it.
- **Army buffs** (`vitality`, `movement-speed`, `cast-speed`; `attack` for towers) are stored per army and applied to every unit at spawn. `vitality` is +3% max health per stack.

## Star scales

Stars always mean **better for the player**. For cost and food, ★★★★★ means *cheap*.

| Stars | Life (HP) | Speed | Damage (castle) | Cost (summon time) | Food (🌽 per 2 s) |
|---|---|---|---|---|---|
| ★ | < 10 | < 0.15 | ≤ 1 | > 3.2 s | > 1.3 |
| ★★ | 10–17 | 0.15–0.21 | 1.5 | 2.6–3.2 s | 1.0–1.3 |
| ★★★ | 18–25 | 0.22–0.27 | 2 | 1.9–2.5 s | 0.7–0.9 |
| ★★★★ | 26–35 | 0.28–0.34 | 3 | 1.3–1.8 s | 0.5–0.6 |
| ★★★★★ | > 35 | ≥ 0.35 | ≥ 4 | ≤ 1.2 s | ≤ 0.4 |

For reference, the current tokens are Elf (10 HP, 0.32 speed, 1.2 s) and Dwarf (14 HP, 0.13 speed, 1.6 s). The Ent (45 HP, 4.5 s) is the top of the life scale.

Budget rule: a common unit has about **12–13 stars plus one simple effect**. A unit with a weaker effect gets more stars.

## The 6 commons

| Unit | Axis | Tags | Life | Speed | Damage | Cost | Food | Effect |
|---|---|---|---|---|---|---|---|---|
| **Wolf** | Rush | Animal · Forest | ★ | ★★★★★ | ★ (★★★ fed) | ★★★★★ | ★★★ | +1 damage while your food is above 75% |
| **Bandit** | Food war | Kinfolk · Mountain · Food | ★★ | ★★★ | ★ | ★★★ | ★★★★ | On castle hit: remove 6🌽 from the enemy |
| **Herbalist** | Long game | Kinfolk · Forest | ★★ | ★★★ | ★ | ★★★ | ★★★ | On spawn: your army gains 1 `vitality` |
| **Stone Golem** | Long game / tank | Monster · Mountain · Magic | ★★★★ | ★ | ★★ | ★★ | ★★ | Spawns with a Stone Shield (blocks the first hit) |
| **Imp** | Fury | Monster · Sky · Evil | ★★ | ★★ | ★★★ | ★★ | ★★ | On death: trigger your fury |
| **Magpie** | Anti-scaling | Animal · Sky · Magic | ★★ | ★★★★ | ★ | ★★ | ★★★ | On castle hit: steal 1 stack of a random enemy army buff |

### Proposed raw stats

| Unit | health | speed | damage | summonTime | foodConsumption | Stars |
|---|---|---|---|---|---|---|
| Wolf | 8 | 0.38 | 1 (2 fed) | 1.0 s | 0.7 | 15 |
| Bandit | 12 | 0.26 | 1 | 2.0 s | 0.5 | 13 |
| Herbalist | 14 | 0.22 | 1 | 2.4 s | 0.8 | 12 |
| Stone Golem | 30 | 0.12 | 1.5 | 2.8 s | 1.0 | 11 |
| Imp | 12 | 0.20 | 2 | 3.2 s | 1.2 | 11 |
| Magpie | 10 | 0.30 | 1 | 2.8 s | 0.8 | 12 |

### Unit notes

**Wolf (rush).** The purest tempo unit: cheap, very fast, fragile. It hits harder while food is high, which is exactly the start-of-battle window a rush exploits. Its low base life means fury barely helps it, so it wants the game to end before 20 s. It is weak to area towers (Blacksmith, Zapping) and slows.

**Bandit (food war).** A raider: every Bandit that gets through costs the enemy 6🌽, almost one full tick of castle production. It complements the Glutton Fox, which drains food over time instead of on a hit. Its secondary axis is rush, because it is cheap and food-efficient.

**Herbalist (long game).** Each spawn permanently adds +3% max health to every later unit, and to every current one if it uses `BattleArmy.addUnitBuffs`. Weak alone, it snowballs over a long battle and stacks with fury, which is also a percentage. It is the entry point for a "buff accumulation" board.

**Stone Golem (long game, tank).** A slow wall: high life plus a shield that eats the first tower shot, which is very effective against slow-firing towers like Frost. It is the unit that benefits most from fury (high base HP) and from Herbalist stacks. It is weak to starvation because of its 1🌽 upkeep.

**Imp (fury).** It wants to die. Each death adds a fury step, so all later triggers are bigger. Two or three Imp deaths before 20 s shift the whole fury curve. Being Evil, it fits the Red Obelisk theme, which also sacrifices your own units to trigger fury. Its slow summon is the brake. **Balance risk**: two barracks of Imps could trigger fury too often. If so, add "at most once every 4 s per army".

**Magpie (anti-scaling).** It does almost no castle damage. Its value is stealing a buff stack (`vitality`, `movement-speed`, `cast-speed` or tower `attack`): the enemy loses it and you gain it. It is useless against a rush and strong against Herbalist or Powder Magazine boards. It is fast enough to get through, but fragile.

## Axis coverage

● primary, ○ secondary, ✗ works against

| Unit | Rush | Long game | Food war | Fury | Anti-scaling |
|---|---|---|---|---|---|
| Wolf | ● | ✗ | | ✗ | |
| Bandit | ○ | | ● | | |
| Herbalist | | ● | | ○ | |
| Stone Golem | | ● | ✗ | ○ | |
| Imp | | | | ● | |
| Magpie | | ○ | | | ● |

Every axis has at least one primary unit. Each unit also has a clear weakness, so crossing two axes gives different boards:

- Wolf + Bandit: rush-raid.
- Herbalist + Stone Golem: buff wall.
- Imp + Stone Golem: fury tank.
- Magpie + Herbalist: out-scale by stealing.

## Tags

Each unit has one **species** tag and one **biome** tag. Four of them also have an **alignment** tag; the Wolf and the Herbalist have none.

| Family | Kinfolk | Animal | Monster |
|---|---|---|---|
| Species | Bandit, Herbalist | Wolf, Magpie | Stone Golem, Imp |

| Family | Forest | Mountain | Sky |
|---|---|---|---|
| Biome | Wolf, Herbalist | Bandit, Stone Golem | Imp, Magpie |

| Family | Food | Evil | Magic | None |
|---|---|---|---|---|
| Alignment | Bandit | Imp | Stone Golem, Magpie | Wolf, Herbalist |

Every species and every biome holds exactly 2 commons, and each pair mixes two different strategies. A tag totem (for example a Forest totem) therefore pushes a board toward one family without locking it into one strategy. Alignments match existing pieces: Evil works with the Red Obelisk theme, Food with the Windmill and the Fox, and Magic is free for a future totem.

## Implementation notes

- Wolf, Bandit, Herbalist, Stone Golem: everything needed already exists (`alliedFoodHooks.getFood`, `enemyFoodHooks.removeFood`, `alliedArmyBuffHooks.addUnitBuff`, `StoneShield`). The castle-hit effects hook into `attackCastle()` in `battle-unit.ts`.
- Imp: `hooks.triggerFurry()` exists. It needs an on-death hook that fires for both kills and castle hits.
- Magpie: needs a new `removeUnitBuff` / `removeTowerBuff` on `ArmyBuffHooks`, and a way to re-apply the reduced buffs to living enemy units and towers. Today buffs are only ever added.
- Tags: `ForestTag`, `MountainTag`, `SkyTag`, `KinfolkTag`, `AnimalTag`, `MonsterTag`, `EvilTag` and `MagicTag` exist. `FoodTag` lives in `building-tags.ts` even though `Food` is listed in `ALIGNMENT_TAGS`. It works for the Bandit, but should probably move to `alignment-tags.ts`.
- All six are shop units (`TShopBlueprint`). The Dwarf and Elf token units stay as the castles' default units.

## Open questions

1. The brief lists "life, speed, health, cost". I read the second "health" as **damage**. I also added a **food** column because upkeep is central to the rush and food-war axes.
2. Cost stars: I used "more stars = cheaper". Do you want the opposite convention?
3. Price and shop share: should all commons share one price (e.g. 10🪙), with rarity alone limiting them?
