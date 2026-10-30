import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem";
import { BattleGrid } from "../../../../grid/battle-grid";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell } from "../../../../../shared/position";
import { MineBlueprint } from "../../blueprint/implementation/mine-blueprint";
import { BattleMine } from "../../battle/implementation/battle-mine";
import { ShopEnterTrigger } from "../../../../../shared/traits/engine/shop-enter";
import { ArmyHooks } from "../../../../army/army";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";

export class Mine extends Derive(Totem, ShopEnterTrigger, HTSynergy) {
	constructor(
		public cell: Cell,
		public blueprint: MineBlueprint = new MineBlueprint({}),
	) {
		super({
			descriptor: blueprint,
			tagHolder: blueprint,
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
			synergy: blueprint,
		});
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new BattleMine(this, hooks, position, this.cell, "normal");
	}

	onShopEnter(hooks: ArmyHooks): void {
		this.produceOnRock(hooks);
		this.mineProfit(hooks);
	}

	produceOnRock(hooks: ArmyHooks): void {
		const relativeCells = this.getRelativeSynergyCell(this.orientation);
		const neighbors = hooks.getRelativeNeighborsInGrid(this.cell, relativeCells);
		const neighbor = neighbors[0];
		if (!this.patternEffect.patternCondition(neighbor)) return;
		hooks.economyHooks.addGold(5);
	}

	mineProfit(hooks: ArmyHooks) {
		const golds = hooks.economyHooks.getEconomy().amount;
		hooks.economyHooks.addGold(Math.floor(golds / 10));
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new BattleMine(this, hooks, position, cell, "mirrored");
	}

	get position() {
		return this.cell;
	}
}
