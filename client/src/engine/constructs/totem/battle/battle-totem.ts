import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import {
	CasterDescription,
	DescriptionLine,
	HTDescriptor,
	TLiveDescriptionText,
} from "../../../../shared/traits/render/huds/item-descriptor";
import { Caster } from "../../../../shared/traits/engine/cast";
import { HTTag } from "../../../../shared/traits/engine/tags/tagged";
import { HTRarity } from "../../../../shared/traits/engine/rarity";

export type AnyBattleTotem = ImplementsTrait<typeof BattleTotem>;

export const BattleTotem = Subtrait(
	[HTHitbox, HTImageDrawable, TRenderable, GridElement, HTDescriptor, HTTag, HTRarity],
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

// A totem that acts on a timer. Its description's cast time follows its cast speed during the battle.
export const CasterTotem = Subtrait([BattleTotem, Caster, TLiveDescriptionText], (base) => {
	abstract class TCasterTotem extends base {
		liveDescription(): DescriptionLine[] {
			if (!(this.description instanceof CasterDescription)) return this.description.description;
			return this.description.liveDescription(this.castSpeed);
		}
	}
	return TCasterTotem;
});
