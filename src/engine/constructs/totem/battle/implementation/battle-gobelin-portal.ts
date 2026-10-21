import { Derive, implementsTrait } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Caster } from "../../../../../shared/traits/engine/cast";
import { GobelinPortal } from "../../recruit/implementation/gobelin-portal";
import { BattleTotem } from "../battle-totem";

export class BattleGobelinPortal extends Derive(BattleTotem) {
	hasTriggered = false;

	constructor(
		public portal: GobelinPortal,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override _orientation: number,
	) {
		super({ imageDrawable: portal, hitboxHolder: portal, descriptor: portal , tagHolder: portal });
		this.gridShape = portal.gridShape;
	}

	tick() {
		if (!this.hasTriggered) {
			const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
				this.cell,
				this.portal.patternEffect.getRelativeCells(this.portal.orientation),
			);
			for (const neighbor of neighbors) {
				if (neighbor && implementsTrait(neighbor, Caster)) {
					neighbor.subscribeOnCast(this, this.gobelinSpawn.bind(this));
				}
			}
			this.hasTriggered = true;
		}
	}

	gobelinSpawn() {
		const out = this.hooks.random();
		if (out > 0.3) return;
		
		const path = this.hooks.getEnemyPath();
		this.hooks.addUnits(this.portal.recruit.toBattle(this.hooks.getAlliedCastle().position.clone(), path, this.hooks), this);
	}
}
