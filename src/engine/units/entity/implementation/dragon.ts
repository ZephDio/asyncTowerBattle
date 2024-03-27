import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Unit } from "../units";

export class Dragon extends Unit {
	baseMaxLife = 18;
	baseSpeed = 0.25;
	attackSpeed = 2;
	attackDamage = 4;
	type = "dragon" as const;
	hitbox = new HitBox([[new HitShape("ellipse", { width: 3, height: 3 }), { x: 0, y: 0 }]]);
}
