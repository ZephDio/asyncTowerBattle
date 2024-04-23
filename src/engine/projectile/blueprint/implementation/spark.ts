import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../../shared/hitbox/shapes/ellipse";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";

export class Spark extends Derive(
	THitbox(new HitBox([[new Ellipse({ width: 1, height: 1 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.projectiles.spark.resource.image, Resources.projectiles.spark.size, DrawPriority.FlyingGridElement),
) {
	constructor(public baseSpeed: number = 3) {
		super({});
	}
}
