import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../shared/hitbox/shapes/ellipse";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { GridPosition, ScreenPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";

import { Poisoned } from "../../tower/battle/implementation/battle-yellow-tower";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { STANDARD_CELL_SIZE } from "../../grid/tgrid";

export class PoisonGround extends Derive(
	TDrawable,
	TRenderable,
	TCollider,
	THitbox(
		new HitBox([
			[new Ellipse({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
) {
	type = "poison-ground" as const;
	drawPriority = 5;
	clock = 0;
	constructor(
		public maxDuration: number,
		public position: GridPosition,
		public damage: number,
		public hooks: BattleArmyHooks,
	) {
		super({});
	}

	tick() {
		if (this.clock++ > this.maxDuration) {
			this.hooks.removeAreaEffect(this);
			return;
		}
		const enemies = this.hooks.searchEnemyInArea(this.position, this.hitbox);
		for (const enemy of enemies) {
			enemy.addStatus(new Poisoned(this.damage));
		}
	}

	get size() {
		return {
			width: (this.hitbox.hitShapes[0]?.[0] as Ellipse).rx * 2,
			height: (this.hitbox.hitShapes[0]?.[0] as Ellipse).ry * 2,
		};
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.globalAlpha = 0.18;
		context.strokeStyle = "purple";
		context.fillStyle = "purple";
		context.lineWidth = 11;
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawEllipse(context, size, canvasPosition, scale);
	}
}
