import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { Cell, GridPosition } from "../../../shared/position";
import { Derive } from "@ddd-ts/traits";
import { HitBox, Rectangle, TCollider, THitbox } from "../../../shared/hitboxes";
import { RetailGrid } from "../../grid/retail-grid";
import { ArmyGrid } from "../../grid/grid";
import { RetailFiller } from "./retail-filler";
import { Buyable } from "./buyable";
export type ShopItem = Buyable;
export class Retail extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 50, height: 25 }), new GridPosition({ x: 0, y: 0 })]])),
) {
	slots: Cell[] = [
		new Cell({ x: 2, y: 1 }),
		new Cell({ x: 2, y: 3 }),
		new Cell({ x: 4, y: 1 }),
		new Cell({ x: 4, y: 3 }),
		new Cell({ x: 6, y: 1 }),
		new Cell({ x: 6, y: 3 }),
		new Cell({ x: 8, y: 1 }),
		new Cell({ x: 8, y: 3 }),
	];
	grid: RetailGrid;
	retailFiller: RetailFiller = new RetailFiller();
	constructor() {
		super({});
		this.grid = new RetailGrid();
		this.refresh();
	}
	position = new GridPosition(PercentToReal({ x: 50, y: 75 }));

	async getRetailItems(): Promise<ShopItem[]> {
		const itemsAndPrice = this.retailFiller.getFreshItems(this.slots);
		return itemsAndPrice.map((itemAndPrice) => {
			return Buyable.from(itemAndPrice.recruit, itemAndPrice.price);
		});
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
		for (const item of items) {
			this.grid.setElement(item);
		}
	}
}
