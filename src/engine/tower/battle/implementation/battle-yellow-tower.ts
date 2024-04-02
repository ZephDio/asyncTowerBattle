import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, Position } from "../../../../shared/position";
import { Caster } from "../../../../shared/traits/cast";
import { TDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { YellowTowerRecruit } from "../../recruit/implementation/yellow-tower-recruit";
import { BasicBattlePathTile, SlowingBattlePathTile } from "../../../tile/battle/battle-tile";

export class YellowBattleTower extends Derive(TDrawable, TRenderable, Caster) {
  draw: YellowTowerRecruit["draw"];
  drawPriority = 3;
  public attackDamage: number;
  constructor(
    private readonly recruit: YellowTowerRecruit,
    private readonly hooks: BattleArmyHooks,
    public readonly position: Position,
    public readonly cell: Cell
  ) {
    super({});
    this.draw = this.recruit.draw;
    this.attackDamage = recruit.attackDamage;
    this.castSpeed = recruit.attackSpeed;
  }

  takeDamage(_damage: number): void {
    return;
  }

  private attack() {
    const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(this.cell, [
      new Cell({ x: 1, y: 0 }),
      new Cell({ x: -1, y: 0 }),
      new Cell({ x: 0, y: 1 }),
      new Cell({ x: 0, y: -1 }),
    ]);

    for (const neighbor of neighbors) {
      if (neighbor instanceof BasicBattlePathTile || neighbor instanceof SlowingBattlePathTile) {
        const position = this.hooks.gridHooks.getRealPosition(neighbor.cell);
        const areaEffects = this.recruit.getAreaEffect(this.hooks, position, this.attackDamage);
        this.hooks.addAreaEffect(areaEffects, this);
      }
    }
    this.cast = null;
  }

  isAlive() {
    return true;
  }

  onCastResolve(): void {
    this.attack();
    this.cast = null;
  }

  tick() {
    this.tickCast();
  }
}
