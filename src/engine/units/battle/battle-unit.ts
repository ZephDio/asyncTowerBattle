import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { TLifeBarRenderable } from "../../../shared/traits/render/huds/life-bar-renderable";
import { HaveStats } from "../../stats/stats";
import { GridPosition } from "../../../shared/position";
import { TSizable } from "../../../shared/traits/engine/core/sizable";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { PathFinder } from "../../battle/path-finder";
import { Action } from "../../../shared/action";

export const TBattleUnit = Subtrait(
	[TCollider, HTHitbox, HTImageDrawable, TSizable, TLifeBarRenderable, HaveStats],
	(base) => {
		abstract class IBattleUnit extends base {
			clock: number = 0;
			abstract override position: GridPosition;
			abstract enemyPath: BattlePath;
			abstract hooks: BattleArmyHooks;

			abstract pathFinder: PathFinder;

			abstract canMove(): boolean;
			action = null as null | Action;
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
				if (this.action === null) {
					this.action = new Action(this.stats.attackSpeed, () => {
						this.attackCastle();
					});
					return;
				}
				this.action.tick();
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
				this.enemyPath.alliedCastle.takeDamage(this.stats.attack);
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
				this.stats.takeDamage(1);
			}
		}
		return IBattleUnit;
	},
);

export type AnyBattleUnit = ImplementsTrait<typeof TBattleUnit>;
