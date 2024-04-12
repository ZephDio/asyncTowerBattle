import { Derive } from "@ddd-ts/traits";
import { TImageDrawable } from "../../../shared/traits/render/image-drawable";
import { Castle } from "../recruit/castle-recruit";
import { Resources } from "../../../renderer/resources";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../shared/position";

export class CastleBlueprint extends Derive(
	TImageDrawable(Resources.castle.resource.image, Resources.castle.size, 3),
	THitbox(new HitBox([[new Rectangle({ width: 5, height: 5 }), new GridPosition({ x: 0, y: 0 })]])),
) {
	maxLife = 20;
}

export class CastleRecruitFixture {
	static get allied() {
		return new Castle(new CastleBlueprint({}));
	}
	static get enemy() {
		return new Castle(new CastleBlueprint({}));
	}
}
