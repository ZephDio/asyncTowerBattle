import { Position } from "../../shared/position";
import { TowerRecruit } from "../tower/recruit/tower-recruit";
import { Buyable } from "./shop";

type Holdable = Buyable | TowerRecruit;

export abstract class TokenDrag<T extends Holdable = Holdable> {
	type: "buyable" | "tower";
	constructor(
		public entity: T,
		public position: Position,
		public onRelease: Function,
	) {}
	static isBuyableToken(token: TokenDrag<Holdable>): token is BuyableToken {
		return token.type === "buyable";
	}
	static isTowerToken(token: TokenDrag<Holdable>): token is TowerToken {
		return token.type === "tower";
	}
}

export class BuyableToken extends TokenDrag<Buyable> {
	readonly type = "buyable" as const;
	constructor(
		entity: Buyable,
		position: Position,
		public onRelease: Function,
	) {
		super(entity, position, onRelease);
	}
}

export class TowerToken extends TokenDrag<TowerRecruit> {
	readonly type = "tower" as const;
	constructor(
		entity: TowerRecruit,
		position: Position,
		public onRelease: Function,
	) {
		super(entity, position, onRelease);
	}
}
