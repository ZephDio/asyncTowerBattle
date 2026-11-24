import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { Cell, GridPosition } from "../../../shared/position";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../shared/hitbox/shapes/rectangle";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { RetailGrid } from "../../grid/retail-grid";
import { ArmyGrid } from "../../grid/grid";
import { RetailFiller } from "./retail-filler";
import { Buyable } from "./buyable";
import { runRandom } from "../../../shared/run-random";
export type ShopItem = Buyable;
export class Retail extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 50, height: 25 }), new GridPosition({ x: 0, y: 0 })]])),
) {
	slots: Cell[] = [
		new Cell({ x: 1, y: 1 }),
		new Cell({ x: 1, y: 3 }),
		new Cell({ x: 3, y: 1 }),
		new Cell({ x: 3, y: 3 }),
		new Cell({ x: 5, y: 1 }),
		new Cell({ x: 5, y: 3 }),
		new Cell({ x: 7, y: 1 }),
		new Cell({ x: 7, y: 3 }),
	];
	grid: RetailGrid;
	// How many times the offers were drawn, so each draw of a round has its own stream.
	private draws = 0;
	constructor(
		private round: number,
		private runSeed: number,
	) {
		super({});
		this.grid = new RetailGrid();
		this.refresh();
	}
	position = new GridPosition(PercentToReal({ x: 50, y: 75 }));

	async getRetailItems(): Promise<ShopItem[]> {
		const random = runRandom(this.runSeed, "shop", this.round, this.draws++);
		const itemsAndPrice = new RetailFiller(this.round, random).getFreshItems(this.slots);
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
