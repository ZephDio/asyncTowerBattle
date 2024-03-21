import { Path } from "../engine/path/entity/path";
import { BattleVerdict } from "../engine/battle-summary/battle-summary";
import { BattleCastle } from "../engine/castle/battle/battle-castle";
import { BattleTower } from "../engine/tower/battle/battle-tower";
import { TowerRecruit } from "../engine/tower/recruit/tower-recruit";
import { Tower } from "../engine/tower/entity/tower";
import { PhysicEntity } from "../engine/physic/physic";
import { UnitRecruit } from "../engine/units/recruit/unit-recruit";
import { Unit } from "../engine/units/entity/units";
import { Projectile } from "../engine/projectile/entity/projectile";
import { Buyable } from "../engine/shop/shop";

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
  projectiles: PhysicEntity<Projectile>[];
}

export interface ShopState extends GameState {
  type: "shop";
  buyables: Buyable[];
}
