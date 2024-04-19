import { Derive } from "@ddd-ts/traits";
import { TImageDrawable } from "../../../shared/traits/render/image-drawable";
import { Castle } from "../recruit/castle-recruit";
import { Resources } from "../../../renderer/resources";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../shared/position";
import { Description, TDescriptor } from "../../../shared/traits/render/huds/item-descriptor";

export class CastleBlueprint extends Derive(
	TImageDrawable(Resources.castle.resource.image, Resources.castle.size, 3),
	TDescriptor,
	THitbox(new HitBox([[new Rectangle({ width: 5, height: 5 }), new GridPosition({ x: 0, y: 0 })]])),
) {
	maxLife = 20;

	castSpeed = 1;

	description = new Description(
		"Castle",
		["A castle that", "you must protect !", "Builds Tower to protect", "yourself and barracks", "to slay your enemies"],
		{
			health: "20",
		},
	);
}

export class CastleRecruitFixture {
	static get allied() {
		return new Castle(new CastleBlueprint({}), new Cell({ x: 0, y: 5 }));
	}
	static get enemy() {
		return new Castle(new CastleBlueprint({}), new Cell({ x: 0, y: 5 }));
	}
}

export class CastleFactory {
	static get default() {
		return new Castle(new CastleBlueprint({}), new Cell({ x: 0, y: 4 }));
	}

	static get round2() {
		return new Castle(new CastleBlueprint({}), new Cell({ x: 0, y: 5 }));
	}
}
