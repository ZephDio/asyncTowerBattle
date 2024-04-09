import { Cell, Position } from "../../../../shared/position";
import { AnyUnit } from "../../../units/recruit/unit-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Derive } from "@ddd-ts/traits";
import { Cast, Caster } from "../../../../shared/traits/cast";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack-recruit";
import { HTImageDrawable, TUnitPreviewHudRenderable } from "../../../../shared/traits/drawable";
import { HaveStats } from "../../../stats/stats";
import { HTHitbox, TCollider } from "../../../../shared/hitboxes";
import { GridElement } from "../../../../shared/traits/grid-element";

export class BasicBattleBarrack extends Derive(
	TCollider,
	HTHitbox,
	Caster,
	HTImageDrawable,
	TUnitPreviewHudRenderable,
	GridElement,
	HaveStats,
) {
	castCost: number;

	constructor(
		public readonly barrackRecruit: BasicBarrack,
		public readonly position: Position,
		public readonly cell: Cell,
		public spawnPosition: Position,
		public readonly path: BattlePath,
		public readonly hooks: BattleArmyHooks,
		public readonly unitRecruit: AnyUnit,
	) {
		super({
			imageDrawable: barrackRecruit,
			maxHealth: NaN,
			attack: NaN,
			movementSpeed: NaN,
			castSpeed: barrackRecruit.productionSpeed,
			onDeath: () => {},
			hitboxHolder: barrackRecruit,
		});
		this.castCost = unitRecruit.cost;
	}

	tick() {
		super.tickCast();
	}

	casts(): void {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), this.castCost);
	}

	onCastResolve(): void {
		console.log(this.unitRecruit.toBattle(this.spawnPosition.clone(), this.path, this.hooks));
		this.hooks.addUnits(this.unitRecruit.toBattle(this.spawnPosition.clone(), this.path, this.hooks), this);
		this.castInProgress = null;
	}
}
