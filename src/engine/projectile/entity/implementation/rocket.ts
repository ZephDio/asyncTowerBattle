import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Projectile } from "../projectile";

export class Rocket implements Projectile {
	type = "rocket" as const;
	hitbox = new HitBox([[new HitShape("ellipse", { width: 1, height: 1 }), { x: 0, y: 0 }]]);
	constructor(public baseSpeed: number = 0.7) {}
}
