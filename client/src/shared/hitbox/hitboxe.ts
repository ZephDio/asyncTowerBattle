import { GridPosition, ScreenPosition } from "../position";
import { HitShapeType } from "./shapes/hit-shapes";
import { Ellipse } from "./shapes/ellipse";
import { Rectangle } from "./shapes/rectangle";

export type RelativePosition = GridPosition | ScreenPosition;
export class HitBox {
	HBsize = 1;
	constructor(public hitShapes: [HitShapeType, RelativePosition][]) {}

	scale(size: number) {
		const multiplier = size / this.HBsize;
		this.HBsize = size;
		this.hitShapes.forEach(([shape, relativePosition]) => {
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
	}

	clone() {
		return new HitBox(this.hitShapes.map(([shape, position]) => [shape.clone(), position.clone()]));
	}
}
