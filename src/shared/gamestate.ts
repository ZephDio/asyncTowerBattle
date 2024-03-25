import { Path } from "../engine/path/entity/path";
import { BattleVerdict } from "../engine/battle-summary/battle-summary";
import { BattleCastle } from "../engine/castle/battle/battle-castle";
import { BattleTower } from "../engine/tower/battle/battle-tower";
import { TowerRecruit } from "../engine/tower/recruit/tower-recruit";
import { Tower } from "../engine/tower/entity/tower";
import { PhysicEntity, Recruit } from "./physic";
import { UnitRecruit } from "../engine/units/recruit/unit-recruit";
import { Unit } from "../engine/units/entity/units";
import { Projectile } from "../engine/projectile/entity/projectile";
import { HudElement } from "./hud-element";
import { Retail } from "../engine/shop/retail";
import { Castle } from "../engine/castle/entity/castle";
import { CastleRecruit } from "../engine/castle/recruit/castle-recruit";
import { TowerBuyable } from "../engine/shop/shop";
import { AreaEffect } from "../engine/area-effect/area-effect";

export interface GameState {
  type: string;
}

export interface SummaryState extends GameState {
  type: "summary";
  battleVerdict: BattleVerdict;
}

export interface BattleState extends GameState {
  type: "battle";
  castles: BattleCastle[];
  towers: BattleTower<TowerRecruit<Tower>>[];
  paths: Path[];
  entities: PhysicEntity<UnitRecruit<Unit>>[];
  areaEffects: AreaEffect[]
  projectiles: PhysicEntity<Projectile>[];
}

export interface ShopState extends GameState {
  type: "shop";
  retail: Retail;

  castle: CastleRecruit<Castle>;
  towers: TowerRecruit<Tower>[];
  path: Path;

  hold: null | TowerBuyable<TowerRecruit<Tower>>;

  hudElements: HudElement[];
}
