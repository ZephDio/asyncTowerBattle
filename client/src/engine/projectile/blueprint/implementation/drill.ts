import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { ProjectileResources } from "../../../../renderer/resources/projectile.resources";

// The drill flies along the board's y axis, so its hitbox is taller than wide
export class Drill extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 1.9, height: 2.5 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(ProjectileResources.drill.image, ProjectileResources.drill.size, DrawPriority.FlyingGridElement),
) {
	type = "drill" as const;
	constructor(
		public baseSpeed: number = 0.2,
		// Speed gained every tick: the drill picks up pace as it bores on
		public acceleration: number = 0.003,
	) {
		super({});
	}
}
