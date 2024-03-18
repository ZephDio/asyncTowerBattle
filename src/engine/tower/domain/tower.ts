import { Entity } from "../../../shared/entity";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";

export abstract class Tower {
    abstract type: 'orange' | 'blue' | 'green'
    abstract hitbox: HitBox
}

export class BlueTower implements Tower {
    type = 'blue' as const
    hitbox = new HitBox([[new HitShape('ellipse', { width: 5, height: 10 }), { x: 0, y: 0 }]])
}
export class GreenTower implements Tower {
    type = 'green' as const
    hitbox = new HitBox([[new HitShape('rectangle', { width: 4, height: 6 }), { x: 0, y: 0 }]])
}
export class OrangeTower implements Tower {
    type = 'orange' as const
    hitbox = new HitBox([[new HitShape('ellipse', { width: 5, height: 5 }), { x: 0, y: 0 }]])
}

export class TowerEntity<T extends Tower> implements Entity {
    type: T['type']
    hitbox: HitBox
    constructor(public position: Position, public tower: T) {
        this.type = tower.type
        this.hitbox = tower.hitbox
    }
}


export class TowerEntityFixtures {
    static centerTower = new TowerEntity({ x: 50, y: 50 }, new BlueTower())
    static topRightTower = new TowerEntity({ x: 80, y: 80 }, new OrangeTower())
    static BottomRightTower = new TowerEntity({ x: 30, y: 30 }, new GreenTower())
}