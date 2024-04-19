import { Derive } from "@ddd-ts/traits";
import { Physic } from "../../../../shared/physic";
import { GreenTower } from "../../recruit/implementation/green-tower-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../shared/position";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TCasterHudRenderable } from "../../../../shared/traits/render/huds/caster-camembert-renderable";
import { HaveStats } from "../../../stats/stats";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { HTDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";

export class GreenBattleTower extends Derive(
	HTHitbox,
	TCasterHudRenderable,
	Caster,
	HTImageDrawable,
	HTDescriptor,
	GridElement,
	HaveStats,
) {
	target = null as null | AnyBattleUnit;
	constructor(
		private readonly recruit: GreenTower,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		public override orientation: number,
	) {
		super({
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: NaN,
			attack: recruit.attackDamage,
			movementSpeed: NaN,
			attackSpeed: NaN,
			castSpeed: recruit.attackSpeed,
			foodCost: recruit.foodCost,
			onDeath: () => {},
			hitboxHolder: recruit,
			descriptor: recruit,
		});

		this.angle = this.orientation;
		this.gridShape = recruit.gridShape;
	}

	private attack(target: AnyBattleUnit) {
		const projectile = this.recruit.getProjectile(this.hooks, target, this.position, this.stats.attack);
		this.hooks.addProjectile(projectile, this);
		this.finishCast();
	}
	private doesTargetMatchesRule(enemyUnit: AnyBattleUnit, distanceSqrd: number) {
		return enemyUnit.isAlive() && distanceSqrd < 20 * 20;
	}
	setTarget(enemyUnit: AnyBattleUnit | null) {
		this.target = enemyUnit;
	}

	isAlive() {
		return true;
	}

	onCastResolve(): void {
		if (
			this.target &&
			this.doesTargetMatchesRule(this.target, Physic.getDistanceSqrd(this.position, this.target.position))
		) {
			this.attack(this.target);
			return;
		}
		const target = this.hooks.searchTarget(this.position, this.doesTargetMatchesRule);
		this.setTarget(target);
		if (this.target) {
			this.attack(this.target);
			return;
		}
	}

	casts(): void {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), 100);
	}

	tick() {
		this.tickCast();
		this.stats.tick();
	}
}
