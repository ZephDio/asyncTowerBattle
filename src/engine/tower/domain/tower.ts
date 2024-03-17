import { proportion } from "../../../renderer/implementation/canvas-renderer";
import { Entity } from "../../../shared/entity";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";


export class Tower implements Entity{
    constructor(public position: Position,public type: string, public hitbox: HitBox){}
}


export class TowerFixtures {
    static centerTower = new Tower ({x:50, y:50}, "orange", new HitBox([[new HitShape('ellipse',{ width : 5 , height : 5}), { x : 0 , y : 0}]]))
    static topRightTower = new Tower ({x:80, y:80}, "blue", new HitBox([[new HitShape('ellipse',{ width : 5 , height : 10}), { x : 0 , y : 0}]]))
    static BottomRightTower = new Tower ({x:30, y:30}, "green", new HitBox([[new HitShape('rectangle',{ width : 4 , height : 6}), { x : 0 , y : 0}]]))
}