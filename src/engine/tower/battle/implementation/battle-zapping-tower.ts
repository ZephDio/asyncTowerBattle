import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, Position } from "../../../../shared/position";
import { Cast, Caster } from "../../../../shared/traits/cast";
import { HTImageDrawable, TCasterHudRenderable } from "../../../../shared/traits/drawable";
import { HaveStats } from "../../../stats/stats";
import { HTHitbox } from "../../../../shared/hitboxes";
import { GridElement } from "../../../../shared/traits/grid-element";
import { ZappingTower } from "../../recruit/implementation/zapping-tower-recruit";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { Physic } from "../../../../shared/physic";

export class ZappingBattleTower extends Derive(
	HTHitbox,
	TCasterHudRenderable,
	Caster,
	HTImageDrawable,
	GridElement,
	HaveStats,
) {
	target = null as null | AnyBattleUnit;

	constructor(
		private readonly recruit: ZappingTower,
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

	isAlive() {
		return true;
	}

	private doesTargetMatchesRule(enemyUnit: AnyBattleUnit, distanceSqrd: number) {
		return enemyUnit.isAlive() && distanceSqrd < 20 * 20;
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

	setTarget(enemyUnit: AnyBattleUnit | null) {
		this.target = enemyUnit;
	}

	casts(): void {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), 100);
	}

	tick() {
		this.tickCast();
		this.stats.tick();
	}
}
