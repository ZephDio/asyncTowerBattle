import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
import { Physic } from "./physic";

import { TGrid } from "../engine/grid/tgrid";
import { GridElement } from "./traits/grid-element";
import { GridPosition, ScreenPosition } from "./position";

type RelativePosition = GridPosition | ScreenPosition;
export class HitBox {
	HBsize = 1;
	constructor(public hitShapes: [HitShapeType, RelativePosition][]) {}

	scale(size: number) {
		const multiplier = size / this.HBsize;
		this.HBsize = size;
		this.hitShapes.forEach(([shape, relativePosition]) => {
			console.log(shape);
			if (shape instanceof Rectangle) {
				shape.w *= multiplier;
				shape.h *= multiplier;
			}
			if (shape instanceof Ellipse) {
				shape.rx *= multiplier;
				shape.ry *= multiplier;
			}
			relativePosition.x *= multiplier;
			relativePosition.y *= multiplier;
		});
		//console.log(this.hitShapes[0]);
	}

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
		abstract position: RelativePosition;

		contains(point: RelativePosition) {
			return Physic.doCollide(this.position, this.hitbox, point);
		}

		collides(hitbox: HitBox, position: RelativePosition) {
			return Physic.doCollide(position, hitbox, this.position);
		}

		intersects(position: RelativePosition, hitbox: HitBox) {
			return Physic.doHitboxesCollide(this.position, this.hitbox, position, hitbox);
		}
	}

	return ICollider;
});

export const TGCollider = Subtrait([GridElement, THitbox(new HitBox([]))], (base) => {
	abstract class IGCollider extends base {
		contains(point: GridPosition, grid: ImplementsTrait<typeof TGrid>) {
			return Physic.doCollide(this.getRealPosition(grid), this.hitbox, point);
		}

		collides(hitbox: HitBox, position: GridPosition, grid: ImplementsTrait<typeof TGrid>) {
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
