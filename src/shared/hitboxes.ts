import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
import { Position } from "./position";
import { Physic } from "./physic";

import { TGrid } from "../engine/grid/tgrid";
import { GridElement } from "./traits/grid-element";

export class HitBox {
	constructor(public hitShapes: [HitShapeType, Position][]) {}

	clone() {
		return new HitBox(this.hitShapes.map(([shape, position]) => [shape.clone(), position.clone()]));
	}
}
export class Rectangle {
	w: number;
	h: number;
	constructor(size: { width: number; height: number }) {
		this.w = size.width;
		this.h = size.height;
	}

	clone() {
		return new Rectangle({ width: this.w, height: this.h });
	}
}
export class Ellipse {
	rx: number;
	ry: number;
	constructor(public size: { width: number; height: number }) {
		this.rx = size.width / 2;
		this.ry = size.height / 2;
	}

	clone() {
		return new Ellipse({ width: this.size.width, height: this.size.height });
	}
}
type HitShapeType = Rectangle | Ellipse;

export const THitbox = (hitbox: HitBox) =>
	Trait((base) => {
		abstract class IHitbox extends base {
			hitbox = hitbox.clone();
		}
		return IHitbox;
	});

export const HTHitbox = Subtrait([THitbox(new HitBox([]))], (base, Param) => {
	class IHHitbox extends base {
		override hitbox: HitBox;
		constructor(props: { hitboxHolder: ImplementsTrait<ReturnType<typeof THitbox>> } & typeof Param) {
			super(props);
			this.hitbox = props.hitboxHolder.hitbox;
		}
	}
	return IHHitbox;
});

export const TCollider = Subtrait([THitbox(new HitBox([]))], (base) => {
	abstract class ICollider extends base {
		abstract position: Position;

		contains(point: Position) {
			return Physic.doCollide(this.position, this.hitbox, point);
		}

		collides(hitbox: HitBox, position: Position) {
			return Physic.doCollide(position, hitbox, this.position);
		}

		intersects(other: ImplementsTrait<typeof TCollider>) {
			return Physic.doHitboxesCollide(this.position, this.hitbox, other.position, other.hitbox);
		}
	}

	return ICollider;
});

export const TGCollider = Subtrait([GridElement, THitbox(new HitBox([]))], (base) => {
	abstract class IGCollider extends base {
		contains(point: Position, grid: ImplementsTrait<typeof TGrid>) {
			return Physic.doCollide(this.getRealPosition(grid), this.hitbox, point);
		}

		collides(hitbox: HitBox, position: Position, grid: ImplementsTrait<typeof TGrid>) {
			return Physic.doCollide(position, hitbox, this.getRealPosition(grid));
		}

		intersects(other: ImplementsTrait<typeof TCollider>, grid: ImplementsTrait<typeof TGrid>) {
			return Physic.doHitboxesCollide(this.getRealPosition(grid), this.hitbox, other.position, other.hitbox);
		}

		gridIntersects(other: ImplementsTrait<typeof TGCollider>) {
			return this.cell.equals(other.cell);
		}
	}

	return IGCollider;
});
