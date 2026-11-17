import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../shared/hitbox/shapes/ellipse";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { GridPosition, ScreenPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { UnitResources } from "../../../renderer/resources/unit.resources";

// An antler the white stag dropped: it lies where it fell and heals the allies around it until it fades.
// Same area as the stag's heal wave.
export class FallenAntler extends Derive(
	TDrawable,
	TRenderable,
	TCollider,
	THitbox(new HitBox([[new Ellipse({ width: 9, height: 9 }), new GridPosition({ x: 0, y: 0 })]])),
) {
	type = "fallen-antler" as const;
	drawPriority = DrawPriority.CarpetStyleGridElement;
	clock = 0;
	constructor(
		public maxDuration: number,
		public position: GridPosition,
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
			ally.stats.heal(this.heal);
		}
	}

	get size() {
		return {
			width: (this.hitbox.hitShapes[0]?.[0] as Ellipse).rx * 2,
			height: (this.hitbox.hitShapes[0]?.[0] as Ellipse).ry * 2,
		};
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const canvasPosition = this.getCanvasPosition(context, position);
		context.globalAlpha = 0.12;
		context.strokeStyle = "green";
		context.fillStyle = "lime";
		context.lineWidth = 11;
		this.drawEllipse(context, this.getCanvasSize(context, this.size.width, this.size.height), canvasPosition, scale);
		context.globalAlpha = 1;
		const antler = UnitResources.whiteStagAntler;
		const size = this.getCanvasSize(context, antler.size.width, antler.size.height, scale);
		this.drawImage(context, size, canvasPosition, antler.image);
	}
}
