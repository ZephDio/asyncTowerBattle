import { Cell, Position } from "../../../../shared/position";
import { AnyRecruitUnit } from "../../../units/recruit/unit-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Derive } from "@ddd-ts/traits";
import { Cast, Caster } from "../../../../shared/traits/cast";
import { BasicBarrackRecruit } from "../../recruit/implementation/basic-barrack-recruit";
import { HTImageDrawable, TUnitPreviewHudRenderable } from "../../../../shared/traits/drawable";
import { GridElement } from "../../../grid/grid";
import { HaveStats } from "../../../stats/stats";
import { HTHitbox, TCollider } from "../../../../shared/hitboxes";

export class BasicBattleBarrack extends Derive(
	TCollider,
	HTHitbox,
	Caster,
	HTImageDrawable,
	TUnitPreviewHudRenderable,
	GridElement,
	HaveStats,
) {
	onGoingProduction = null as null | Cast;

	constructor(
		public readonly barrackRecruit: BasicBarrackRecruit,
		public readonly position: Position,
		public readonly cell: Cell,
		public spawnPosition: Position,
		public readonly path: BattlePath,
		public readonly hooks: BattleArmyHooks,
		public readonly unitRecruit: AnyRecruitUnit,
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
	}

	tick() {
		super.tickCast();
	}

	onCastResolve(): void {
		this.hooks.addUnits(this.unitRecruit.toBattle(this.spawnPosition.clone(), this.path, this.hooks), this);
		this.cast = null;
	}
}
