import { Position } from "../../../shared/position"

const CastlePosition = {
    'enemy': { x: 10, y: 90 },
    'allied': { x: 90, y: 10 }
}


type Team = 'allied' | 'enemy'

export class Castle {
    constructor(public team: Team) { }
}

export class CastleEntity<TB extends Castle>{
    position: Position
    constructor(tower: TB) {
        this.position = CastlePosition[tower.team]
    }
}