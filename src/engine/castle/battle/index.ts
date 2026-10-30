import { Cast, Caster } from "../../../shared/traits/engine/cast";
import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { HTDescriptor } from "../../../shared/traits/render/huds/item-descriptor";
import { GridElement } from "../../../shared/traits/engine/core/grid-element";
import { HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { GridPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { castCostFromFrames } from "../../../shared/seconds";
import { HTTag } from "../../../shared/traits/engine/tags/tagged";

export type AnyBattleCastle = ImplementsTrait<typeof TBattleCastle>;

export const TBattleCastle = Subtrait(
	[HTHitbox, TRenderable, HTImageDrawable, GridElement, Caster, HTDescriptor, HTTag],
	(base) => {
		abstract class TBattleCastle extends base {
			abstract override position: GridPosition;
			abstract produceFood(): void;
			public hooks: BattleArmyHooks;
			initHooks(hooks: BattleArmyHooks) {
				this.hooks = hooks;
			}

			override get castTime() {
				return castCostFromFrames(this.hooks.getDefaultUnit().stats.summonTime / 31.25);
			}

			casts() {
				this.castInProgress = new Cast(
					this,
					this.onCastResolve.bind(this),
					castCostFromFrames(this.hooks.getDefaultUnit().stats.summonTime),
				);
			}

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

			onCastResolve() {
				this.hooks.addUnits(
					this.hooks.getDefaultUnit().toBattle(this.position.clone(), this.hooks.getEnemyPath(), this.hooks),
					this,
				);
				this.finishCast(true);
			}
		}
		return TBattleCastle;
	},
);
