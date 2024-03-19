import { Path } from "../engine/path/domain/path";
import { Castle, CastleRecruit } from "../engine/castle/domain/castle";
import { Tower, TowerRecruit } from "../engine/tower/domain/tower";
import { Unit, UnitRecruit } from "../engine/units/domain/units";
import { PhysicEntity } from "../engine/physic/physic";

export type GameState = {
  castles: CastleRecruit<Castle>[];
  towers: TowerRecruit<Tower>[];
  paths: Path[];
  enemyEntities: PhysicEntity<UnitRecruit<Unit>>[];
};
