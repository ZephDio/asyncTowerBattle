import { Derive } from "@ddd-ts/traits";
import { Ellipse, HitBox, TCollider, THitbox } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TRenderable } from "../../../shared/traits/drawable";
import { TDrawable } from "../../../shared/traits/tdrawable";

export class Explosion extends Derive(
	TCollider,
	THitbox(new HitBox([[new Ellipse({ width: 1, height: 1 }), new Position({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	type = "explosion" as const;
	drawPriority = 5;
	constructor(
		public MaxSize: Size,
		public position: Position,
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
				enemy.takeDamage(this.damage);
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

	draw(context: CanvasRenderingContext2D, position: Position): void {
		context.strokeStyle = "red";
		context.fillStyle = "transparent";
		context.lineWidth = 11;
		context.globalAlpha = 1;
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawEllipse(context, size, canvasPosition);
	}
}
