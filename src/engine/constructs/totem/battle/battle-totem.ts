import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { HTDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { HTTag } from "../../../../shared/traits/engine/tags/tagged";

export type AnyBattleTotem = ImplementsTrait<typeof BattleTotem>;

export const BattleTotem = Subtrait(
	[HTHitbox, HTImageDrawable, TRenderable, GridElement, HTDescriptor, HTTag],
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

			abstract tick(): void;
		}
		return TBattleTotem;
	},
);
