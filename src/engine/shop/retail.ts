import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { Cell, Position } from "../../shared/position";
import { Buyable } from "./shop";
import { Derive } from "@ddd-ts/traits";
import { HitBox, Rectangle, TCollider, THitbox } from "../../shared/hitboxes";
import { RetailGrid } from "../grid/retail-grid";
import { ArmyGrid } from "../grid/grid";
import { DragonBlueprint } from "../units/blueprint/implementation/dragon";
import { OrangeTower } from "../tower/recruit/implementation/orange-tower-recruit";
import { BlueTower } from "../tower/recruit/implementation/blue-tower-recruit";
import { WaveBarrack } from "../barrack/recruit/implementation/wave-barrack-recruit";
import { YellowTower } from "../tower/recruit/implementation/yellow-tower-recruit";
import { GreenTower } from "../tower/recruit/implementation/green-tower-recruit";
import { OrangeTowerBlueprint } from "../tower/blueprint/implementation/orange-tower";
import { BlueTowerBlueprint } from "../tower/blueprint/implementation/blue-tower";
import { WaveBarrackBlueprint } from "../barrack/blueprint/implementation/wave-barrack";
import { Dragon } from "../units/recruit/implementation/dragon-recruit";
import { YellowTowerBlueprint } from "../tower/blueprint/implementation/yellow-tower";
import { GreenTowerBlueprint } from "../tower/blueprint/implementation/green-tower";
export type ShopItem = Buyable;
export class Retail extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 50, height: 25 }), new Position({ x: 0, y: 0 })]])),
) {
	slots: Cell[] = [
		new Cell({ x: 2, y: 1 }),
		new Cell({ x: 2, y: 3 }),
		new Cell({ x: 4, y: 1 }),
		new Cell({ x: 4, y: 3 }),
		new Cell({ x: 6, y: 1 }),
		new Cell({ x: 6, y: 3 }),
	];
	grid: RetailGrid;

	constructor() {
		super({});
		this.grid = new RetailGrid();
		this.refresh();
	}
	position = new Position(PercentToReal({ x: 50, y: 75 }));

	hit(position: Position): boolean {
		return this.contains(position);
	}

	async getRetailItems(): Promise<ShopItem[]> {
		return [
			Buyable.from(new OrangeTower(new OrangeTowerBlueprint({}), this.slots[0]!), 10),
			Buyable.from(new BlueTower(new BlueTowerBlueprint({}), this.slots[1]!), 10),
			Buyable.from(new Dragon(new DragonBlueprint({}), this.slots[2]!), 10),
			Buyable.from(new WaveBarrack(new WaveBarrackBlueprint({}), this.slots[3]!), 10),
			Buyable.from(new YellowTower(new YellowTowerBlueprint({}), this.slots[4]!), 10),
			Buyable.from(new GreenTower(new GreenTowerBlueprint({}), this.slots[5]!), 10),
		];
	}

	removeItem(buyable: Buyable) {
		this.grid.tiles.delete(ArmyGrid.posToString(buyable.cell));
	}

	addItem(buyable: Buyable) {
		this.grid.tiles.set(ArmyGrid.posToString(buyable.cell), buyable);
	}

	async refresh() {
		this.grid.tiles.clear();
		const items = await this.getRetailItems();
		await this.fill(items);
	}

	async fill(items: ShopItem[]) {
		for (const [index, item] of items.entries()) {
			const slot = this.slots[index];
			if (!slot) throw new Error("Slot not found");

			// this.buyables.set(item, slot);
			this.grid.setElement(item);
		}
	}
}
