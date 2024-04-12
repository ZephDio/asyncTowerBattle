import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
import { HitBox } from "../../../hitbox/hitboxe";

export const THitbox = (hitbox: HitBox) =>
	Trait((base) => {
		abstract class IHitbox extends base {
			hitbox = hitbox.clone();
		}
		return IHitbox;
	});

export const HTHitbox = Subtrait([THitbox(new HitBox([]))], (base, Param) => {
	class IHHitbox extends base {
		override hitbox: HitBox;
		constructor(props: { hitboxHolder: ImplementsTrait<ReturnType<typeof THitbox>> } & typeof Param) {
			super(props);
			this.hitbox = props.hitboxHolder.hitbox;
		}
	}
	return IHHitbox;
});
