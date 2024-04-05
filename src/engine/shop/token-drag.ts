import { Derive, implementsTrait } from "@ddd-ts/traits";
import { Position } from "../../shared/position";
import { AnyTowerRecruit, TowerRecruit } from "../tower/recruit/tower-recruit";
import { Buyable } from "./shop";
import { HTImageDrawable, TImageDrawable, TRenderable } from "../../shared/traits/drawable";
import { AnyPathTile } from "../tile/entity/tile";
import { TDrawable } from "../../shared/traits/tdrawable";
import { TSynergy } from "../../shared/traits/synergy";
import { AnyBarrackRecruit } from "../barrack/recruit/barrack-recruit";
import { AnyBarrack } from "../barrack/entity/barrack";

type Holdable = Buyable | AnyTowerRecruit | AnyPathTile | AnyBarrackRecruit | AnyBarrack;

export class TokenDrag<T extends Holdable = Holdable> extends Derive(
	TDrawable,
	TRenderable,
	TImageDrawable(new Image(), { width: 4.9, height: 4.9 }, 2),
	HTImageDrawable,
) {
	constructor(
		public entity: T,
		public position: Position,
		public onRelease: (position?: Position) => void,
	) {
		super({ imageDrawable: entity });
	}

	getSynergies() {
		if (this.entity instanceof Buyable) {
			if (implementsTrait(this.entity.entity, TSynergy)) {
				return this.entity.entity.getSynergies();
			}
		}
		if (implementsTrait(this.entity, TowerRecruit)) {
			if (implementsTrait(this.entity, TSynergy)) {
				return this.entity.getSynergies();
			}
		}
		return undefined;
	}

	drawPriority = 5;
}
