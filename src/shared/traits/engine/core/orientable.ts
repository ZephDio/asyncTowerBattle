import { Trait } from "@ddd-ts/traits";

export const Orientable = Trait((base) => {
	abstract class TOrientable extends base {
		_orientation: number = (3 * Math.PI) / 2;
		setOrientation(orientation: number) {
			this._orientation = orientation;
		}
		get orientation() {
			return this._orientation;
		}
	}
	return TOrientable;
});
