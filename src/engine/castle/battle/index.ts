import { Caster } from "../../../shared/traits/engine/cast";
import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { Orientable } from "../../../shared/traits/engine/core/orientable";
import { HTDescriptor } from "../../../shared/traits/render/huds/item-descriptor";
import { GridElement } from "../../../shared/traits/engine/core/grid-element";
import { HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { GridPosition } from "../../../shared/position";

export type AnyBattleCastle = ImplementsTrait<typeof TBattleCastle>;

export const TBattleCastle = Subtrait(
	[HTHitbox, TRenderable, HTImageDrawable, GridElement, Caster, Orientable, HTDescriptor],
	(base) => {
		abstract class TBattleCastle extends base {
			abstract override position: GridPosition;
			abstract produceFood(): void;
			isAlive() {
				return this.stats.health > 0;
			}

			tick() {
				this.produceFood();
				this.tickCast();
			}

			takeDamage(damageAmount: number) {
				this.stats.takeDamage(damageAmount);
			}
		}
		return TBattleCastle;
	},
);
