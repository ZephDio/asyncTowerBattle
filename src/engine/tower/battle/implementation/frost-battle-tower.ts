import { Derive } from "@ddd-ts/traits";
import { Physic } from "../../../../shared/physic";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../shared/position";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TCasterHudRenderable } from "../../../../shared/traits/render/huds/caster-camembert-renderable";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { HaveStats } from "../../../stats/stats";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { FrostTower } from "../../recruit/implementation/frost-tower-recruit";
export class FrostBattleTower extends Derive(
	HTHitbox,
	TCasterHudRenderable,
	Caster,
	HTImageDrawable,
	GridElement,
	HaveStats,
) {
	constructor(
		private readonly recruit: FrostTower,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		public override orientation: number,
	) {
		super({
			casterRecruit: recruit,
			hitboxHolder: recruit,
			imageDrawable: recruit,
			maxHealth: NaN,
			attack: recruit.attackDamage,
			movementSpeed: NaN,
			castSpeed: recruit.attackSpeed,
			onDeath: () => {},
		});

		this.angle = this.orientation;
		this.gridShape = recruit.gridShape;
	}

	private attack(target: AnyBattleUnit) {
		const IceSpikeSpawnLocation = new GridPosition({ x: target.position.x, y: target.position.y + 9 });
		const projectile = this.recruit.getProjectile(this.hooks, target, IceSpikeSpawnLocation, this.stats.attack);
		this.hooks.addProjectile(projectile, this);
		this.castInProgress = null;	
		this.callSubscribers()
	}

	private doesTargetMatchesRule(enemyUnit: AnyBattleUnit, distanceSqrd: number) {
		return enemyUnit.isAlive() && distanceSqrd < 20 * 20;
	}
	target = null as null | AnyBattleUnit;
	setTarget(enemyUnit: AnyBattleUnit | null) {
		this.target = enemyUnit;
	}

	onCastResolve() {
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
		this.stats.tick();
		super.tickCast();
	}
}
