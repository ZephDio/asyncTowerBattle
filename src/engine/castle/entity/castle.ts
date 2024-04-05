import { Derive } from "@ddd-ts/traits";
import { TImageDrawable } from "../../../shared/traits/drawable";
import { CastleRecruit } from "../recruit/castle-recruit";
import { Resources } from "../../../renderer/resources";
import { HitBox, Rectangle, THitbox } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";

export class Castle extends Derive(
	TImageDrawable(Resources.castle.resource.image, Resources.castle.size, 3),
	THitbox(new HitBox([[new Rectangle({ width: 5, height: 5 }), new Position({ x: 0, y: 0 })]])),
) {
	maxLife = 20;
}

export class CastleRecruitFixture {
	static get allied() {
		return new CastleRecruit(new Castle({}));
	}
	static get enemy() {
		return new CastleRecruit(new Castle({}));
	}
}
