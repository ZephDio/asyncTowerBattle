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
import { Science } from "../../../shared/traits/engine/science";
import { runRandom } from "../../../shared/run-random";
import { OfferReservations } from "./offer-reservations";
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
		private getSciences: () => ReadonlySet<Science> = () => new Set(),
		public reservations = new OfferReservations(),
	) {
		super({});
		this.grid = new RetailGrid(this.slots);
		this.refresh();
	}
	position = new GridPosition(PercentToReal({ x: 50, y: 75 }));

	async getRetailItems(slots: Cell[] = this.slots): Promise<ShopItem[]> {
		const random = runRandom(this.runSeed, "shop", this.round, this.draws++);
		const itemsAndPrice = new RetailFiller(this.round, random, this.getSciences()).getFreshItems(slots);
		return itemsAndPrice.map((itemAndPrice) => {
			return Buyable.from(itemAndPrice.recruit, itemAndPrice.price);
		});
	}

	// The offer picked up by the player: its piece leaves the slot, whose signs stay until it is bought or put back.
	held: Buyable | null = null;
	// The slots of the bought offers, kept with a sold sign until the next draw.
	private soldSlots = new Map<string, { cell: Cell; price: number }>();

	removeItem(buyable: Buyable) {
		this.grid.tiles.delete(ArmyGrid.posToString(buyable.cell));
	}

	hold(buyable: Buyable) {
		this.removeItem(buyable);
		this.held = buyable;
	}

	// A bought offer leaves its slot for good, reserved or not.
	sell(buyable: Buyable) {
		this.removeItem(buyable);
		this.reservations.release(buyable);
		if (this.held === buyable) this.held = null;
		this.soldSlots.set(ArmyGrid.posToString(buyable.cell), { cell: buyable.cell, price: buyable.price });
	}

	soldOffers() {
		return [...this.soldSlots.values()];
	}

	toggleReservation(buyable: Buyable) {
		if (this.grid.tiles.get(ArmyGrid.posToString(buyable.cell)) !== buyable) return;
		this.reservations.toggle(buyable);
	}

	isReserved(buyable: Buyable) {
		return this.reservations.isReserved(buyable);
	}

	// The reserved offers on display, and the one in the player's hand.
	reservedOffers() {
		return this.reservations
			.all()
			.filter(
				(buyable) => buyable === this.held || this.grid.tiles.get(ArmyGrid.posToString(buyable.cell)) === buyable,
			);
	}

	addItem(buyable: Buyable) {
		if (this.held === buyable) this.held = null;
		this.grid.tiles.set(ArmyGrid.posToString(buyable.cell), buyable);
	}

	// New offers in the free slots; the reserved ones stay in theirs.
	async refresh() {
		this.grid.clearOffers();
		this.soldSlots.clear();
		this.held = null;
		const reserved = this.reservations.all();
		const items = await this.getRetailItems(this.slots.filter((slot) => !this.reservations.isSlotReserved(slot)));
		await this.fill([...reserved, ...items]);
	}

	async fill(items: ShopItem[]) {
		for (const item of items) {
			this.grid.setElement(item);
		}
	}
}
