import { Derive } from "@ddd-ts/traits";
import { Ellipse, HitBox, TCollider, THitbox } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TRenderable } from "../../../shared/traits/drawable";
import { TDrawable } from "../../../shared/traits/tdrawable";

export class HealWave extends Derive(
	TDrawable,
	TRenderable,
	TCollider,
	THitbox(new HitBox([[new Ellipse({ width: 9, height: 9 }), new Position({ x: 0, y: 0 })]])),
) {
	type = "heal-wave" as const;
	drawPriority = 5;
	clock = 0;
	constructor(
		public maxDuration: number,
		public position: Position,
		public heal: number,
		public hooks: BattleArmyHooks,
	) {
		super({});
	}

	tick() {
		if (this.clock++ > this.maxDuration) {
			this.hooks.removeAreaEffect(this);
			return;
		}
		const allies = this.hooks.searchAlliesInArea(this.position, this.hitbox);
		for (const ally of allies) {
			ally.stats.heal(this.heal)
		}
	}

	get size() {
		return {
			width: (this.hitbox.hitShapes[0]?.[0] as Ellipse).rx * 2,
			height: (this.hitbox.hitShapes[0]?.[0] as Ellipse).ry * 2,
		};
	}

	draw(context: CanvasRenderingContext2D, position: Position): void {
		context.globalAlpha = 0.18;

		context.strokeStyle = "green";
		context.fillStyle = "lime";
		context.lineWidth = 11;
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawEllipse(context, size, canvasPosition);
	}
}
