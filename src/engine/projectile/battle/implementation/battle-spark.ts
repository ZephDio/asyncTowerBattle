import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/hitboxes";
import { GridPosition } from "../../../../shared/position";
import { HTImageDrawable } from "../../../../shared/traits/drawable";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { PathFinder } from "../../../battle/path-finder";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { Spark } from "../../blueprint/implementation/spark";
import { TGrid } from "../../../grid/tgrid";
import { TRenderable } from "../../../../shared/traits/trenderable";

export class BattleSpark extends Derive(TRenderable, HTHitbox, HTImageDrawable) {
	pathFinder: PathFinder;
	speed: number;
	spreading: boolean = false;

	spreadingLifeSpan = 5;
	touchedTargets: AnyBattleUnit[] = [];

	constructor(
		public projectile: Spark,
		public position: GridPosition,
		public hooks: BattleArmyHooks,
		public target: AnyBattleUnit,
		public damage: number,
	) {
		super({ hitboxHolder: projectile, imageDrawable: projectile });
		this.pathFinder = new PathFinder([target.position]);
		this.speed = this.projectile.baseSpeed;
	}

	canMove() {
		return true;
	}

	followPath(): void {
		if (this.canMove() && !this.pathFinder.isArrived) {
			const [nextPosition, theta] = this.pathFinder.getNextPositionAndOrientation(this.position, this.speed);

			this.updateTheta(theta);
			this.move(nextPosition);
		}
		if (this.pathFinder.isArrived) {
			this.hit();
		}
	}

	tick() {
		if (this.spreading) {
			this.spreadingLifeSpan--;
			if (this.spreadingLifeSpan <= 0) {
				this.hooks.removeProjectile(this);
				return;
			}
			return;
		}
		this.followPath();
	}

	hit() {
		this.target.takeDamage(this.damage);
		this.spread();
	}

	spread() {
		this.spreading = true;
		this.touchedTargets.push(this.target);
		let lastPosition = this.target.position;
		for (let i = 0; i < 5; i++) {
			const nextTarget = this.hooks.searchTarget(lastPosition, this.isValidSpreadTarget.bind(this));
			if (!nextTarget) {
				return;
			}
			lastPosition = nextTarget.position;
			this.touchedTargets.push(nextTarget);
			nextTarget.takeDamage(this.damage / (2 + i * 0.7));
		}
	}

	updateTheta(theta: number) {
		this.angle = theta;
	}

	isValidSpreadTarget(target: AnyBattleUnit, distanceSqrd: number) {
		const range = 9 * 9;
		const alreadyTouched = this.touchedTargets.includes(target);
		return distanceSqrd < range && target.isAlive() && distanceSqrd !== 0 && !alreadyTouched;
	}

	move(newPosition: GridPosition) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}

	override render(context: CanvasRenderingContext2D, grid?: ImplementsTrait<typeof TGrid>): void {
		if (!grid) return;
		if (!this.touchedTargets[0]) {
			super.render(context, grid);
			return;
		}
		const screenPosition = grid?.gridToScreenPosition(this.touchedTargets[0].position);
		let lastPos = this.getCanvasPosition(context, screenPosition);
		for (const target of this.touchedTargets) {
			context.strokeStyle = "blue";
			const targetScreenPosition = grid?.gridToScreenPosition(target.position);
			const canvasPosition = this.getCanvasPosition(context, targetScreenPosition);
			this.drawLine(context, lastPos.x, lastPos.y, canvasPosition.x, canvasPosition.y);
			lastPos = canvasPosition;
		}
	}
}
