import { Derive } from "@ddd-ts/traits";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { PathFinder } from "../../../battle/path-finder";
import { Priest } from "../../recruit/implementation/priest-recruit";
import { HealWave } from "../../../area-effect/implementation/heal-wave";
import { GridPosition } from "../../../../shared/position";
import { TBattleUnit } from "../battle-unit";

export class BattlePriest extends Derive(TBattleUnit, Caster) {
	pathFinder: PathFinder;

	constructor(
		recruit: Priest,
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
			castSpeed: NaN,
			foodCost: recruit.foodCost,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	healWave() {
		this.hooks.addAreaEffect(new HealWave(30, this.position, 0.2, this.hooks), this);
		this.finishCast();
	}

	casts(): void {
		if (this.pathFinder.isArrived) {
			this.castInProgress = new Cast(this, this.attackCastle.bind(this), 100);
			return;
		}
		this.castInProgress = new Cast(this, this.healWave.bind(this), 400);
	}

	override tick() {
		super.tick();
		this.tickCast();
	}
}
