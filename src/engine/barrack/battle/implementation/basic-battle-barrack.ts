import { Position } from "../../../../shared/position";
import { UnitRecruit } from "../../../units/recruit/unit-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { Cast, Caster } from "../../../../shared/traits/cast";
import { BasicBarrackRecruit } from "../../recruit/implementation/basic-barrack-recruit";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";

export class BasicBattleBarrack extends Derive(Caster, HTImageDrawable, TRenderable) {
  cast = null as null | Cast;
  onGoingProduction = null as null | Cast;

  constructor(
    public readonly barrackRecruit: BasicBarrackRecruit,
    public readonly position: Position,
    public readonly path: BattlePath,
    public readonly hooks: BattleArmyHooks,
    public readonly recruit: ImplementsTrait<typeof UnitRecruit>
  ) {
    super({ imageDrawable: barrackRecruit });
    this.castSpeed = barrackRecruit.productionSpeed;
  }

  tick() {
    super.tickCast();
  }

  onCastResolve(): void {
    this.hooks.addUnits(this.recruit.toBattle(this.position.clone(), this.path, this.hooks), this);
    this.cast = null;
  }
}
