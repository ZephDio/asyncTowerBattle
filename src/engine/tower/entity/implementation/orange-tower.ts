import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Tower } from "../tower";

export class OrangeTower extends Tower {
	type = "orange" as const;
	hitbox = new HitBox([[new HitShape("ellipse", { width: 5, height: 5 }), { x: 0, y: 0 }]]);
	projectile = undefined;
}
