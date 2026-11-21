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
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class Mine extends Derive(Totem, ShopEnterTrigger, HTSynergy, RecruitBattleStart) {
	constructor(
		public cell: Cell,
		public blueprint: MineBlueprint = new MineBlueprint({}),
	) {
		super({
			descriptor: blueprint,
			tagHolder: blueprint,
			rarityHolder: blueprint,
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
			synergy: blueprint,
		});
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new BattleMine(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	onShopEnter(hooks: ArmyHooks): void {
		hooks.economyHooks.addGold(this.blueprint.shopGold);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new BattleMine(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.cell;
	}
}
