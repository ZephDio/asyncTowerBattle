import { PercentToReal } from "../../../renderer/implementation/canvas-renderer"
import { Entity } from "../../../shared/entity"
import { HitBox, HitShape } from "../../../shared/hitboxes"
import { Position } from "../../../shared/position"

const CastlePosition = {
    'enemy': PercentToReal({ x: 10, y: 90 }),
    'allied': PercentToReal({ x: 90, y: 10 })
}


type Team = 'allied' | 'enemy'

export class Castle {
    constructor(public team: Team) { }
}

export class CastleEntity<TB extends Castle> implements Entity {
    position: Position
    maxLife = 20
    actualLife = 20
    hitbox = new HitBox([[new HitShape('rectangle', { width: 5, height: 5 }), { x: 0, y: 0 }]])
    constructor(public castle: TB) {
        this.position = CastlePosition[castle.team]
    }

    damage(damage: number) {
        this.actualLife = this.actualLife - damage
        console.log('OUILLE')
        if (this.actualLife === 0) console.log('MORT')
    }

    clone() {
        return new CastleEntity(new Castle(this.castle.team))
    }
}

export const CastleEntityFixture = {
    allied: new CastleEntity(new Castle('allied')),
    enemy: new CastleEntity(new Castle('enemy'))
}