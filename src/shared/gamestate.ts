import { Path } from "../engine/path/domain/path"
import { TowerBase, TowerBaseEntity } from "../engine/tower-base/domain/tower-base"
import { Tower, TowerEntity } from "../engine/tower/domain/tower"
import { Unit, UnitEntity } from "../engine/units/domain/units"

export type GameState = {
    towerBase: TowerBaseEntity<TowerBase>[],
    towers: TowerEntity<Tower>[],
    path: Path,
    enemyEntities: UnitEntity<Unit>[]
}
