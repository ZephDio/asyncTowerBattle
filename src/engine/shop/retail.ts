import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { Cell, Position } from "../../shared/position";
import { Buyable } from "./shop";
import { OrangeTower } from "../tower/entity/implementation/orange-tower";
import { BlueTower } from "../tower/entity/implementation/blue-tower";
import { Derive } from "@ddd-ts/traits";
import { HitBox, Rectangle, TCollider, THitbox } from "../../shared/hitboxes";
import { RetailGrid } from "../grid/retail-grid";
import { ArmyGrid } from "../grid/grid";
import { Dragon } from "../units/entity/implementation/dragon";
import { WaveBarrack } from "../barrack/entity/implementation/wave-barrack";
import { YellowTower } from "../tower/entity/implementation/yellow-tower";
import { GreenTower } from "../tower/entity/implementation/green-tower";

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
			Buyable.from(new OrangeTower({}), this.slots[0]!, 10),
			Buyable.from(new BlueTower({}), this.slots[1]!, 10),
			Buyable.from(new Dragon({}), this.slots[2]!, 10),
			Buyable.from(new WaveBarrack({}), this.slots[3]!, 10),
			Buyable.from(new YellowTower({}), this.slots[4]!, 10),
			Buyable.from(new GreenTower({}), this.slots[5]!, 10),
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
