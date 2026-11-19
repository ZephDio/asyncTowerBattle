import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../../shared/hitbox/shapes/ellipse";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { ProjectileResources } from "../../../../renderer/resources/projectile.resources";

// A spark thrown by the blacksmith's anvil.
export class EmberSpark extends Derive(
	THitbox(new HitBox([[new Ellipse({ width: 1, height: 1 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(
		ProjectileResources.emberSpark.image,
		ProjectileResources.emberSpark.size,
		DrawPriority.FlyingGridElement,
	),
) {
	constructor(public baseSpeed: number = 3) {
		super({});
	}
}
