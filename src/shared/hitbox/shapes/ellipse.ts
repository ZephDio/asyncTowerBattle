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
