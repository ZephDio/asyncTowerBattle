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
import { HTDescriptor } from "../../../shared/traits/render/huds/item-descriptor";
import { TStatsRenderable } from "../../../shared/traits/render/huds/stat-renderable";

export const TBattleUnit = Subtrait(
	[TCollider, HTHitbox, HTImageDrawable, TSizable, TLifeBarRenderable, TStatsRenderable, HTDescriptor],
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
					const newPosition = this.pathFinder.getNextPosition(this.position, this.stats.movementSpeed);
					this.move(newPosition);
				}
			}

			attackCastle() {
				this.enemyPath.alliedCastle.takeHit(this.stats.attack);
				this.hooks.removeUnit(this);
				this.stats.die(); // TODO
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
