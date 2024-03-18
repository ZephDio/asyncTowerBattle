import { Path } from "../engine/path/domain/path"
import { TowerEntity } from "../engine/tower/domain/tower"
import { Unit, UnitEntity } from "../engine/units/domain/units"

export type GameState = {
    towers: TowerEntity[],
    path: Path,
    enemyEntities: UnitEntity<Unit>[]
}
