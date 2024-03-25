import { Position } from "../../../../shared/position";
import { BattleArmy } from "../../../army/battle/battle-army";
import { Path } from "../../../path/entity/path";
import { BattleCastle } from "../../../castle/battle/battle-castle";
import { BattleBarrack, UnitProduction } from "../battle-barrack";
import { SoldierBarrack } from "../../entity/implementation/solider-barrack";
import { UnitEntityFixture } from "../../../units/entity/unit-fixtures";
import { DragonRecruit } from "../../../units/recruit/implementation/dragon-recruit";
import { DragonRecruitPhysic } from "../../../units/battle/implementation/dragon-battle";
import { DragonBarrack } from "../../entity/implementation/dragon-barrack";

export class DragonBattleBarrack implements BattleBarrack<DragonRecruit> {
    onGoingProduction = null as null | UnitProduction<DragonRecruit>;

    constructor(
        public productionSpeed: number,
        public position: Position,
        public path: Path,
        public targetCastle: BattleCastle,
        public addRecruit: BattleArmy["addUnit"],
        public removeRecruit: BattleArmy["removeUnit"],

        public recruit: DragonRecruit
    ) { }

    tick() {
        if (this.onGoingProduction) {
            this.onGoingProduction.tick();
        }
        if (!this.onGoingProduction) {
            this.onGoingProduction = new UnitProduction(this, () => {
                this.produce();
                this.onGoingProduction = null;
            });
        }
    }

    produce() {
        this.addRecruit(
            new DragonRecruitPhysic(
                this.recruit,
                { x: this.position.x, y: this.position.y },
                this.path,
                this.targetCastle,
                this.removeRecruit
            ),
            this
        );
    }
}


