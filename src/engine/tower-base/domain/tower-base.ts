import { Position } from "../../../shared/position"

const BasePosition = {
    'enemy': { x: 10, y: 90 },
    'allied': { x: 90, y: 10 }
}


type Team = 'allied' | 'enemy'

export class TowerBase {

    position: Position
    constructor(team: Team) {
        this.position = BasePosition[team]
    }
}

export class TowerBaseEntity<TowerBase>{

}