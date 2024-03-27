import { Bullet } from "../../entity/implementation/bullet";
import { BattleProjectile } from "../battle-projectile";

export class BattleBulletProjectile extends BattleProjectile<Bullet> {
	canMove(): boolean {
		return true;
	}
	isAlive(): boolean {
		return true;
	}
	isAttacked(): void {
		return;
	}
}
