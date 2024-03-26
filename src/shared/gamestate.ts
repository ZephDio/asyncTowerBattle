import { Path } from "../engine/path/entity/path";
import { BattleVerdict } from "../engine/battle-summary/battle-summary";
import { BattleCastle, SerializedBattleCastle } from "../engine/castle/battle/battle-castle";
import { BattleTower, SerializedBattleTower } from "../engine/tower/battle/battle-tower";
import { SerializedTowerRecruit, TowerRecruit } from "../engine/tower/recruit/tower-recruit";
import { Tower } from "../engine/tower/entity/tower";
import { PhysicEntity, Recruit } from "./physic";
import { UnitRecruit } from "../engine/units/recruit/unit-recruit";
import { Unit } from "../engine/units/entity/units";
import { Projectile } from "../engine/projectile/entity/projectile";
import { HudElement } from "./hud-element";
import { Retail } from "../engine/shop/retail";
import { Castle } from "../engine/castle/entity/castle";
import { CastleRecruit, SerializedCastleRecruit } from "../engine/castle/recruit/castle-recruit";
import { TowerBuyable } from "../engine/shop/shop";
import { AreaEffect } from "../engine/area-effect/area-effect";
import { Grid } from "../engine/grid/grid";

export interface GameState {
  type: string;
}

export interface SummaryState extends GameState {
  type: "summary";
  battleVerdict: BattleVerdict;
}

export interface BattleState extends GameState {
  type: "battle";
  castles: SerializedBattleCastle[];
  towers: SerializedBattleTower[];
  paths: Path[];
  grid: Grid
  entities: PhysicEntity<UnitRecruit<Unit>>[];
  areaEffects: AreaEffect[]
  projectiles: PhysicEntity<Projectile>[];
}

export interface ShopState extends GameState {
  type: "shop";
  retail: Retail;

  castle: SerializedCastleRecruit;
  towers: SerializedTowerRecruit[];
  path: Path;
  grid: Grid

  hold: null | TowerBuyable<TowerRecruit<Tower>>;

  hudElements: HudElement[];
}
