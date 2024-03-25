import { Position } from "../../../../shared/position";
import { BattleCastle } from "../../../castle/battle/battle-castle";
import { Path } from "../../../path/entity/path";
import { DragonRecruit } from "../../recruit/implementation/dragon-recruit";
import { SoldierRecruit } from "../../recruit/implementation/soldier-recruit";
import { UnitAttackIntent, BattleUnit } from "../entity-units-physic";

export class DragonRecruitPhysic extends BattleUnit<DragonRecruit> {
    speed: number;
    maxLife: number;
    actualLife: number;
    attackSpeed: number;
    attackDamage: number;
    constructor(entity: DragonRecruit, position: Position, path: Path, targetCastle: BattleCastle, private onDeath: Function) {
        super(entity, position, path, targetCastle);
        this.speed = entity.speed;
        this.maxLife = entity.maxLife;
        this.actualLife = entity.maxLife;
        this.attackSpeed = entity.attackSpeed
        this.attackDamage = entity.attackDamage
    }
    canMove() {
        return true;
    }

    isAlive() {
        return this.actualLife > 0;
    }

    attack() {
        if (!this.attackIntent) {
            this.attackIntent = new UnitAttackIntent(this, () => {
                this.target.isAttacked(this.attackDamage);
                this.attackIntent = null;
            });
            return;
        }
        this.attackIntent.tick();
    }

    isAttacked(damage: number) {
        this.actualLife -= damage;
        if (this.actualLife < 0) {
            this.onDeath(this);
        }
    }

    tick() {
        if (!this.pathFinder.isArrived) {
            this.followPath();
            return;
        }
        this.attack();
    }
}
