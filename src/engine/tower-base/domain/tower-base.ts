import { Position } from "../../../shared/position"

const BasePosition = {
    'enemy': { x: 10, y: 90 },
    'allied': { x: 90, y: 10 }
}


type Team = 'allied' | 'enemy'

export class TowerBase {
    constructor(public team: Team) { }
}

export class TowerBaseEntity<TB extends TowerBase>{
    position: Position
    constructor(tower: TB) {
        this.position = BasePosition[tower.team]
    }
}