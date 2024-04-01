import { Derive } from "@ddd-ts/traits";
import { Position } from "../../../../shared/position";
import { Caster } from "../../../../shared/traits/cast";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { DragonRecruit } from "../../recruit/implementation/dragon-recruit";
import { PathFinder } from "../../../battle/path-finder";
import { TDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";

export class BattleDragon extends Derive(Caster, TDrawable, TRenderable) {
  speed: number;
  maxLife: number;
  actualLife: number;
  attackSpeed: number;
  attackDamage: number;
  pathFinder: PathFinder;
  constructor(entity: DragonRecruit, public position: Position, public enemyPath: BattlePath, private hooks: BattleArmyHooks) {
    super({});
    this.pathFinder = new PathFinder(enemyPath.getNodes());
    this.speed = entity.speed;
    this.maxLife = entity.maxLife;
    this.actualLife = entity.maxLife;
    this.castSpeed = entity.attackSpeed;
    this.attackDamage = entity.attackDamage;
  }
  canMove() {
    return true;
  }

  isAlive() {
    return this.actualLife > 0;
  }

  onCastResolve() {
    this.enemyPath.alliedCastle.takeDamage(this.attackDamage);
  }

  takeDamage(damage: number) {
    this.actualLife -= damage;
    if (this.actualLife < 0) {
      this.hooks.removeUnit(this);
    }
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

  tick() {
    if (!this.pathFinder.isArrived) {
      this.followPath();
      return;
    }
    this.tickCast();
  }

  get realPosition() {
    return this.position;
  }

  drawPriority = 4;
  draw(context: CanvasRenderingContext2D, position: Position): void {
    const image = Resources.unit.dragon.resource.image;
    const canvasPosition = this.getCanvasPosition(context, position);
    const { width, height } = Resources.unit.dragon.size;
    const size = this.getCanvasSize(context, width, height);
    this.drawImage(context, size, canvasPosition, image);
  }
}
