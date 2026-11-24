# Emoji icon catalogue

Canvas text in the game (descriptions, HUD labels) draws these emoji as the game's own pixel icons, not as system emoji. Write the emoji in a description string and the icon appears: `"produce 5🌽"`, `"+16% 🏹 or +8% 🔮"`.

How it works: `client/scripts/generate-icon-font.py` builds a color font (`client/public/font/icons.ttf`) from the PNGs in `client/public/resources/icons/`, and `icons.css` adds it to the `text` and `title` font families for those characters only. Everything else in a string uses the regular font. `U+FE0F` (the emoji variation selector) is mapped to an empty glyph, so `⚔️` and `⚔` look the same.

## Catalogue

Source = file in `client/public/resources/icons/`.

### Economy and castle

| Emoji | Meaning | Source |
| --- | --- | --- |
| 🪙 | gold | `gold.png` |
| 🌽 | food | `corn.png` |
| ❤ | castle health, full | `heart-container.png` |
| 🖤 | castle health, empty | `heart-container-empty.png` |

### Stats of a unit or tower (plain icons)

Use these for the stat rows of a unit or tower, and when a description talks about the stat itself.

| Emoji | Meaning | Source |
| --- | --- | --- |
| 🥾 | unit speed | `unit-speed.png` |
| 💚 | unit health | `unit-health.png` |
| 🗡️ | unit castle damage (the bomb) | `unit-castle-damage.png` |
| ⚔️ | tower projectile damage | `tower-attack.png` |
| 💠 | tower cast speed | `tower-cast-speed.png` |
| ⏱️ | unit production time (how long a barrack takes to ready it) | `production-time.png` |

### Army buffs (the same sprites printed on a shield)

Use these when a piece grants the buff to the whole army (`addUnitBuff` / `addTowerBuff`), so a buff reads differently from the plain stat.

| Emoji | Meaning | Source | Buff |
| --- | --- | --- | --- |
| 👢 | army unit speed | `army-buff/unit-speed.png` | `movement-speed` |
| 💖 | army unit health | `army-buff/unit-health.png` | `vitality` |
| 🏹 | army tower projectile damage | `army-buff/tower-attack.png` | tower `projectile-damage` |
| 🔮 | army tower cast speed | `army-buff/tower-cast-speed.png` | tower `cast-speed` |

The unit `cast-speed` buff has no shield icon yet. Castle damage is deliberately not an army buff.

### Synergy

| Emoji | Meaning | Source |
| --- | --- | --- |
| ▣ | a synergy cell, the yellow star | `pattern-star-active.png` |
| ☆ | an unmet synergy cell, the grey star | `pattern-star-inactive.png` |

## Adding or changing an icon

1. Put the 16x16 sprite, upscaled by a whole factor (64x64 for most), in `client/public/resources/icons/` (shield icons go in `army-buff/`, built with the `layering-design` skill).
2. Add a line to `EMOJI` in `client/scripts/generate-icon-font.py`. Pick an emoji no other entry uses and that renders as a single code point.
3. Run `pnpm generate:icon-font` in `client/` and commit the regenerated `icons.ttf` and `icons.css`.
4. Update this table and the emoji paragraph in `AGENTS.md`.
