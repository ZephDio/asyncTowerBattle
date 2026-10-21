import { Trait } from "@ddd-ts/traits";

// The four directions a grid element can face, in trigonometric order (y points up on screen)
export type Direction = "right" | "up" | "left" | "down";

const DIRECTIONS: Record<number, Direction> = { 0: "right", 1: "up", 2: "left", 3: "down" };

// Snaps any angle, negative or above 2π, to the nearest direction
export const toDirection = (orientation: number): Direction => {
	const quarterTurns = Math.round(orientation / (Math.PI / 2));
	return DIRECTIONS[((quarterTurns % 4) + 4) % 4] ?? "right";
};

export const Orientable = Trait((base) => {
	abstract class TOrientable extends base {
		_orientation: number = (3 * Math.PI) / 2;
		setOrientation(orientation: number) {
			this._orientation = orientation;
		}
		get orientation() {
			return this._orientation;
		}
		get direction() {
			return toDirection(this._orientation);
		}
	}
	return TOrientable;
});
