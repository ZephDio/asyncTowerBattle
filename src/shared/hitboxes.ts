import { ImplementsTrait, Trait } from "@ddd-ts/traits";
import { Position } from "./position";
import { Size } from "./size";
import { Shape } from "@ddd-ts/shape";

export class HitBox {
	constructor(public hitShapes: [HitShape, Position][]) { }
}

type HitShapeType = "rectangle" | "ellipse";

export class HitShape {
	constructor(
		public type: HitShapeType,
		public size: Size,
	) { }
}

export const TCollider = (body: (Rectangle | Circle)[]) => Trait(base => {
	abstract class ICollider extends base {
		body = body;
		abstract position: Position;

		contains(point: Position) {
			for (const shape of this.body) {
				if (shape instanceof Rectangle) {
					const x1 = this.position.x - shape.w / 2;
					const y1 = this.position.y - shape.h / 2;
					if (point.x > x1 && point.x < x1 + shape.w && point.y > y1 && point.y < y1 + shape.h) {
						return true;
					}
				}
				if (shape instanceof Circle) {
					const distance =
						(this.position.x - point.x) ** 2 +
						(this.position.y - point.y) ** 2

					if (distance < shape.r ** 2) {
						return true;
					}
				}
			}
			return false;
		}

		intersects(other: ImplementsTrait<ReturnType<typeof TCollider>>) {
			for (const shape of this.body) {
				for (const otherShape of other.body) {
					if (shape instanceof Rectangle && otherShape instanceof Rectangle) {
						// check for square collision
						const x1 = this.position.x - shape.w / 2;
						const y1 = this.position.y - shape.h / 2;
						const x2 = other.position.x - otherShape.w / 2;
						const y2 = other.position.y - otherShape.h / 2;

						if (x1 < x2 + otherShape.w &&
							x1 + shape.w > x2 &&
							y1 < y2 + otherShape.h &&
							y1 + shape.h > y2) {
							return true;
						}
					}
					if (shape instanceof Circle && otherShape instanceof Circle) {
						// check for circle collision
						const distance =
							(this.position.x - other.position.x) ** 2 +
							(this.position.y - other.position.y) ** 2

						if (distance < (shape.r + otherShape.r) ** 2) {
							return true;
						}
					}
					if (shape instanceof Rectangle && otherShape instanceof Circle) {
						// check for square circle collision
						const circleDistanceX = Math.abs(other.position.x - this.position.x);
						const circleDistanceY = Math.abs(other.position.y - this.position.y);

						if (circleDistanceX > (shape.w / 2 + otherShape.r)) {
							continue;
						}
						if (circleDistanceY > (shape.h / 2 + otherShape.r)) {
							continue
						}

						if (circleDistanceX <= (shape.w / 2)) { return true; }
						if (circleDistanceY <= (shape.h / 2)) { return true; }

						const cornerDistance_sq = (circleDistanceX - shape.w / 2) ** 2 +
							(circleDistanceY - shape.h / 2) ** 2;

						return (cornerDistance_sq <= (otherShape.r ** 2));
					}
					if (shape instanceof Circle && otherShape instanceof Rectangle) {
						// check for circle square collision
						const circleDistanceX = Math.abs(other.position.x - this.position.x);
						const circleDistanceY = Math.abs(other.position.y - this.position.y);

						if (circleDistanceX > (otherShape.w / 2 + shape.r)) {
							continue;
						}
						if (circleDistanceY > (otherShape.h / 2 + shape.r)) {
							continue
						}

						if (circleDistanceX <= (otherShape.w / 2)) { return true; }
						if (circleDistanceY <= (otherShape.h / 2)) { return true; }

						const cornerDistance_sq = (circleDistanceX - otherShape.w / 2) ** 2 +
							(circleDistanceY - otherShape.h / 2) ** 2;

						return (cornerDistance_sq <= (shape.r ** 2));
					}
				}
			}
			return false
		}
	}

	return ICollider;
})


export class Rectangle extends Shape({ w: Number, h: Number }) { }
export class Circle extends Shape({ r: Number }) { }