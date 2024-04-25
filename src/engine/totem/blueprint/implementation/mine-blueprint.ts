import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../shared/position";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { STANDARD_CELL_SIZE } from "../../../grid/tgrid";
import { TSynergy } from "../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { Rock } from "../../../environment/rock";
import { Mine } from "../../recruit/implementation/mine";

export class MineBlueprint extends Derive(
	TShopBlueprint(15, 10),
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
	TDescriptor,
	TImageDrawable(Resources.totem.mine.resource.image, Resources.totem.mine.size, DrawPriority.NormalGridElement),
	TSynergy,
) {
	description = new Description("Gold Mine", [
		"Shop entered : gain 5 🪙",
		"if ▣ is a rock",
		"",
		"Shop entered : for each",
		"10🪙 you have, gain 1🪙",
	]);

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		if (gridElement instanceof Rock) return true;
		return false;
	};
	override patternEffect: PatternEffect = new PatternEffect(
		[new Cell({ x: 0, y: 1 })],
		this.patternCondition.bind(this),
	);

	toRecruit(cell: Cell) {
		return new Mine(cell, this);
	}
}
