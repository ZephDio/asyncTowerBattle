import { Soldier } from "../../../units/entity/implementation/soldier";
import { SoldierRecruit } from "../../../units/recruit/implementation/soldier-recruit";
import { SoldierBattleBarrack } from "../../battle/implementation/soldier-barrack";
import { Barrack } from "../barrack";

export class SoldierBarrack extends Barrack<Soldier> {
  type = "soldier" as const;
  constructor(
    public unitRecruit: SoldierRecruit,
    public productionSpeed: number = 2
  ) {
    super();
  }

  toBattle(...args: ConstructorParameters<typeof SoldierBattleBarrack>) {
    return new SoldierBattleBarrack(...args);
  }
}
