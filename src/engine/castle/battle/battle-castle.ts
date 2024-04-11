import { CastleBlueprint } from "../blueprint/castle";
import { Castle } from "../recruit/castle-recruit";
import { Cell, GridPosition } from "../../../shared/position";
import { BattleGrid } from "../../grid/battle-grid";
import { HTImageDrawable } from "../../../shared/traits/drawable";
import { Derive } from "@ddd-ts/traits";
import { TPhysics } from "../../../shared/traits/physics";
import { HTHitbox } from "../../../shared/hitboxes";
import { GridElement } from "../../../shared/traits/grid-element";
import { TRenderable } from "../../../shared/traits/trenderable";

export class BattleCastle extends Derive(HTHitbox, TRenderable, HTImageDrawable, TPhysics, GridElement) {
	public actualLife: number;
	public maxLife: number;

	constructor(
		recruit: Castle<CastleBlueprint>,
		public onDeath: () => void,
		public cell: Cell,
		public position: GridPosition,
	) {
		super({ imageDrawable: recruit, hitboxHolder: recruit });
		this.actualLife = recruit.maxLife;
		this.maxLife = recruit.maxLife;
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

	static toAllied(castleRecruit: Castle<CastleBlueprint>, battleGrid: BattleGrid, onBattleOver: () => void) {
		return new BattleCastle(castleRecruit, onBattleOver, castleRecruit.cell, battleGrid.cellToGrid(castleRecruit.cell));
	}

	static toEnemy(castleRecruit: Castle<CastleBlueprint>, battleGrid: BattleGrid, onBattleOver: () => void) {
		const flippedGridPosition = BattleGrid.flip(battleGrid, castleRecruit.cell);
		return new BattleCastle(
			castleRecruit,
			onBattleOver,
			flippedGridPosition,
			battleGrid.cellToGrid(flippedGridPosition),
		);
	}
}
