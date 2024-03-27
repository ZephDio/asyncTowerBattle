import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Unit } from "../units";

export class Soldier extends Unit {
	baseMaxLife = 6;
	baseSpeed = 0.32;
	attackSpeed = 5;
	attackDamage = 1;
	type = "soldier" as const;
	hitbox = new HitBox([[new HitShape("ellipse", { width: 2, height: 2 }), { x: 0, y: 0 }]]);
}
