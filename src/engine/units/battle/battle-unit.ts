import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox, TCollider } from "../../../shared/hitboxes";
import { HTImageDrawable, TLifeBarRenderable } from "../../../shared/traits/drawable";
import { HaveStats } from "../../stats/stats";
import { GridPosition } from "../../../shared/position";
import { TSizable } from "../../../shared/traits/sizable";

export const TBattleUnit = Subtrait(
	[HTHitbox, TCollider, HTImageDrawable, TSizable, TLifeBarRenderable, HaveStats],
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
