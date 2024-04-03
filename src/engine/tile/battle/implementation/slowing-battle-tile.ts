import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitboxes";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { Cell, Position } from "../../../../shared/position";
import { Status } from "../../../../shared/traits/status";
import { Stats } from "../../../stats/stats";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { SlowingPathTile } from "../../entity/implementation/slowing-tile";

export class SlowingBattlePathTile extends Derive(TRenderable, HTImageDrawable) {
  public hitbox: HitBox;

  constructor(pathTile: SlowingPathTile, public cell: Cell, public position: Position, private hooks: BattleArmyHooks) {
    super({ imageDrawable: pathTile });
    this.hitbox = pathTile.hitbox;
  }

  tick() {
    const unitsStepping = this.hooks.searchEnemyInArea(this.position, this.hitbox);
    for (const unitStepping of unitsStepping) {
      unitStepping.addStatus(new BoggedDown({}));
    }
  }
}

export class BoggedDown extends Derive(Status) {
  key = "boggedDown";
  clock = 0;
  duration = 3;
  stats: Stats;
  didTrigger = false;
  tick() {
    this.clock++;
    if (this.clock >= this.duration) {
      this.onRemove();
    }

    if (this.didTrigger) return;
    this.stats.basePercentStat.movementSpeed -= 30;
    this.didTrigger = true;
  }

  onRemove() {
    this.stats.basePercentStat.movementSpeed += 30;
    this.stats.removeStatus(this);
  }
}
