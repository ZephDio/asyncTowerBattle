import { HitBox } from "../../../shared/hitboxes";
import { Cell } from "../../../shared/position";
import { Projectile } from "../../projectile/entity/projectile";
import { BlueTower } from "./implementation/blue-tower";
import { GreenTower } from "./implementation/green-tower";
import { OrangeTower } from "./implementation/orange-tower";
import { YellowTower } from "./implementation/yellow-tower";

export abstract class Tower {
  abstract type: string;
  abstract hitbox: HitBox;
  abstract projectile?: Projectile;
  abstract patternEffect: Cell[];
}

export type AnyTower = BlueTower | GreenTower | OrangeTower | YellowTower;
