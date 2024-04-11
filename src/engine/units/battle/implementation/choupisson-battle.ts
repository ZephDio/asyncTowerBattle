import { GridPosition } from "../../../../shared/position";
import { Cast, Caster } from "../../../../shared/traits/cast";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { PathFinder } from "../../../battle/path-finder";
import { HTImageDrawable, TLifeBarRenderable } from "../../../../shared/traits/drawable";
import { HaveStats } from "../../../stats/stats";
import { HTHitbox, TCollider } from "../../../../shared/hitboxes";
import { Derive } from "@ddd-ts/traits";
import { Choupisson } from "../../recruit/implementation/choupisson-recruit";
import { BattleSpine } from "../../../projectile/battle/implementation/battle-spine";
import { Spine } from "../../../projectile/blueprint/implementation/spine";

export class BattleChoupisson extends Derive(
	HTHitbox,
	TCollider,
	Caster,
	HTImageDrawable,
	TLifeBarRenderable,
	HaveStats,
) {
	pathFinder: PathFinder;

	constructor(
		recruit: Choupisson,
		public position: GridPosition,
		public enemyPath: BattlePath,
		private hooks: BattleArmyHooks,
	) {
		super({
			imageDrawable: recruit,
			maxHealth: recruit.maxLife,
			attack: recruit.attackDamage,
			movementSpeed: recruit.speed,
			castSpeed: recruit.attackSpeed,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}
	canMove() {
		return true;
	}

	isAlive() {
		return this.stats.health > 0;
	}

	attackCastle() {
		this.enemyPath.alliedCastle.takeDamage(this.stats.attack);
		this.castInProgress = null;
	}
	casts(): void {
		this.castInProgress = new Cast(this, this.attackCastle.bind(this), 100);
	}

	override takeDamage(damage: number) {
		const { below, left, right } = this.hooks.gridHooks.getRelativeDirection();
		left.x = left.x * 0.25;
		right.x = right.x * 0.25;
		const vectorLeft = below.add(left);
		const vectorRight = below.add(right);
		const spines = [
			new BattleSpine(new Spine(), this.position.clone(), this.hooks, this.stats.attack * 1.7, below),
			new BattleSpine(new Spine(), this.position.clone(), this.hooks, this.stats.attack * 1.7, vectorLeft),
			new BattleSpine(new Spine(), this.position.clone(), this.hooks, this.stats.attack * 1.7, vectorRight),
		];
		spines.forEach((spine) => this.hooks.addProjectile(spine, this));
		this.stats.takeDamage(damage);
	}

	followPath(): void {
		if (this.canMove() && !this.pathFinder.isArrived) {
			const newPosition = this.pathFinder.getNextPosition(this.position, this.stats.movementSpeed);
			this.move(newPosition);
		}
	}

	move(newPosition: GridPosition) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}

	tick() {
		this.stats.tick();
		if (!this.pathFinder.isArrived) {
			this.followPath();
			return;
		}

		this.tickCast();
	}

	get realPosition() {
		return this.position;
	}
}
