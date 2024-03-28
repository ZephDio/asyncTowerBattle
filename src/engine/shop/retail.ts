import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { Position } from "../../shared/position";
import { Recruit } from "../../shared/physic";
import { TowerRecruitFixtures } from "../tower/recruit/tower-recruit-fixtures";
import { Buyable } from "./shop";

export type ShopItem = Omit<Buyable<Recruit>, "position">;
export class Retail {
	slots: Position[] = [
		PercentToReal({ x: 33, y: 83 }),
		PercentToReal({ x: 66, y: 83 }),
		PercentToReal({ x: 33, y: 66 }),
		PercentToReal({ x: 66, y: 66 }),
	];
	buyables: Map<Buyable<Recruit>, Position> = new Map();

	constructor() {
		this.refresh();
	}

	async getRetailItems(): Promise<ShopItem[]> {
		return [
			{
				type: "tower",
				entity: TowerRecruitFixtures.bottomLeftTower,
			},
			{
				type: "tower",
				entity: TowerRecruitFixtures.bottomMiddleTower,
			},
			{
				type: "tower",
				entity: TowerRecruitFixtures.centerTower,
			},
			{
				type: "tower",
				entity: TowerRecruitFixtures.topRightTower,
			},
		];
	}

	removeItem(buyable: Buyable<Recruit>) {
		this.buyables.delete(buyable);
	}

	addItem(buyable: Buyable) {
		this.buyables.set(buyable, buyable.position);
	}

	async refresh() {
		this.buyables.clear();
		const items = await this.getRetailItems();
		await this.fill(items);
	}

	async fill(items: ShopItem[]) {
		for (const [index, item] of items.entries()) {
			const slot = this.slots[index];
			if (!slot) throw new Error("Slot not found");

			this.buyables.set(
				{
					type: item.type,
					entity: item.entity,
					position: slot,
				},
				slot,
			);
		}
	}
}
