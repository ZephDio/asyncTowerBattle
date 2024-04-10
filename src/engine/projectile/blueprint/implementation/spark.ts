import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { Ellipse, HitBox, THitbox } from "../../../../shared/hitboxes";
import { GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";

export class Spark extends Derive(
	THitbox(new HitBox([[new Ellipse({ width: 1, height: 1 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.projectiles.spark.resource.image, Resources.projectiles.spark.size, 3),
) {
	constructor(public baseSpeed: number = 3) {
		super({});
	}
}
