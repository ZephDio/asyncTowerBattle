import { Derive } from "@ddd-ts/traits";
import { Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { SoldierRecruit } from "../../recruit/implementation/soldier-recruit";
import { PathFinder } from "../../../battle/path-finder";
import { Caster } from "../../../../shared/traits/cast";
import { TDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";

export class BattleSoldier extends Derive(Caster, TDrawable, TRenderable) {
  speed: number;
  maxLife: number;
  actualLife: number;
  attackDamage: number;
  pathFinder: PathFinder;
  constructor(recruit: SoldierRecruit, public position: Position, public enemyPath: BattlePath, private hooks: BattleArmyHooks) {
    super({});
    this.pathFinder = new PathFinder(enemyPath.getNodes());
    this.speed = recruit.speed;
    this.maxLife = recruit.maxLife;
    this.actualLife = recruit.maxLife;
    this.castSpeed = recruit.attackSpeed;
    this.attackDamage = recruit.attackDamage;
  }
  canMove() {
    return true;
  }

  onCastResolve(): void {
    this.enemyPath.alliedCastle.takeDamage(this.attackDamage);
    this.cast = null
  }

  drawPriority = 4;
  draw(context: CanvasRenderingContext2D, position: Position): void {
    const image = Resources.unit.soldier.resource.image;
    const { width, height } = Resources.unit.soldier.size;
    const size = this.getCanvasSize(context, width, height);
    const canvasPosition = this.getCanvasPosition(context, position);
    this.drawImage(context, size, canvasPosition, image);
  }

  isAlive() {
    return this.actualLife > 0;
  }

  followPath(): void {
    if (this.canMove() && !this.pathFinder.isArrived) {
      const newPosition = this.pathFinder.getNextPosition(this.position, this.speed);
      this.move(newPosition);
    }
  }

  move(newPosition: Position) {
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;
  }

  takeDamage(damage: number): void {
    this.actualLife -= damage;
    if (this.actualLife < 0) {
      this.hooks.removeUnit(this);
    }
  }

  tick() {
    if (!this.pathFinder.isArrived) {
      this.followPath();
      return;
    }
    this.tickCast();
  }
}
