import { Derive } from "@ddd-ts/traits";
import { Stats } from "../stats";
import { secondsToFrame } from "../../../shared/seconds";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { ScreenPosition } from "../../../shared/position";
import { StatusResources } from "../../../renderer/resources/status.resources";
import { Status } from "../../../shared/traits/engine/status";

export class Rooted extends Derive(Status, TDrawable) {
	key = "rooted" as const;
	override clock: number = 0;
	override stats: Stats;

	hasTriggered = false;

	constructor(
		public duration: number = secondsToFrame(3),
		public intensity: number = 60,
	) {
		super({});
	}

	tick() {
		if (!this.hasTriggered) {
			this.stats.basePercentStat.castSpeed -= this.intensity;
			this.hasTriggered = true;
		}
		this.clock++;
		if (this.clock >= this.duration) {
			this.stats.removeCondition(this);
		}
	}

	override stack(status: Rooted): void {
		this.duration += status.duration;
	}

	override onRemove(): void {
		this.stats.basePercentStat.castSpeed += this.intensity;
	}

	override drawPriority: DrawPriority.FlyingGridElement;

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const size = this.getCanvasSize(context, 3 * scale, 3 * scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, size, canvasPosition, StatusResources.rooted.image);
		context.globalAlpha = 1;
	}
}
