import { HitBox } from "../../../shared/hitboxes";
import { Projectile } from "../../projectile/entity/projectile";
import { BlueTower } from "./implementation/blue-tower";
import { GreenTower } from "./implementation/green-tower";
import { OrangeTower } from "./implementation/orange-tower";

export abstract class Tower {
	abstract type: string;
	abstract hitbox: HitBox;
	abstract projectile?: Projectile;
}

export type AnyTower = BlueTower | GreenTower | OrangeTower;
