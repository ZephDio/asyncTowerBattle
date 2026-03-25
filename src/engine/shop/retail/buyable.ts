import { Derive } from "@ddd-ts/traits";
import { TGCollider } from "../../../shared/traits/engine/core/TGCollider";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { DrawPriority, HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { TPriceHudRenderable } from "../../../shared/traits/render/huds/price-renderable";
import { GridElement } from "../../../shared/traits/engine/core/grid-element";
import { Cell } from "../../../shared/position";
import { AnyRecruit } from "../../../shared/traits/engine/recruit";
import { THasPrice } from "../../../shared/traits/engine/has-price";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { HTDescriptor } from "../../../shared/traits/render/huds/item-descriptor";
import { Tagged, HTTag } from "../../../shared/traits/engine/tags/tagged";
import { implementsTrait } from "../../../../traits/traits";

export type AnyBuyable = AnyRecruit;

export class Buyable extends Derive(
	THasPrice,
	TGCollider,
	HTHitbox,
	HTDescriptor,
	HTTag,
	TPriceHudRenderable,
	TRenderable,
	HTImageDrawable,
	GridElement,
) {
	drawPriority = DrawPriority.NormalGridElement;
	constructor(
		public entity: AnyBuyable,
		public cell: Cell,
		price: number,
	) {
		super({ imageDrawable: entity, hitboxHolder: entity, descriptor: entity, tagHolder: entity });
		this.price = price;
	}
	get position() {
		return this.cell;
	}

	static from(entity: AnyBuyable, price: number) {
		return new Buyable(entity, entity.cell, price);
	}

	get tags(){
		return implementsTrait(this.entity, Tagged) ? this.entity.tags : [];
	}
}
