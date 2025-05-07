import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { TPhysics } from "../../../../shared/traits/engine/core/physics";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { Orientable } from "../../../../shared/traits/engine/core/orientable";
import { HTDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";

export type AnyBattleTotem = ImplementsTrait<typeof BattleTotem>;

export const BattleTotem = Subtrait(
	[HTHitbox, TPhysics, HTImageDrawable, TRenderable, GridElement, Orientable, HTDescriptor],
	(base) => {
		abstract class TBattleTotem extends base {
			get realPosition() {
				return this.gridShape.getCenterPosition(this.cell, this.orientation);
			}

			isAlive(): boolean {
				return true;
			}

			takeDamage(_damage: number): void {
				return;
			}
		}
		return TBattleTotem;
	},
);
