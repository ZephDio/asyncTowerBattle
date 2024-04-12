import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { Physic } from "../../../physic";
import { THitbox } from "./THitbox";
import { HitBox, RelativePosition } from "../../../hitbox/hitboxe";

export const TCollider = Subtrait([THitbox(new HitBox([]))], (base) => {
	abstract class ICollider extends base {
		abstract position: RelativePosition;

		contains(point: RelativePosition) {
			return Physic.doCollide(this.position, this.hitbox, point);
		}

		collides(hitbox: HitBox, position: RelativePosition) {
			return Physic.doCollide(position, hitbox, this.position);
		}

		intersects(position: RelativePosition, hitbox: HitBox) {
			return Physic.doHitboxesCollide(this.position, this.hitbox, position, hitbox);
		}

		intersectsWith(other: ImplementsTrait<typeof TCollider>) {
			return Physic.doHitboxesCollide(this.position, this.hitbox, other.position, other.hitbox);
		}
	}

	return ICollider;
});
