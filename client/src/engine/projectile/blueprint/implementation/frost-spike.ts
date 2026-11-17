import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../../shared/hitbox/shapes/ellipse";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { ProjectileResources } from "../../../../renderer/resources/projectile.resources";

export class FrostSpike extends Derive(
	THitbox(new HitBox([[new Ellipse({ width: 1.5, height: 2.5 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(ProjectileResources.frostSpike.image, ProjectileResources.rocket.size, DrawPriority.FlyingGridElement),
) {
	type = "frost-spike" as const;
	constructor(public baseSpeed: number = 0.7) {
		super({});
	}
}
