import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { SlowingTrap } from "../../recruit/implementation/slowing-trap";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { STANDARD_CELL_SIZE } from "../../../grid/tgrid";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { PathResources } from "../../../../renderer/resources/path.resources";

export class SlowingTrapBlueprint extends Derive(
	TShopBlueprint(10, 3),
	TImageDrawable(PathResources.slowing.straight, PathResources.slowing.size, DrawPriority.CarpetStyleGridElement),
	TDescriptor,
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
) {
	description = new Description("Mud Trap", ["Place it on a path tile.", "Slows stepping", "enemies by 30%"]);

	toRecruit(cell: Cell) {
		return new SlowingTrap(cell, this);
	}
}
