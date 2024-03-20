import { Path } from "../engine/path/domain/path";
import { Tower, TowerRecruit } from "../engine/tower/domain/tower";
import { PhysicEntity } from "../engine/physic/physic";
import { BattleTower } from "../engine/physic/tower/entity-tower-physic";
import { BattleCastle } from "../engine/physic/castle/battle-castle";
import { Unit, UnitRecruit } from "../engine/units/domain/units";
import { BattleVerdict } from "../engine/battle-summary/battle-summary";

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
  enemyEntities: PhysicEntity<UnitRecruit<Unit>>[];
}
