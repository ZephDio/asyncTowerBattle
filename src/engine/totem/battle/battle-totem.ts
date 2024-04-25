import { Subtrait } from "@ddd-ts/traits";
import { BattleCropsField } from "./implementation/battle-crops-field";
import { BattleGobelinPortal } from "./implementation/battle-gobelin-portal";
import { OrangeBattleTotem } from "./implementation/battle-orange-totem";
import { BattleWindmill } from "./implementation/battle-windmill";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { TPhysics } from "../../../shared/traits/engine/core/physics";
import { HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { GridElement } from "../../../shared/traits/engine/core/grid-element";
import { Orientable } from "../../../shared/traits/engine/core/orientable";

export type AnyBattleTotem = OrangeBattleTotem | BattleGobelinPortal | BattleCropsField | BattleWindmill;

export const BattleTotem = Subtrait(
	[HTHitbox, TPhysics, HTImageDrawable, TRenderable, GridElement, Orientable],
	(base) => {
		abstract class TBattleTotem extends base {
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
