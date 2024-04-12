import { Cell, GridPosition } from "../../../../shared/position";
import { AnyUnit } from "../../../units/recruit/unit-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Derive } from "@ddd-ts/traits";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TUnitPreviewHudRenderable } from "../../../../shared/traits/render/huds/unit-preview-enderable";
import { HaveStats } from "../../../stats/stats";
import { TCollider } from "../../../../shared/traits/engine/core/TCollider";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { WaveBarrack } from "../../recruit/implementation/wave-barrack-recruit";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";

export class WaveBattleBarrack extends Derive(
	TCollider,
	HTHitbox,
	Caster,
	HTImageDrawable,
	TUnitPreviewHudRenderable,
	GridElement,
	HaveStats,
) {
	castCost: number;

	cycles = [2.6, 0.2, 0.2];
	cycle = 0;

	constructor(
		public readonly barrackRecruit: WaveBarrack,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		public spawnPosition: GridPosition,
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
		const cycle = this.cycles[this.cycle % this.cycles.length] as number;
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), this.castCost * cycle);
		this.cycle += 1;
	}

	onCastResolve(): void {
		this.hooks.addUnits(this.unitRecruit.toBattle(this.spawnPosition.clone(), this.path, this.hooks), this);
		this.castInProgress = null;
	}
}
