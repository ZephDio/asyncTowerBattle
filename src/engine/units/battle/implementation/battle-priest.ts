import { Derive } from "@ddd-ts/traits";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { PathFinder } from "../../../battle/path-finder";
import { Priest } from "../../recruit/implementation/priest";
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
			maxHealth: recruit.stats.health,
			attack: recruit.stats.damage,
			movementSpeed: recruit.stats.speed,
			attackSpeed: recruit.stats.attackSpeed,
			castSpeed: recruit.stats.castSpeed,
			foodCost: recruit.stats.foodConsumption,
			range: recruit.stats.range,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	healWave() {
		this.hooks.addAreaEffect(new HealWave(35, this.position, 0.2, this.hooks), this);
		this.finishCast();
	}

	casts(): void {
		this.castInProgress = new Cast(this, this.healWave.bind(this));
	}

	override tick() {
		super.tick();
		this.tickCast();
	}
}
