import { Derive } from "@ddd-ts/traits";
import { Stonemason } from "../../recruit/implementation/stonemason";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Cast } from "../../../../../shared/traits/engine/cast";
import { CasterTotem } from "../battle-totem";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { TStatsRenderable } from "../../../../../shared/traits/render/huds/stat-renderable";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { StoneShield } from "../../../../stats/status/stone-shield";

export class BattleStonemason extends Derive(CasterTotem, HTSynergy, TStatsRenderable) {
	constructor(
		public stonemason: Stonemason,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override orientation: BoardOrientation,
	) {
		super({
			synergy: stonemason,
			imageDrawable: stonemason,
			hitboxHolder: stonemason,
			tagHolder: stonemason,
			rarityHolder: stonemason,
			casterRecruit: stonemason,
			maxHealth: stonemason.stats.health,
			castleDamage: stonemason.stats.castleDamage,
			projectileDamage: stonemason.stats.projectileDamage,
			attackSpeed: stonemason.stats.attackSpeed,
			movementSpeed: stonemason.stats.speed,
			castSpeed: stonemason.stats.castSpeed,
			foodCost: stonemason.stats.foodConsumptionOnCast,
			range: stonemason.stats.range,
			onDeath: () => {},
			descriptor: stonemason,
		});
		this.gridShape = stonemason.gridShape;
	}

	tick() {
		this.stats.tick();
		this.tickCast();
	}

	mountainCount() {
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.patternEffect.getRelativeCells(this.orientation),
		);
		return neighbors.filter((element) => this.patternEffect.patternCondition(element)).length;
	}

	// Random allied units without a shield, drawn without replacement from the battle's seeded random.
	shieldTargets(count: number) {
		const candidates = this.hooks.getAlliedUnits().filter((unit) => !unit.stats.getStoneShieldBoon());
		const targets = [];
		while (targets.length < count && candidates.length > 0) {
			const index = Math.min(Math.floor(this.hooks.random() * candidates.length), candidates.length - 1);
			targets.push(...candidates.splice(index, 1));
		}
		return targets;
	}

	onCastResolve() {
		const count = this.stonemason.blueprint.baseShields + this.mountainCount();
		for (const unit of this.shieldTargets(count)) unit.addBoon(new StoneShield({}));
		this.finishCast();
	}

	casts() {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this));
	}
}
