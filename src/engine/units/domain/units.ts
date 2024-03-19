import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { Entity } from "../../../shared/entity";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";

export abstract class Unit {
  abstract type: string;
  abstract hitbox: HitBox
}

export class Soldier implements Unit {
  type = "soldier" as const;
  hitbox = new HitBox([
    [new HitShape("ellipse", { width: 2, height: 2 }), { x: 0, y: 0 }],
  ])
}

export abstract class UnitEntity<U extends Unit> extends Entity {
  abstract unitType: U["type"];
}

export class SoldierEntityUnit extends UnitEntity<Soldier> {
  unitType = "soldier" as const;
  hitbox = new Soldier().hitbox
}

export const UnitEntityFixture = {
  soldier: new SoldierEntityUnit(),
};
