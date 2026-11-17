import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { Physic } from "../../../physic";
import { TGrid } from "../../../../engine/grid/tgrid";
import { GridElement } from "./grid-element";
import { GridPosition } from "../../../position";
import { TCollider } from "./TCollider";
import { HitBox } from "../../../hitbox/hitboxe";
import { THitbox } from "./THitbox";

export const TGCollider = Subtrait([GridElement, THitbox(new HitBox([]))], (base) => {
	abstract class IGCollider extends base {
		contains(point: GridPosition, grid: ImplementsTrait<typeof TGrid>) {
			return Physic.doCollide(this.getRealPosition(grid), this.hitbox, point);
		}

		collides(hitbox: HitBox, position: GridPosition, grid: ImplementsTrait<typeof TGrid>) {
			return Physic.doCollide(position, hitbox, this.getRealPosition(grid));
		}

		intersects(other: ImplementsTrait<typeof TCollider>, grid: ImplementsTrait<typeof TGrid>) {
			return Physic.doHitboxesCollide(this.getRealPosition(grid), this.hitbox, other.position, other.hitbox);
		}

		gridIntersects(other: ImplementsTrait<typeof TGCollider>) {
			return this.cell.equals(other.cell);
		}
	}

	return IGCollider;
});
