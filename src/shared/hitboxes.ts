import { Position } from "./position";
import { Size } from "./size";

export class HitBox {
	constructor(public hitShapes: [HitShape, Position][]) {}
}

type HitShapeType = "rectangle" | "ellipse";

export class HitShape {
	constructor(
		public type: HitShapeType,
		public size: Size,
	) {}
}
