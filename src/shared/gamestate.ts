import { Path } from "../engine/path/entity/path";
import { BattleVerdict } from "../engine/battle-summary/battle-summary";
import { BattleCastle } from "../engine/castle/battle/battle-castle";
import { BattleTower } from "../engine/tower/battle/battle-tower";
import { TowerRecruit } from "../engine/tower/recruit/tower-recruit";
import { Tower } from "../engine/tower/entity/tower";
import { PhysicEntity } from "../engine/physic/physic";
import { UnitRecruit } from "../engine/units/recruit/unit-recruit";
import { Unit } from "../engine/units/entity/units";

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
