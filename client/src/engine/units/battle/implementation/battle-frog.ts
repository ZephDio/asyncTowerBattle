import { Derive } from "@ddd-ts/traits";
import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Frog } from "../../recruit/implementation/frog";
import { PathFinder } from "../../../battle/path-finder";
import { TBattleUnit } from "../battle-unit";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { Poisoned } from "../../../area-effect/implementation/poison-ground";
import { secondsToFrame } from "../../../../shared/seconds";

const HOP_TICKS = secondsToFrame(0.5);
const REST_TICKS = secondsToFrame(0.5);

// The speed of each tick of a hop: a half sine, from rest up to a peak and back, scaled so that a hop followed by its
// rest averages 1, which keeps the unit's movement speed stat its average speed.
const HOP_SHAPE = Array.from({ length: HOP_TICKS }, (_, tick) => Math.sin((Math.PI * (tick + 0.5)) / HOP_TICKS));
const HOP_SCALE = (HOP_TICKS + REST_TICKS) / HOP_SHAPE.reduce((sum, value) => sum + value, 0);
export const HOP_SPEED = [...HOP_SHAPE.map((value) => value * HOP_SCALE), ...Array<number>(REST_TICKS).fill(0)];

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

	// Hops instead of walking: it stands still between two hops, and moves fast in the middle of each one.
	override movementMultiplier() {
		return HOP_SPEED[this.clock % HOP_SPEED.length] ?? 1;
	}

	private croak() {
		const { vitalityStacks, poisonSeconds } = this.recruit.blueprint;
		this.hooks.alliedArmyBuffHooks.addUnitBuff("vitality", vitalityStacks);
		const enemies = this.hooks.getEnemyUnits().filter((enemy) => enemy.isAlive());
		const victim = enemies[Math.floor(this.hooks.random() * enemies.length)];
		victim?.addCondition(Poisoned.by(this.hooks, secondsToFrame(poisonSeconds)));
	}
}
