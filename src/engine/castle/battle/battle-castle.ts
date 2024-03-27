import { Castle } from "../entity/castle";
import { PhysicEntity } from "../../../shared/physic";
import { CastleRecruit } from "../recruit/castle-recruit";
import { GridPosition, Position } from "../../../shared/position";
import { BattleGrid } from "../../grid/battle-grid";

export class BattleCastle extends PhysicEntity<CastleRecruit<Castle>> {
	public actualLife: number;
	public maxLife: number;

	constructor(
		castleEntity: CastleRecruit<Castle>,
		public onDeath: Function,
		public gridPosition: GridPosition,
		position: Position,
	) {
		super(castleEntity, position, 0, "castle");
		this.actualLife = castleEntity.maxLife;
		this.maxLife = castleEntity.maxLife;
		this.gridPosition = castleEntity.gridPosition;
	}

	isAttacked(damage: number): void {
		this.actualLife = this.actualLife - damage;
		if (!this.isAlive()) {
			this.onDeath();
		}
	}

	isAlive() {
		return this.actualLife > 0;
	}

	tick() {}

	toSerialized(): SerializedBattleCastle {
		return {
			type: this.type,
			gridPosition: this.gridPosition,
			position: this.position,
		};
	}

	static toAllied(castleRecruit: CastleRecruit<Castle>, battleGrid: BattleGrid, onBattleOver: Function) {
		return new BattleCastle(
			castleRecruit,
			onBattleOver,
			castleRecruit.gridPosition,
			battleGrid.gridPositionToReal(castleRecruit.gridPosition),
		);
	}

	static toEnemy(castleRecruit: CastleRecruit<Castle>, battleGrid: BattleGrid, onBattleOver: Function) {
		const flippedGridPosition = BattleGrid.flip(battleGrid, castleRecruit.gridPosition);
		return new BattleCastle(
			castleRecruit,
			onBattleOver,
			flippedGridPosition,
			battleGrid.gridPositionToReal(flippedGridPosition),
		);
	}
}

export type SerializedBattleCastle = {
	type: string;
	gridPosition: GridPosition;
	position: Position;
};
