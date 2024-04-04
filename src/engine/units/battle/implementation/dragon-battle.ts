import { Derive } from "@ddd-ts/traits";
import { Position } from "../../../../shared/position";
import { Caster } from "../../../../shared/traits/cast";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { DragonRecruit } from "../../recruit/implementation/dragon-recruit";
import { PathFinder } from "../../../battle/path-finder";
import { HTImageDrawable, TLifeBarRenderable } from "../../../../shared/traits/drawable";
import { HaveStats, Stats } from "../../../stats/stats";

export class BattleDragon extends Derive(Caster, HTImageDrawable,TLifeBarRenderable, HaveStats) {

  pathFinder: PathFinder;

  stats: Stats;
  constructor(recruit: DragonRecruit, public position: Position, public enemyPath: BattlePath, private hooks: BattleArmyHooks) {
    super({
      imageDrawable: recruit,
      maxHealth: recruit.maxLife,
      attack: recruit.attackDamage,
      movementSpeed: recruit.speed,
      castSpeed: recruit.attackSpeed,
      onDeath: () => this.hooks.removeUnit(this),
    });
    this.pathFinder = new PathFinder(enemyPath.getNodes());
    this.stats = new Stats(recruit.maxLife, recruit.attackDamage, recruit.speed, recruit.attackSpeed, () => this.hooks.removeUnit(this));
  }
  canMove() {
    return true;
  }

  isAlive() {
    return this.stats.health > 0;
  }

  onCastResolve() {
    this.enemyPath.alliedCastle.takeDamage(this.stats.attack);
    this.cast = null;
  }

  takeDamage(damage: number) {
    this.stats.takeDamage(damage);
  }

  followPath(): void {
    if (this.canMove() && !this.pathFinder.isArrived) {
      const newPosition = this.pathFinder.getNextPosition(this.position, this.stats.movementSpeed);
      this.move(newPosition);
    }
  }

  move(newPosition: Position) {
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

  get huds() {
    return [];
  }

  get realPosition() {
    return this.position;
  }
}
