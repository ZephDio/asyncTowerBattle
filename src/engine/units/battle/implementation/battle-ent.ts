import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { PathFinder } from "../../../battle/path-finder";
import { Derive, implementsTrait } from "@ddd-ts/traits";
import { TBattleUnit } from "../battle-unit";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { Ent } from "../../recruit/implementation/ent";
import { AnyBattleConstruct } from "../../../constructs/construct";
import { Rooted } from "../../../stats/status/rooted";

export class BattleEnt extends Derive(TBattleUnit, Caster) {
	pathFinder: PathFinder;

	constructor(
		recruit: Ent,
		public position: GridPosition,
		public enemyPath: BattlePath,
		public hooks: BattleArmyHooks,
	) {
		super({
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.maxLife,
			attack: recruit.attackDamage,
			movementSpeed: recruit.speed,
			attackSpeed: recruit.attackSpeed,
			castSpeed: recruit.attackSpeed,
			foodCost: recruit.foodCost,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
			descriptor: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	root() {
		const selectTargetCriteria = (construct: AnyBattleConstruct, distanceSqrd: number) => {
			return implementsTrait(construct, Caster) && distanceSqrd < 30 * 30;
		};
		const target = this.hooks.searchEnemyConstructsInArea(this.position, selectTargetCriteria);
		if (target && implementsTrait(target, Caster)) {
			target.addCondition(new Rooted());
			this.finishCast();
		}
	}

	casts() {
		this.castInProgress = new Cast(this, this.root.bind(this), 400);
	}

	override tick() {
		super.tick();
		this.tickCast();
	}
}
