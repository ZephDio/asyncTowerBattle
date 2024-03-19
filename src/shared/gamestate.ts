import { Path } from "../engine/path/domain/path"
import { Castle, CastleEntity } from "../engine/castle/domain/castle"
import { Tower, TowerEntity } from "../engine/tower/domain/tower"
import { Unit, UnitEntity } from "../engine/units/domain/units"

export type GameState = {
    castles: CastleEntity<Castle>[],
    towers: TowerEntity<Tower>[],
    paths: Path[],
    enemyEntities: UnitEntity<Unit>[]
}
