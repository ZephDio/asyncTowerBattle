export class GridPosition {
	x: number;
	y: number;
	type = "gridPosition" as const;

	constructor(param: { x: number; y: number }) {
		this.x = param.x;
		this.y = param.y;
	}

	checkReferential(other: GridPosition | ScreenPosition) {
		if (other instanceof ScreenPosition) {
			throw new Error("Both positions must be of the same type");
		}
	}

	add(other: GridPosition) {
		return new GridPosition({ x: this.x + other.x, y: this.y + other.y });
	}

	subtract(other: GridPosition) {
		return new ScreenPosition({ x: this.x - other.x, y: this.y - other.y });
	}

	clone() {
		return new GridPosition({ x: this.x, y: this.y });
	}
}

export class ScreenPosition {
	x: number;
	y: number;
	type = "screenPosition" as const;

	constructor(param: { x: number; y: number }) {
		this.x = param.x;
		this.y = param.y;
	}

	checkReferential(other: GridPosition | ScreenPosition) {
		if (other instanceof GridPosition) {
			throw new Error("Both positions must be of the same type");
		}
	}

	add(other: ScreenPosition | GridPosition) {
		if (other instanceof GridPosition) {
			return new ScreenPosition({ x: this.x + other.x, y: this.y + other.y });
		}
		return new ScreenPosition({ x: this.x + other.x, y: this.y + other.y });
	}

	substract(other: ScreenPosition) {
		return new ScreenPosition({ x: this.x - other.x, y: this.y - other.y });
	}

	clone() {
		return new ScreenPosition({ x: this.x, y: this.y });
	}
}

export class Cell {
	x: number;
	y: number;
	type = "cell";

	constructor(param: { x: number; y: number }) {
		this.x = param.x;
		this.y = param.y;
	}

	down() {
		return new Cell({
			x: this.x,
			y: this.y - 1,
		});
	}

	up() {
		return new Cell({
			x: this.x,
			y: this.y + 1,
		});
	}

	left() {
		return new Cell({
			x: this.x - 1,
			y: this.y,
		});
	}

	right() {
		return new Cell({
			x: this.x + 1,
			y: this.y,
		});
	}

	surrounding() {
		return [this.up(), this.down(), this.left(), this.right()];
	}

	add(other: Cell) {
		return new Cell({
			x: this.x + other.x,
			y: this.y + other.y,
		});
	}

	toHash() {
		return this.x.toString() + this.y.toString();
	}

	isAdjascentTo(other: Cell) {
		return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) === 1;
	}

	equals(other: Cell) {
		return this.x === other.x && this.y === other.y;
	}

	divideBy(divisor: number) {
		return new Cell({
			x: this.x / divisor,
			y: this.y / divisor,
		});
	}

	clone() {
		return new Cell({ x: this.x, y: this.y });
	}
}
