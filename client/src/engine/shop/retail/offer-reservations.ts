import { Cell } from "../../../shared/position";
import { ArmyGrid } from "../../grid/grid";
import { Buyable } from "./buyable";

// The offers the player reserved, by slot. The shop keeps them in their slot when it draws new offers, on a reroll and
// on entering the next round. Game keeps them for the run and saves them with the game; they are not sent with the
// board.
export class OfferReservations {
	private offers = new Map<string, Buyable>();

	constructor(reserved: Buyable[] = []) {
		for (const buyable of reserved) this.offers.set(ArmyGrid.posToString(buyable.cell), buyable);
	}

	isReserved(buyable: Buyable) {
		return this.offers.get(ArmyGrid.posToString(buyable.cell)) === buyable;
	}

	isSlotReserved(cell: Cell) {
		return this.offers.has(ArmyGrid.posToString(cell));
	}

	toggle(buyable: Buyable) {
		if (this.isReserved(buyable)) this.release(buyable);
		else this.offers.set(ArmyGrid.posToString(buyable.cell), buyable);
	}

	release(buyable: Buyable) {
		if (this.isReserved(buyable)) this.offers.delete(ArmyGrid.posToString(buyable.cell));
	}

	all() {
		return [...this.offers.values()];
	}
}
