import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { Ellipse, HitBox, THitbox } from "../../../../shared/hitboxes";
import { GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";

export class Rocket extends Derive(
	THitbox(new HitBox([[new Ellipse({ width: 1, height: 1 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.projectiles.rocket.resource.image, Resources.projectiles.rocket.size, 3),
) {
	type = "rocket" as const;
	constructor(public baseSpeed: number = 0.7) {
		super({});
	}
}
