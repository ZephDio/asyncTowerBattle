import { Derive } from "@ddd-ts/traits";
import { Physic } from "../../../../shared/physic";
import { GreenTowerRecruit } from "../../recruit/implementation/green-tower-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, Position } from "../../../../shared/position";
import { Cast, Caster } from "../../../../shared/traits/cast";
import { HTImageDrawable, TCasterHudRenderable } from "../../../../shared/traits/drawable";
import { GridElement } from "../../../grid/grid";
import { HaveStats } from "../../../stats/stats";
import { HTHitbox } from "../../../../shared/hitboxes";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";

export class GreenBattleTower extends Derive(
	HTHitbox,
	TCasterHudRenderable,
	Caster,
	HTImageDrawable,
	GridElement,
	HaveStats,
) {
	target = null as null | AnyBattleUnit;
	constructor(
		private readonly recruit: GreenTowerRecruit,
		private readonly hooks: BattleArmyHooks,
		public readonly position: Position,
		public readonly cell: Cell,
	) {
		super({
			imageDrawable: recruit,
			maxHealth: NaN,
			attack: recruit.attackDamage,
			movementSpeed: NaN,
			castSpeed: recruit.attackSpeed,
			onDeath: () => {},
			hitboxHolder: recruit,
		});
	}

	takeDamage(_damage: number): void {
		return;
	}

	private attack(target: AnyBattleUnit) {
		const projectile = this.recruit.getProjectile(this.hooks, target, this.position, this.stats.attack);
		this.hooks.addProjectile(projectile, this);
		this.castInProgress = null;
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
		const target = this.hooks.searchTarget(this, this.doesTargetMatchesRule);
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
