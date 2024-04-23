import { Cell, GridPosition } from "../../../../shared/position";
import { AnyUnit } from "../../../units/recruit/unit-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack-recruit";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TUnitPreviewHudRenderable } from "../../../../shared/traits/render/huds/unit-preview-enderable";
import { HaveStats } from "../../../stats/stats";
import { TCollider } from "../../../../shared/traits/engine/core/TCollider";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { Orientable } from "../../../../shared/traits/engine/core/orientable";

export class BasicBattleBarrack extends Derive(
	TCollider,
	HTHitbox,
	Caster,
	HTImageDrawable,
	TUnitPreviewHudRenderable,
	GridElement,
	HaveStats,
	Orientable
) {
	castCost: number;

	constructor(
		public readonly barrackRecruit: BasicBarrack,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		public readonly hooks: BattleArmyHooks,
		public readonly unitRecruit: AnyUnit,
		override _orientation: number
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
			this.hooks.addUnits(this.unitRecruit.toBattle(spawnPoint, path, this.hooks), this);
		}
		this.finishCast(succes);
	}
}
