import { ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { TTokenDrag } from "./token-drag/token-drag";
import { ShopPhaseHooks } from "../shop";
import { Retail } from "../retail/retail";
import { Buyable } from "../retail/buyable";
import { Position } from "../../../shared/position";
import { BuyableTokenDrag } from "./token-drag/buyable-token-drag";
import { AnyRecruit } from "../../../shared/traits/recruit";
import { Army } from "../../army/army";
import { TGrid } from "../../grid/tgrid";
import { Castle } from "../../castle/recruit/castle-recruit";
import { AnyBarrack, Barrack } from "../../barrack/recruit/barrack-recruit";
import { RecruitTokenDrag } from "./token-drag/army-recruit-token-drag";
import { AnyUnit } from "../../units/recruit/unit-recruit";
import { Physic } from "../../../shared/physic";

export type TokenHooks = {
	shopPhaseHooks: ShopPhaseHooks;
	holderHooks: {
		removeHold: Holder["setNull"];
	};
};

export class Holder {
	private _hold: null | ImplementsTrait<typeof TTokenDrag> = null;
	constructor() {}

	get hold() {
		return this._hold;
	}

	private setNull() {
		this._hold = null;
	}

	private setHold(token: ImplementsTrait<typeof TTokenDrag>) {
		if (this._hold) {
			this._hold.onRelease();
		}
		this._hold = token;
	}

	setHoldFromRetail(buyable: Buyable, retail: Retail, position: Position, hooks: ShopPhaseHooks) {
		retail.removeItem(buyable);
		const onAbort = () => {
			retail.addItem(buyable);
			this.setNull();
		};
		const token = new BuyableTokenDrag(buyable, position, this.getHooks(hooks), onAbort);
		this.setHold(token);
	}

	setHoldFromUnitInBarracks(recruit: AnyBarrack, unit: AnyUnit, hooks: TokenHooks, position: Position) {
		recruit.setUnit(null);
		const onAbort = () => {
			recruit.setUnit(unit);
			this.setNull();
		};
		const token = new RecruitTokenDrag(unit, position, hooks, onAbort);
		this.setHold(token);
		return;
	}

	setHoldFromArmyRecruit(
		recruit: AnyRecruit,
		army: Army,
		position: Position,
		hooks: ShopPhaseHooks,
		grid: ImplementsTrait<typeof TGrid>,
	) {
		if (recruit instanceof Castle) return;
		if (implementsTrait(recruit, Barrack)) {
			if (recruit.unitRecruit) {
				const barrackPosition = grid.cellToReal(recruit.cell);
				const unitPosition = new Position({ x: barrackPosition.x, y: grid.cellToReal(recruit.cell).y + 1.8 });
				const isClickingOnUnit = Physic.doCollide(unitPosition, recruit.unitRecruit.hitbox, position);
				if (isClickingOnUnit) {
					this.setHoldFromUnitInBarracks(recruit, recruit.unitRecruit, this.getHooks(hooks), position);
					return;
				}
			}
		}
		army.removeRecruit(recruit);
		const onAbort = () => {
			army.addRecruit(recruit, grid);
			this.setNull();
		};
		const token = new RecruitTokenDrag(recruit, position, this.getHooks(hooks), onAbort);
		this.setHold(token);
	}

	exit() {
		if (this._hold) {
			this._hold.onRelease();
		}
	}

	moveHold(position: Position) {
		if (this.hold) {
			this.hold.position = position;
		}
	}

	getHooks(shopPhaseHooks: ShopPhaseHooks): TokenHooks {
		return {
			shopPhaseHooks,
			holderHooks: {
				removeHold: this.setNull.bind(this),
			},
		};
	}
}
