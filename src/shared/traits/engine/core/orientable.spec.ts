import { toDirection } from "./orientable";

describe("toDirection", () => {
	it("maps each quarter turn to its direction", () => {
		expect(toDirection(0)).toBe("right");
		expect(toDirection(Math.PI / 2)).toBe("up");
		expect(toDirection(Math.PI)).toBe("left");
		expect(toDirection((3 * Math.PI) / 2)).toBe("down");
	});

	it("snaps to the nearest direction", () => {
		expect(toDirection(0.2)).toBe("right");
		expect(toDirection(2 * Math.PI - 0.2)).toBe("right");
		expect(toDirection(Math.PI / 2 + 0.7)).toBe("up");
	});

	it("handles angles out of [0, 2π)", () => {
		expect(toDirection(-Math.PI / 2)).toBe("down");
		expect(toDirection(-Math.PI)).toBe("left");
		expect(toDirection((5 * Math.PI) / 2)).toBe("up");
		expect(toDirection(-5 * Math.PI)).toBe("left");
	});
});
