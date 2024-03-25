import { Dragon } from "../../../units/entity/implementation/dragon";
import { Soldier } from "../../../units/entity/implementation/soldier";
import { DragonRecruit } from "../../../units/recruit/implementation/dragon-recruit";
import { SoldierRecruit } from "../../../units/recruit/implementation/soldier-recruit";
import { DragonBattleBarrack } from "../../battle/implementation/dragon-barrack";
import { SoldierBattleBarrack } from "../../battle/implementation/soldier-barrack";
import { Barrack } from "../barrack";

export class DragonBarrack extends Barrack<Dragon> {
    type = "dragon" as const;
    constructor(
        public unitRecruit: DragonRecruit,
        public productionSpeed: number = 1.2
    ) {
        super();
    }

    toBattle(...args: ConstructorParameters<typeof DragonBattleBarrack>) {
        return new DragonBattleBarrack(...args);
    }
}
