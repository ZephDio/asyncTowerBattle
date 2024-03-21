import { Rocket } from "../../entity/implementation/rocket";
import { BattleProjectile } from "../battle-projectile";

export class BattleRocketProjectile extends BattleProjectile<Rocket>{
    canMove(): boolean {
        return true
    }
    isAlive(): boolean {
        return true
    }
    isAttacked(damage: number): void {
        return
    }
}



