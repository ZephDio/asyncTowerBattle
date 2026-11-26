import { Derive } from "@ddd-ts/traits";
import { Bosquet } from "../../recruit/implementation/bosquet";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Cast } from "../../../../../shared/traits/engine/cast";
import { CasterTotem } from "../battle-totem";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { TStatsRenderable } from "../../../../../shared/traits/render/huds/stat-renderable";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { withTag } from "../../../../../shared/traits/engine/tags/tagged";
import { PermanentBuff } from "../../../../army/battle/permanent-buff";

const CASTLE_DAMAGE_BONUS = 0.5;
const isAnimal = withTag("Animal");
const BASE_HEAL = 5;
const CAST_SPEED_BONUS_PER_FOREST = 10;

export class BattleBosquet extends Derive(CasterTotem, HTSynergy, TStatsRenderable) {
	private hasCountedForests = false;

	constructor(
		public bosquet: Bosquet,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override orientation: BoardOrientation,
	) {
		super({
			synergy: bosquet,
			imageDrawable: bosquet,
			hitboxHolder: bosquet,
			tagHolder: bosquet,
			rarityHolder: bosquet,
			casterRecruit: bosquet,
			maxHealth: bosquet.stats.health,
			castleDamage: bosquet.stats.castleDamage,
			projectileDamage: bosquet.stats.projectileDamage,
			attackSpeed: bosquet.stats.attackSpeed,
			movementSpeed: bosquet.stats.speed,
			castSpeed: bosquet.stats.castSpeed,
			foodCost: bosquet.stats.foodConsumptionOnCast,
			range: bosquet.stats.range,
			onDeath: () => {},
			descriptor: bosquet,
		});
		this.gridShape = bosquet.gridShape;
		this.animalCastleDamage = new PermanentBuff(hooks, isAnimal, "castleDamage", CASTLE_DAMAGE_BONUS);
	}

	// Every Animal that joins the army deals more damage to the enemy castle.
	readonly animalCastleDamage: PermanentBuff;

	tick() {
		if (!this.hasCountedForests) {
			this.hasCountedForests = true;
			this.stats.basePercentStat.castSpeed += CAST_SPEED_BONUS_PER_FOREST * this.forestCount();
		}
		this.stats.tick();
		this.tickCast();
	}

	private animals() {
		return this.hooks.getAlliedUnits().filter(isAnimal);
	}

	private forestCount() {
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.patternEffect.getRelativeCells(this.orientation),
		);
		return neighbors.filter((element) => this.patternEffect.patternCondition(element)).length;
	}

	onCastResolve() {
		this.healAnimals();
		this.finishCast();
	}

	healAnimals() {
		for (const animal of this.animals()) animal.heal(BASE_HEAL);
	}

	casts() {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this));
	}
}
