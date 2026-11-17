import { Trait } from "@ddd-ts/traits";

// The angle a projectile flies at. Board pieces use TBoardOriented instead.
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
