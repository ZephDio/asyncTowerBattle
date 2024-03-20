import { Path } from "../engine/path/domain/path";
import { Tower, TowerRecruit } from "../engine/tower/domain/tower";
import { PhysicEntity } from "../engine/physic/physic";
import { BattleTower } from "../engine/physic/tower/entity-tower-physic";
import { BattleCastle } from "../engine/physic/castle/entity-castle-physic";
import { Unit, UnitRecruit } from "../engine/units/domain/units";

export type GameState = {
  castles: BattleCastle[];
  towers: BattleTower<TowerRecruit<Tower>>[];
  paths: Path[];
  enemyEntities: PhysicEntity<UnitRecruit<Unit>>[];
};
