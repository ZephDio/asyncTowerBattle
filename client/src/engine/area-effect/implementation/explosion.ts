import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../shared/hitbox/shapes/ellipse";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { GridPosition, ScreenPosition } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";

export class Explosion extends Derive(
	TCollider,
	THitbox(new HitBox([[new Ellipse({ width: 1, height: 1 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	type = "explosion" as const;
	drawPriority = DrawPriority.NormalGridElement;
	constructor(
		public MaxSize: Size,
		public position: GridPosition,
		public damage: number,
		public hooks: BattleArmyHooks,
	) {
		super({});
	}

	tick() {
		const explosionShape = this.hitbox.hitShapes[0]?.[0] as Ellipse;
		explosionShape.rx += 0.5;
		explosionShape.ry += 0.5;
		if (this.size.width > this.MaxSize.width) {
			const enemies = this.hooks.searchEnemyInArea(this.position, this.hitbox);
			for (const enemy of enemies) {
				enemy.takeHit(this.damage);
			}
			this.hooks.removeAreaEffect(this);
		}
	}

	get size() {
		return {
			width: (this.hitbox.hitShapes[0]?.[0] as Ellipse).rx * 2,
			height: (this.hitbox.hitShapes[0]?.[0] as Ellipse).ry * 2,
		};
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.strokeStyle = "red";
		context.fillStyle = "transparent";
		context.lineWidth = 11;
		context.globalAlpha = 1;
		const size = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawEllipse(context, size, canvasPosition, scale);
	}
}
