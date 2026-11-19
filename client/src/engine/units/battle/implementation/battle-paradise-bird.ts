import { Derive } from "@ddd-ts/traits";
import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { ParadiseBird } from "../../recruit/implementation/paradise-bird";
import { PathFinder } from "../../../battle/path-finder";
import { TBattleUnit } from "../battle-unit";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { POWDER_PUFF_SIZE, PowderTrail } from "../../../area-effect/implementation/powder-trail";
import { secondsToFrame } from "../../../../shared/seconds";

// A puff gives the allies standing in it a regeneration healing this much per tick, which goes on for
// POWDER_REGENERATION_TICKS after they step out. Puffs vanish quickly, so the trail is only a few steps long: it heals
// the units the bird passes by, not the ones following far behind.
const POWDER_HEAL = 0.05;
const POWDER_REGENERATION_TICKS = 3;
const POWDER_DURATION = secondsToFrame(0.4);
// Puffs fall at the bird's feet, below its center (y-up), so its body doesn't hide them.
const POWDER_OFFSET = new GridPosition({ x: 0, y: -1.2 });

// Leaves a short trail of feather powder as it walks, which heals the allies it passes by.
export class BattleParadiseBird extends Derive(TBattleUnit) {
	override idleSheet = UnitResources.paradiseBirdSheet;
	pathFinder: PathFinder;
	lastPuff: GridPosition;
	puffs = 0;

	constructor(
		recruit: ParadiseBird,
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
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
		this.lastPuff = position.clone();
	}

	override tick() {
		super.tick();
		const dx = this.position.x - this.lastPuff.x;
		const dy = this.position.y - this.lastPuff.y;
		if (Math.hypot(dx, dy) < POWDER_PUFF_SIZE) return;
		this.lastPuff = this.position.clone();
		this.hooks.addAreaEffect(
			new PowderTrail(
				POWDER_DURATION,
				this.position.add(POWDER_OFFSET),
				POWDER_HEAL,
				POWDER_REGENERATION_TICKS,
				this,
				this.puffs++,
				this.hooks,
			),
			this,
		);
	}
}
