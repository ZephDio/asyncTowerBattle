import { Derive } from "@ddd-ts/traits";
import { Status } from "../../../shared/traits/engine/status";
import { Stats } from "../stats";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { ScreenPosition } from "../../../shared/position";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { IconResources } from "../../../renderer/resources/icons.resources";

// A permanent boon that makes a unit eat more: its food upkeep (BattleUnit.consumeFood, every 2 seconds) costs
// `extraFood` more for as long as it lives. The unit pays it with its upkeep, so with too little food it goes hungry
// like any other unit. Drawn as a small corn over the unit.
export class Ravenous extends Derive(Status, TDrawable) {
	key = "ravenous" as const;
	clock = 0;
	duration = Infinity;
	stats: Stats;
	override drawPriority = DrawPriority.FlyingGridElement;

	constructor(public readonly extraFood: number = 1) {
		super({});
	}

	private applied = false;

	// Applied on the unit's first tick, before its first meal, like VeterantBuff: a second Ravenous given to the same
	// unit only reaches stack() and never adds its food.
	tick() {
		this.clock++;
		if (this.applied) return;
		this.stats.addFlat("foodCost", this.extraFood);
		this.applied = true;
	}

	stack(_status: Ravenous) {}

	onRemove() {
		if (this.applied) this.stats.addFlat("foodCost", -this.extraFood);
		this.applied = false;
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const size = this.getCanvasSize(context, 1.6, 1.6, scale);
		const center = this.getCanvasPosition(context, position);
		const image = IconResources.food.image;
		if (!image.complete) return;
		this.drawImage(context, size, { x: center.x + size.width, y: center.y - size.height }, image);
	}
}
