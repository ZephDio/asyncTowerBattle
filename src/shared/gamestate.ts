import { ArmyPath } from "../engine/path/entity/path";
import { BattleVerdict } from "../engine/battle-summary/battle-summary";
import { BattleCastle } from "../engine/castle/battle/battle-castle";
import { TowerRecruit } from "../engine/tower/recruit/tower-recruit";
import { HudElement } from "./hud-element";
import { Retail } from "../engine/shop/retail";
import { CastleRecruit } from "../engine/castle/recruit/castle-recruit";
import { AreaEffect } from "../engine/area-effect/area-effect";
import { Grid } from "../engine/grid/grid";
import { TokenDrag } from "../engine/shop/token-drag";
import { Castle } from "../engine/castle/entity/castle";
import { BattleGrid } from "../engine/grid/battle-grid";
import { ImplementsTrait } from "@ddd-ts/traits";
import { AnyBattleTower } from "../engine/tower/battle/battle-tower";
import { AnyBattleUnit } from "../engine/units/recruit/unit-recruit";
import { BattleProjectile } from "../engine/projectile/battle/battle-projectile";
import { AnyBattleTile } from "../engine/tile/battle/battle-tile";

export interface GameState {
  type: string;
  grid: Grid | BattleGrid;
}

export interface SummaryState extends GameState {
  type: "summary";
  battleVerdict: BattleVerdict;
}

export interface BattleState extends GameState {
  type: "battle";
  castles: BattleCastle[];
  towers: AnyBattleTower[];
  paths: AnyBattleTile[];
  grid: BattleGrid;
  units: AnyBattleUnit[];
  areaEffects: AreaEffect[];
  projectiles: BattleProjectile<any>[];
}

export interface ShopState extends GameState {
  type: "shop";
  retail: Retail;

  castle: CastleRecruit<Castle>;
  towers: ImplementsTrait<typeof TowerRecruit>[];
  path: ArmyPath;
  grid: Grid;

  hold: TokenDrag | null;

  hudElements: HudElement[];
}
