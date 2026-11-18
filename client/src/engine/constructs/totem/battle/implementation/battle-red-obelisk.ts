import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cast } from "../../../../../shared/traits/engine/cast";
import { CasterTotem } from "../battle-totem";
import { RedObelisk } from "../../recruit/implementation/obelisk";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { TStatsRenderable } from "../../../../../shared/traits/render/huds/stat-renderable";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
export class BattleRedObelisk extends Derive(CasterTotem, HTSynergy, TStatsRenderable) {
	hasTriggered = false;

	constructor(
		public obelisk: RedObelisk,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override orientation: BoardOrientation,
	) {
		super({
			synergy: obelisk,
			imageDrawable: obelisk,
			hitboxHolder: obelisk,
			tagHolder: obelisk,
			rarityHolder: obelisk,
			casterRecruit: obelisk,
			maxHealth: obelisk.stats.health,
			attack: obelisk.stats.damage,
			attackSpeed: obelisk.stats.attackSpeed,
			movementSpeed: obelisk.stats.speed,
			castSpeed: obelisk.stats.castSpeed,
			foodCost: obelisk.stats.foodConsumptionOnCast,
			range: obelisk.stats.range,
			onDeath: () => {},
			descriptor: obelisk,
		});
		this.gridShape = obelisk.gridShape;
	}

	tick() {
		this.stats.tick();
		this.tickCast();
		if (!this.hasTriggered) {
			this.hasTriggered = true;
			const elements = this.hooks.gridHooks.getRelativeNeighborsInArmy(
				this.cell,
				this.patternEffect.getRelativeCells(this.orientation),
			);
			for (const element of elements) {
				if (this.patternEffect.patternCondition(element)) {
					this.stats.basePercentStat.castSpeed += 10;
				}
			}
		}
	}

	onCastResolve() {
		this.sacrifice();
		this.finishCast();
	}

	sacrifice() {
		const alliedUnit = this.hooks.getAlliedUnits();
		const random = this.hooks.random();
		const chosen = alliedUnit[Math.floor(random * alliedUnit.length)];
		if (!chosen) return;
		chosen.die();
		this.hooks.triggerFurry();
	}

	casts() {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this));
	}
}
