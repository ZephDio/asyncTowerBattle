# Path

The path is the route enemy units walk, from the enemy door to the castle. The player builds it out of path tiles during the shop phase. It is not searched for: every path tile has a direction, and the path is whatever those directions chain together.

## Tile directions

Every path tile always connects exactly two directions, whether or not it is on the path. The directions are unit offsets (`up = (0, 1)`, `right = (1, 0)`, ...) and depend on the tile's **neighbors**, meaning the path tiles in the 4 cells around it.

| Neighbors | Directions |
|---|---|
| 0 | Up and down (a vertical straight). Also used in the inventory and while dragging. |
| 1 | Straight through that neighbor. |
| 2 | Towards both neighbors. This is forced: a straight or an L turn. |
| 3 or 4 (a **junction**) | The pair the player chose with right-click. Without a choice, or if the choice no longer matches the neighbors, the pair used by the shortest door-to-castle route. |

Two tiles count one extra **outside neighbor** above them:
- The **door tile** at `grid.getEnemyDoorCell()` = `(width-1, height-1)`. Its outside neighbor is the enemy half of the battle grid, which is stacked on top.
- The **castle-end tile** at `castle.cell.down()`. Its outside neighbor is the castle.

So a door tile with one tile next to it already has 2 neighbors and turns towards it. A ring touching the door makes the door tile a junction.

## Following the path

The path starts on the door tile, entering from above. From each tile it leaves by the direction it did not enter by. It moves on to the next tile only if that tile **points back**. It stops when:
- the next cell has no tile, or that tile does not point back (an incomplete path), or
- it reaches the castle-end tile and leaves upward into the castle (a **complete** path).

Units only walk complete paths. `Army.path` throws on an incomplete one and `Army.isPathValid()` returns `null`.

## Right-click in the shop

Right-click on a path tile in the army grid. While holding a piece, right-click still rotates it instead.
- **On a junction:** cycles through every pair of its neighbors. Some pairs break the path, which is intended: the direction belongs to the tile, not to the route.
- **On a tile next to a junction that does not point at it:** that junction turns towards the clicked tile. It keeps the direction the path enters it by (or its first direction when the path does not reach it).
- **On any other tile:** nothing happens.

The choice is stored on the tile (`connectionChoice`) and cleared when the tile moves.

Example: a square ring between the door `D` and the castle end `E`.

```
D o E      default: the shortest route, D → o → E
o . o      right-click the o below D: D turns down (the path now stops before E)
o o o      right-click the o below E: E turns down too, and the path takes the big turn
           right-clicking D or E themselves cycles through their 3 pairs
```

## Drawing

- Each path tile draws a **straight** or **turn** image rotated to match its two directions (`pathShapeVariant` in `src/engine/tile/path-shape.ts`).
  - `{name}-straight.png` connects up and down.
  - `{name}-turn.png` connects up and right.
  - Rotations are counterclockwise in quarter turns.
  - The full `{name}.png` is still used for shop icons.
- In the shop, white dots mark junctions (`PathPreview`, `src/engine/path/army/path-preview.ts`).
- In battle, the battle tiles copy the recruit's directions. Directions on the enemy side are reversed, since that half of the grid is rotated by π.

The straight and turn images in `public/resources/path/` are placeholders cut from the full textures. When replacing them, keep the same layout: straight is vertical, and turn connects up and right.

## Code map

| What | Where |
|---|---|
| Directions, junctions, path following, right-click changes | `PathNetwork`, `src/engine/path/army/path-network.ts` |
| Army entry points: `pathNetwork`, `path`, `partialPath`, `pathJunctions`, `refreshPathConnections`, `cyclePathAt` | `src/engine/army/army.ts` |
| `connectionChoice`, reset on move | `PathTile`, `src/engine/tile/recruit/tile.ts` |
| `pathConnections` and the image choice | `TPathConnections` and `TPathShape`, `src/engine/tile/path-shape.ts` |
| Generic image swap hook used by `TImageDrawable` | `TImageVariant`, `src/shared/traits/render/image-variant.ts` |
| Image resources | `PathResources`, `src/renderer/resources/path.resources.ts` |
| Right-click handling | `ShopInputToIntentTranslator.handleMouseRightClick` |
| Per-frame refresh in the shop | `ShopPhase.getPathPreview` |
| Battle tiles and battle path | `Battlefield` constructor, `BattlePath.toAllied` / `toEnemy` |

`refreshPathConnections` must run before tiles are drawn or turned into battle tiles. The shop calls it every frame, and the `Battlefield` calls it for both armies.

## Limits

- The default for a junction comes from listing every complete route over the tiles. The list is capped at 256 routes and cached until the tile layout changes, so on a very large block of tiles the default may not be the true shortest route.
- Only junctions get a dot. The tiles next to them that can also be right-clicked are not marked.
