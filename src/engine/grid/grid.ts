import { proportion } from "../../renderer/implementation/canvas-renderer"
import { GridPosition, Position } from "../../shared/position"
import { BattleCastle } from "../castle/battle/battle-castle"
import { Castle } from "../castle/entity/castle"
import { CastleRecruit } from "../castle/recruit/castle-recruit"
import { BattleTower } from "../tower/battle/battle-tower"
import { Tower } from "../tower/entity/tower"
import { TowerRecruit } from "../tower/recruit/tower-recruit"

export class PathTile {
    gridPosition: GridPosition
}
export type GridElement = TowerRecruit<Tower> | PathTile | CastleRecruit<Castle>
export type BattleGridElement = BattleTower<TowerRecruit<Tower>> | PathTile | BattleCastle

export class Grid {
    grid: Map<number, Map<number, GridElement>>

    constructor(public width: number = 16, public height: number = 6, public position: Position = { x: 5, y: 5 }, public tileSize = 5.5) { }

    gridPositionToReal(gridPosition: GridPosition) {
        return {
            x: this.position.x + ((gridPosition.gridX + 0.5) * this.tileSize),
            y: this.position.y + ((gridPosition.gridY + 0.5) * this.tileSize)
        }
    }

    setElement(gridElement: GridElement) {
        //this.grid.set(gridElement.gridPosition.x)
    }


}

export class BattleGrid {
    grid: Map<number, Map<number, BattleGridElement>>
    constructor(public width: number, public height: number, public position: Position = { x: 5, y: 5 }, public tileSize = 5.5) { }

    gridPositionToReal(gridPosition: GridPosition) {
        return {
            x: this.position.x + ((gridPosition.gridX + 0.5) * this.tileSize),
            y: this.position.y + ((gridPosition.gridY + 0.5) * this.tileSize)
        }
    }

    static fuse(gridAllied: Grid, gridEnemy: Grid): BattleGrid {
        if (gridAllied.width !== gridEnemy.width || gridAllied.height !== gridEnemy.height) {
            throw new Error('cannot fuse grid with different grid size')
        }
        return new BattleGrid(gridAllied.width, gridAllied.height + gridEnemy.height)
    }

}
