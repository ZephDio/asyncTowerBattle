import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { TLifeBarRenderable } from "../../../shared/traits/render/huds/life-bar-renderable";
import { HaveStats } from "../../stats/stats";
import { GridPosition } from "../../../shared/position";
import { TSizable } from "../../../shared/traits/engine/core/sizable";

export const TBattleUnit = Subtrait(
	[TCollider, HTHitbox, HTImageDrawable, TSizable, TLifeBarRenderable, HaveStats],
	(base) => {
		abstract class IBattleUnit extends base {
			isAlive() {
				return this.stats.health > 0;
			}
			abstract tick(): void;
			abstract override position: GridPosition;
		}
		return IBattleUnit;
	},
);

export type AnyBattleUnit = ImplementsTrait<typeof TBattleUnit>;
