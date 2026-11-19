import { Derive } from "@ddd-ts/traits";
import { BlacksmithTower } from "../../recruit/implementation/blacksmith-tower";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import {
	BlacksmithDescription,
	DescriptionLine,
	TLiveDescriptionText,
} from "../../../../../shared/traits/render/huds/item-descriptor";
import { hasTag } from "../../../../../shared/traits/engine/tags/tagged";
import { BattleSparkShot } from "../../../../projectile/battle/implementation/battle-spark-shot";
import { BattleTower } from "../battle-tower";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class BattleBlacksmithTower extends Derive(BattleTower, TLiveDescriptionText) {
	// The max health this tower gives to every Kinfolk unit, +1 every 4 casts.
	kinfolkHealth = 0;
	private castCount = 0;

	constructor(
		private readonly recruit: BlacksmithTower,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: BoardOrientation,
	) {
		super({
			recruit,
			orientation,
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			castleDamage: recruit.stats.castleDamage,
			projectileDamage: recruit.stats.projectileDamage,
			movementSpeed: recruit.stats.speed,
			castSpeed: recruit.stats.castSpeed,
			attackSpeed: recruit.stats.attackSpeed,
			foodCost: recruit.stats.foodConsumptionOnCast,
			range: recruit.stats.range,
			onDeath: () => {},
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
		// Units that join later get the value reached so far.
		this.hooks.onUnitAdded((unit) => {
			if (this.kinfolkHealth > 0 && hasTag(unit, "Kinfolk")) this.giveHealth(unit, this.kinfolkHealth);
		});
	}

	private giveHealth(unit: AnyBattleUnit, amount: number) {
		// Flat max health, as a percent of the unit's base max health.
		unit.stats.addMaxHealth((amount / unit.stats.base.maxHealth) * 100, true);
	}

	private countCast() {
		this.castCount++;
		if (this.castCount % this.recruit.tower.castsPerHealth !== 0) return;
		this.kinfolkHealth++;
		for (const unit of this.hooks.getAlliedUnits()) {
			if (hasTag(unit, "Kinfolk")) this.giveHealth(unit, 1);
		}
	}

	liveDescription(): DescriptionLine[] {
		if (!(this.description instanceof BlacksmithDescription)) return this.description.description;
		return this.description.liveDescription(this.kinfolkHealth);
	}

	// Where the sparks start: the anvil, drawn on the left of the left cell (turned around for a mirrored tower).
	private anvilPosition() {
		const { left, above } = this.hooks.gridHooks.getRelativeDirection();
		const { anvilOffset } = this.recruit.tower;
		const center = this.hooks.gridHooks.getRealPosition(this.cell);
		return new GridPosition({
			x: center.x + left.x * anvilOffset.left + above.x * anvilOffset.above,
			y: center.y + left.y * anvilOffset.left + above.y * anvilOffset.above,
		});
	}

	// One spark of the cone. The cone is cut into one slice per spark of the volley and each spark takes a random
	// direction inside its own slice, so the volley fans out evenly while no two volleys look alike. The range is random
	// too. All from the army's seeded random, so that a replay of the same battle throws the same volley.
	private shootSpark(origin: GridPosition, slice: number) {
		const { random, gridHooks } = this.hooks;
		const { cone, minSparkRange, maxSparkRange, sparksPerVolley } = this.recruit.tower;
		const { left } = gridHooks.getRelativeDirection();
		// Positive angles turn toward the bottom of the army's board, negative ones toward the top.
		const degrees = -cone.up + ((slice + random()) / sparksPerVolley) * (cone.up + cone.down);
		const angle = (degrees * Math.PI) / 180;
		const direction = new GridPosition({
			x: left.x * Math.cos(angle) - left.y * Math.sin(angle),
			y: left.x * Math.sin(angle) + left.y * Math.cos(angle),
		});
		const range = STANDARD_CELL_SIZE * (minSparkRange + random() * (maxSparkRange - minSparkRange));
		this.hooks.addProjectile(
			new BattleSparkShot(
				this.recruit.tower.projectile,
				origin.clone(),
				this.hooks,
				this.stats.projectileDamage,
				direction,
				range,
			),
			this,
		);
	}

	// The cast never waits for a target: every cast shoots its cone, enemies there or not.
	onCastResolve(): void {
		this.countCast();
		const sucess = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
		if (sucess) {
			const origin = this.anvilPosition();
			for (let spark = 0; spark < this.recruit.tower.sparksPerVolley; spark++) this.shootSpark(origin, spark);
		}
		this.finishCast(sucess);
	}
}
