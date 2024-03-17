import { Path } from "../engine/path/domain/path"
import { Tower } from "../engine/tower/domain/tower"
import { Unit, UnitEntity } from "../engine/units/domain/units"

export type GameState = {
    towers : Tower[],
    path : Path,
    enemyEntities : UnitEntity<Unit>[]
}
