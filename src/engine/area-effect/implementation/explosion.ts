import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { AreaEffect } from "../area-effect";

export class Explosion implements AreaEffect {
	type = "explosion" as const;
	hitbox: HitBox;
	constructor(
		public MaxSize: Size,
		public position: Position,
		public damage: number,
		public hooks: BattleArmyHooks,
	) {
		this.hitbox = new HitBox([[new HitShape("ellipse", { width: 1, height: 1 }), { x: 0, y: 0 }]]);
	}

	tick() {
		const explosionShape = this.hitbox.hitShapes[0]?.[0] || { size: { width: 0, height: 0 } };
		explosionShape.size.width++;
		explosionShape.size.height++;
		if (explosionShape.size.width > this.MaxSize.width) {
			const enemies = this.hooks.searchEnemyInArea(this.position, this.hitbox);
			for (const enemy of enemies) {
				enemy.isAttacked(this.damage);
			}
			this.hooks.removeAreaEffect(this);
		}
	}

	get size() {
		return this.hitbox.hitShapes[0]?.[0]?.size || { width: 0, height: 0 };
	}
}
