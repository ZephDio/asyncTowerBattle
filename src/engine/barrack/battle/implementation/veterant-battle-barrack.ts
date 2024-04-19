import { Cell, GridPosition } from "../../../../shared/position";
import { AnyUnit } from "../../../units/recruit/unit-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack-recruit";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TUnitPreviewHudRenderable } from "../../../../shared/traits/render/huds/unit-preview-enderable";
import { HaveStats, Stats } from "../../../stats/stats";
import { TCollider } from "../../../../shared/traits/engine/core/TCollider";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { Status } from "../../../../shared/traits/engine/status";

export class VeterantBattleBarrack extends Derive(
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
		public readonly position: GridPosition,
		public readonly cell: Cell,

		public readonly hooks: BattleArmyHooks,
		public readonly unitRecruit: AnyUnit,
		public override orientation: number,
	) {
		super({
			casterRecruit: barrackRecruit,
			imageDrawable: barrackRecruit,
			maxHealth: NaN,
			attack: NaN,
			movementSpeed: NaN,
			castSpeed: barrackRecruit.productionSpeed,
			attackSpeed: NaN,
			foodCost: barrackRecruit.foodCost,
			onDeath: () => {},
			hitboxHolder: barrackRecruit,
		});
		this.castCost = unitRecruit.cost;
		this.angle = this.orientation;
		this.gridShape = barrackRecruit.gridShape;
	}

	tick() {
		super.tickCast();
	}

	casts(): void {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), this.castCost);
	}

	onCastResolve(): void {
		const path = this.hooks.getEnemyPath();
		const spawnPoint = this.hooks.getAlliedCastle().position.clone();
		const succes = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
		if (succes) {
			const unit = this.unitRecruit.toBattle(spawnPoint, path, this.hooks);
			const buff = new VeterantBuff();
			unit.addStatus(buff);
			unit.addSize(0.3);
			this.hooks.addUnits(unit, this);
		}
		this.finishCast();
	}
}
export class VeterantBuff extends Derive(Status) {
	key = "veterant";
	clock = 0;
	duration = Infinity;
	stats: Stats;
	hasTriggered = false;

	constructor() {
		super({});
	}
	tick() {
		this.clock++;
		if (this.hasTriggered) return;
		this.stats.basePercentStat.movementSpeed -= 10;
		this.stats.basePercentStat.attack += 20;
		this.stats.addMaxHealth(100, true);
		this.hasTriggered = true;
	}

	onRemove() {
		this.stats.removeStatus(this);
	}
}
