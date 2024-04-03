import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, Position } from "../../../../shared/position";
import { Caster } from "../../../../shared/traits/cast";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { YellowTowerRecruit } from "../../recruit/implementation/yellow-tower-recruit";
import { GridElement } from "../../../grid/grid";
import { HaveStats, Stats } from "../../../stats/stats";
import { Status } from "../../../../shared/traits/status";
import { SlowingBattlePathTile } from "../../../tile/battle/implementation/slowing-battle-tile";
import { BasicBattlePathTile } from "../../../tile/battle/implementation/basic-battle-tile";

export class YellowBattleTower extends Derive(TRenderable, Caster, HTImageDrawable, GridElement, HaveStats) {
  constructor(
    private readonly recruit: YellowTowerRecruit,
    private readonly hooks: BattleArmyHooks,
    public readonly position: Position,
    public readonly cell: Cell
  ) {
    super({
      imageDrawable: recruit,
      maxHealth: NaN,
      attack: recruit.attackDamage,
      movementSpeed: NaN,
      castSpeed: recruit.attackSpeed,
      onDeath: () => {},
    });
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
        const areaEffects = this.recruit.getAreaEffect(this.hooks, position, this.stats.attack);
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
    this.stats.tick();
  }
}

export class Poisoned extends Derive(Status) {
  key = "poisoned";
  clock = 0;
  duration = 120;
  stats: Stats;

  constructor(public damage: number) {
    super({});
  }
  tick() {
    this.clock++;
    if (this.clock >= this.duration) {
      this.onRemove();
    }
    this.stats.takeDamage(this.damage / 32);
  }

  onRemove() {
    this.stats.removeStatus(this);
  }
}
