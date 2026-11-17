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
