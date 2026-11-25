import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { TLifeBarRenderable } from "../../../shared/traits/render/huds/life-bar-renderable";
import { GridPosition } from "../../../shared/position";
import { TSizable } from "../../../shared/traits/engine/core/sizable";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { PathFinder } from "../../battle/path-finder";
import { Action } from "../../../shared/action";
import { movementSpeedToDistancePerTick } from "../../../shared/seconds";
import {
	HTDescriptor,
	LiveLine,
	TLiveDescriptor,
	UnitLinesDescription,
	formatStat,
	liveStat,
} from "../../../shared/traits/render/huds/item-descriptor";
import { TStatsRenderable } from "../../../shared/traits/render/huds/stat-renderable";
import { HTTag } from "../../../shared/traits/engine/tags/tagged";
import { HTRarity } from "../../../shared/traits/engine/rarity";
import { TIdleAnimation } from "../../../shared/traits/render/idle-animation";

export const TBattleUnit = Subtrait(
	[
		TCollider,
		HTHitbox,
		HTImageDrawable,
		TSizable,
		TLifeBarRenderable,
		TStatsRenderable,
		HTDescriptor,
		TLiveDescriptor,
		HTTag,
		HTRarity,
		TIdleAnimation,
	],
	(base) => {
		abstract class IBattleUnit extends base {
			hunger = 0;
			clock: number = 0;
			abstract override position: GridPosition;
			abstract enemyPath: BattlePath;
			abstract hooks: BattleArmyHooks;

			abstract pathFinder: PathFinder;

			attackAction = null as null | Action;
			canMove() {
				return this.stats.canMove();
			}
			isAlive() {
				return this.stats.health > 0;
			}
			tick() {
				this.clock++;
				this.stats.tick();
				this.consumeFood();
				if (!this.pathFinder.isArrived) {
					this.followPath();
					return;
				}
				if (this.attackAction === null) {
					this.attackAction = new Action(this.stats.attackSpeed, () => {
						this.attackCastle();
						this.attackAction = null;
					});
					return;
				}
				this.attackAction.tick();
			}
			move(newPosition: GridPosition) {
				this.position.x = newPosition.x;
				this.position.y = newPosition.y;
			}

			followPath(): void {
				if (this.canMove() && !this.pathFinder.isArrived) {
					const newPosition = this.pathFinder.getNextPosition(
						this.position,
						movementSpeedToDistancePerTick(this.stats.movementSpeed),
					);
					this.move(newPosition);
				}
			}

			// Production time only matters before the unit exists, so it keeps its static value.
			liveLines(): Record<Exclude<keyof UnitLinesDescription, "production time">, LiveLine> {
				const { stats } = this;
				return {
					health: liveStat(
						`${formatStat(stats.health)}/${formatStat(stats.maxHealth)}`,
						stats.health,
						stats.base.maxHealth,
					),
					"castle damage": liveStat(formatStat(stats.castleDamage), stats.castleDamage, stats.base.castleDamage),
					"move speed": liveStat(formatStat(stats.movementSpeed), stats.movementSpeed, stats.base.movementSpeed),
					"food consumption": liveStat(formatStat(stats.foodCost), stats.foodCost, stats.base.foodCost, false),
				};
			}

			attackCastle() {
				this.enemyPath.alliedCastle.takeHit(this.stats.castleDamage);
				this.hooks.notifyEnemyCastleHit();
				// Reaching the castle is not a death: the unit leaves the battle without its on-death effects.
				this.hooks.removeUnit(this);
			}

			consumeFood() {
				if (!(this.clock % 64 === 0)) return;
				const succes = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
				if (succes) {
					this.stats.heal(1);
					return;
				}
				this.hunger += 2;
				this.stats.takeDamage(this.hunger);
			}
		}
		return IBattleUnit;
	},
);

export type AnyBattleUnit = ImplementsTrait<typeof TBattleUnit>;
