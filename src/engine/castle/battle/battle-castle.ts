import { CastleBlueprint } from "../blueprint/castle";
import { Castle } from "../recruit/castle-recruit";
import { Cell, GridPosition } from "../../../shared/position";
import { HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { Derive } from "@ddd-ts/traits";
import { TPhysics } from "../../../shared/traits/engine/core/physics";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { GridElement } from "../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../shared/traits/render/renderable";

export class BattleCastle extends Derive(HTHitbox, TRenderable, HTImageDrawable, TPhysics, GridElement) {
	public actualLife: number;
	public maxLife: number;

	constructor(
		recruit: Castle<CastleBlueprint>,
		public onDeath: () => void,
		public cell: Cell,
		public position: GridPosition,

		public override orientation: number,
	) {
		super({ imageDrawable: recruit, hitboxHolder: recruit });
		this.actualLife = recruit.maxLife;
		this.maxLife = recruit.maxLife;
		this.angle = this.orientation;
		this.gridShape = recruit.gridShape;
	}

	override takeDamage(damage: number): void {
		this.actualLife = this.actualLife - damage;
		if (!this.isAlive()) {
			this.onDeath();
		}
	}

	isAlive() {
		return this.actualLife > 0;
	}

	tick() {}
}
