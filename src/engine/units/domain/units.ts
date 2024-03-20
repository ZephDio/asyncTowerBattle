import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Recruit } from "../../physic/physic";

export abstract class Unit {
  abstract type: string;
  abstract hitbox: HitBox;
}

export class Soldier extends Unit {
  type = "soldier" as const;
  hitbox = Soldier.hitbox;
  static hitbox = new HitBox([
    [new HitShape("ellipse", { width: 2, height: 2 }), { x: 0, y: 0 }],
  ]);
}

export abstract class UnitRecruit<U extends Unit> implements Recruit {
  abstract type: U["type"];
  abstract hitbox: HitBox;
}

export class SoldierRecruit extends UnitRecruit<Soldier> {
  type = "soldier" as const;
  hitbox = Soldier.hitbox;
}

export const UnitEntityFixture = {
  soldier: new SoldierRecruit(),
};
