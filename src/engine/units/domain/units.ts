import { Entity } from "../../../shared/entity";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";


export abstract class Unit{
    abstract type : string
}

export class Soldier implements Unit{
    type = 'soldier' as const 
}

export abstract class UnitEntity<U extends Unit> implements Entity{
    abstract unitType: U['type']
    abstract hitbox: HitBox;
    abstract position: Position;
}

export class SoldierEntityUnit implements UnitEntity<Soldier>{
    unitType = 'soldier' as const 
    constructor(public hitbox : HitBox, public position : Position){}
}



export const UnitEntityFixture = {
    soldier : new SoldierEntityUnit(new HitBox([ [new HitShape("ellipse",{ width : 2, height : 2}),{ x : 0 , y : 0} ] ]), { x : 10 , y : 90})
}