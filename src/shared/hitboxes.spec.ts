import { Derive } from "@ddd-ts/traits";
import { Rectangle } from "./hitbox/shapes/rectangle";
import { THitbox } from "./traits/engine/core/THitbox";
import { HitBox } from "./hitbox/hitboxe";
import { GridPosition } from "./position";
import { TCollider } from "./traits/engine/core/TCollider";
import { Ellipse } from "./hitbox/shapes/ellipse";

describe("TCollider", () => {
	it("square to square", () => {
		class A extends Derive(
			TCollider,
			THitbox(new HitBox([[new Rectangle({ height: 5, width: 5 }), new GridPosition({ x: 0, y: 0 })]])),
		) {
			position: GridPosition;
			constructor(x: number, y: number) {
				super({});
				this.position = new GridPosition({ x, y });
			}
		}

		expect(new A(0, 0).intersectsWith(new A(0, 0))).toBe(true); // exact same GridPosition

		expect(new A(0, 0).intersectsWith(new A(4, 0))).toBe(true); // x touching
		expect(new A(0, 0).intersectsWith(new A(6, 0))).toBe(false); // x not touching

		expect(new A(0, 0).intersectsWith(new A(0, 4))).toBe(true); // y touching
		expect(new A(0, 0).intersectsWith(new A(0, 6))).toBe(false); // y not touching

		expect(new A(0, 0).intersectsWith(new A(4, 4))).toBe(true); // both touching
		expect(new A(0, 0).intersectsWith(new A(6, 6))).toBe(false); // both not touching
	});

	it("circle to circle", () => {
		class A extends Derive(
			TCollider,
			THitbox(new HitBox([[new Ellipse({ height: 10, width: 10 }), new GridPosition({ x: 0, y: 0 })]])),
		) {
			position: GridPosition;
			constructor(x: number, y: number) {
				super({});
				this.position = new GridPosition({ x, y });
			}
		}

		expect(new A(0, 0).intersectsWith(new A(0, 0))).toBe(true); // exact same GridPosition

		expect(new A(0, 0).intersectsWith(new A(9.5, 0))).toBe(true); // x touching
		expect(new A(0, 0).intersectsWith(new A(10.5, 0))).toBe(false); // x not touching

		expect(new A(0, 0).intersectsWith(new A(0, 9.5))).toBe(true); // y touching
		expect(new A(0, 0).intersectsWith(new A(0, 10.5))).toBe(false); // y not touching

		expect(new A(0, 0).intersectsWith(new A(7, 7))).toBe(true); // both touching
		expect(new A(5, 5).intersectsWith(new A(-5, -5))).toBe(false); // both not touching
	});

	it("square to circle", () => {
		class A extends Derive(
			TCollider,
			THitbox(new HitBox([[new Rectangle({ height: 5, width: 5 }), new GridPosition({ x: 0, y: 0 })]])),
		) {
			position: GridPosition;
			constructor(x: number, y: number) {
				super({});
				this.position = new GridPosition({ x, y });
			}
		}

		class B extends Derive(
			TCollider,
			THitbox(new HitBox([[new Ellipse({ width: 10, height: 10 }), new GridPosition({ x: 0, y: 0 })]])),
		) {
			position: GridPosition;
			constructor(x: number, y: number) {
				super({});
				this.position = new GridPosition({ x, y });
			}
		}

		expect(new A(0, 0).intersectsWith(new B(0, 0))).toBe(true); // exact same GridPosition

		expect(new A(0, 0).intersectsWith(new B(7, 0))).toBe(true); // x touching
		expect(new A(0, 0).intersectsWith(new B(8, 0))).toBe(false); // x not touching

		expect(new A(0, 0).intersectsWith(new B(0, 7))).toBe(true); // y touching
		expect(new A(0, 0).intersectsWith(new B(0, 8))).toBe(false); // y not touching

		expect(new A(0, 0).intersectsWith(new B(5, 5))).toBe(true); // both touching
		expect(new A(0, 0).intersectsWith(new B(7, 7))).toBe(false); // both not touching
	});

	it("circle to square", () => {
		class A extends Derive(
			TCollider,
			THitbox(new HitBox([[new Ellipse({ width: 10, height: 10 }), new GridPosition({ x: 0, y: 0 })]])),
		) {
			position: GridPosition;
			constructor(x: number, y: number) {
				super({});
				this.position = new GridPosition({ x, y });
			}
		}

		class B extends Derive(
			TCollider,
			THitbox(new HitBox([[new Rectangle({ width: 5, height: 5 }), new GridPosition({ x: 0, y: 0 })]])),
		) {
			position: GridPosition;
			constructor(x: number, y: number) {
				super({});
				this.position = new GridPosition({ x, y });
			}
		}

		expect(new A(0, 0).intersectsWith(new B(0, 0))).toBe(true); // exact same GridPosition

		expect(new A(0, 0).intersectsWith(new B(7, 0))).toBe(true); // x touching
		expect(new A(0, 0).intersectsWith(new B(8, 0))).toBe(false); // x not touching

		expect(new A(0, 0).intersectsWith(new B(0, 7))).toBe(true); // y touching
		expect(new A(0, 0).intersectsWith(new B(0, 8))).toBe(false); // y not touching

		expect(new A(0, 0).intersectsWith(new B(5, 5))).toBe(true); // both touching
		expect(new A(0, 0).intersectsWith(new B(7, 7))).toBe(false); // both not touching
	});
});
