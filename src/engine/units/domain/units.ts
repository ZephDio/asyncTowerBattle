import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Recruit } from "../../physic/physic";

export abstract class Unit {
  abstract type: string;
  abstract hitbox: HitBox;
}

export class Soldier extends Unit {
  baseMaxLife = 6
  baseSpeed = 1
  type = "soldier" as const;
  hitbox = new HitBox([
    [new HitShape("ellipse", { width: 2, height: 2 }), { x: 0, y: 0 }],
  ]);
}

export abstract class UnitRecruit<U extends Unit> implements Recruit {
  abstract maxLife: number
  abstract speed: number
  abstract type: U["type"];
  abstract hitbox: HitBox;
}

export class SoldierRecruit extends UnitRecruit<Soldier> {
  hitbox: HitBox
  speed: number
  maxLife: number
  constructor(soldier: Soldier) {
    super()
    this.hitbox = soldier.hitbox
    this.maxLife = soldier.baseMaxLife
    this.speed = soldier.baseSpeed
  }
  type = "soldier" as const;
}

export const UnitEntityFixture = {
  soldier: new SoldierRecruit(new Soldier()),
};
