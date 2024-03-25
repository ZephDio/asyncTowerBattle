import { Physic, PhysicEntity, Recruit } from "../../../../shared/physic";
import { Position } from "../../../../shared/position";
import { Explosion } from "../../../area-effect/implementation/explosion";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { PathFinder } from "../../../battle/path-finder";
import { Rocket } from "../../entity/implementation/rocket";
import { BattleProjectile } from "../battle-projectile";

export class BattleRocketProjectile extends BattleProjectile<Rocket>{
    constructor(public projectileRecruit: Rocket, position: Position, public hooks: BattleArmyHooks, public target: PhysicEntity<Recruit>, public damage: number) {
        const theta = Physic.getTheta(position, target.position)
        super(projectileRecruit, position, hooks, target, damage);
        this.theta = theta
        this.pathFinder = new PathFinder([{ x: target.position.x, y: target.position.y }]);
    }


    canMove(): boolean {
        return true
    }
    isAlive(): boolean {
        return true
    }

    tick(){
        this.speed = this.speed + 0.12
        this.followPath();
    }

    hit() {
        this.hooks.addAreaEffect(new Explosion({ width: 10, height: 10 }, { x: this.position.x, y: this.position.y }, this.damage, this.hooks), this);
        this.hooks.removeProjectile(this);
    }
    isAttacked(damage: number): void {
        return
    }
}



