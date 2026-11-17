import { Trait, implementsTrait } from "@ddd-ts/traits";
import { HTHitbox } from "./THitbox";

export const TSizable = Trait((base) => {
	abstract class ISizable extends base {
		sizeScale = 1;

		addSize(size: number) {
			this.sizeScale += size;
			if (implementsTrait(this, HTHitbox)) {
				this.hitbox.scale(this.sizeScale);
			}
		}

		setSize(size: number) {
			this.sizeScale = size;
			if (implementsTrait(this, HTHitbox)) {
				this.hitbox.scale(this.sizeScale);
			}
		}

		getSize() {
			return this.sizeScale;
		}
	}

	return ISizable;
});
