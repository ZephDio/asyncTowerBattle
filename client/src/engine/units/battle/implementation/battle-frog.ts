import { Derive } from "@ddd-ts/traits";
import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Frog } from "../../recruit/implementation/frog";
import { PathFinder } from "../../../battle/path-finder";
import { TBattleUnit } from "../battle-unit";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { Poisoned, poisonDamagePerSecond } from "../../../area-effect/implementation/poison-ground";
import { secondsToFrame } from "../../../../shared/seconds";

// On death, the army gains a vitality stack and a random enemy unit is poisoned for a second.
export class BattleFrog extends Derive(TBattleUnit) {
	override idleSheet = UnitResources.frogSheet;
	pathFinder: PathFinder;

	constructor(
		private readonly recruit: Frog,
		public position: GridPosition,
		public enemyPath: BattlePath,
		public hooks: BattleArmyHooks,
	) {
		super({
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			castleDamage: recruit.stats.castleDamage,
			projectileDamage: recruit.stats.projectileDamage,
			movementSpeed: recruit.stats.speed,
			attackSpeed: recruit.stats.attackSpeed,
			castSpeed: recruit.stats.castSpeed,
			foodCost: recruit.stats.foodConsumption,
			range: recruit.stats.range,
			onDeath: () => {
				this.croak();
				this.hooks.removeUnit(this);
			},
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	private croak() {
		const { vitalityStacks, poisonSeconds } = this.recruit.blueprint;
		this.hooks.alliedArmyBuffHooks.addUnitBuff("vitality", vitalityStacks);
		const enemies = this.hooks.getEnemyUnits().filter((enemy) => enemy.isAlive());
		const victim = enemies[Math.floor(this.hooks.random() * enemies.length)];
		victim?.addCondition(new Poisoned(() => poisonDamagePerSecond(this.hooks), secondsToFrame(poisonSeconds)));
	}
}
