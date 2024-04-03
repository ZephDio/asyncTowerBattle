import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { UnitRecruit } from "../../../units/recruit/unit-recruit";
import { BasicBattleBarrack } from "../../battle/implementation/basic-battle-barrack";
import { BasicBarrack } from "../../entity/implementation/basic-barrack";
import { BarrackRecruit } from "../barrack-recruit";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { Cell, Position } from "../../../../shared/position";

export class BasicBarrackRecruit extends Derive(HTImageDrawable, TRenderable, BarrackRecruit) {
  productionSpeed: number;
  constructor(barrack: BasicBarrack, public cell: Cell) {
    super({ imageDrawable: barrack });
    this.productionSpeed = barrack.productionSpeed;
  }
  unitRecruit: null | ImplementsTrait<typeof UnitRecruit>;

  get position(): Cell | Position {
    return this.cell;
  }

  toBattle(path: BattlePath, hooks: BattleArmyHooks): BasicBattleBarrack | undefined {
    if (this.unitRecruit) {
      return new BasicBattleBarrack(this, path.enemyCastle.position, path, hooks, this.unitRecruit);
    }
    return undefined;
  }
}
