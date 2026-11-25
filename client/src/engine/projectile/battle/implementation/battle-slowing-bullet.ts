import { secondsToFrame } from "../../../../shared/seconds";
import { Hindered } from "../../../stats/status/hindered";
import { BattleBullet } from "./battle-bullet";

export const SLOWING_BULLET_SECONDS = 2;
export const SLOWING_BULLET_PERCENT = 50;

export class BattleSlowingBullet extends BattleBullet {
	override hit() {
		this.target.addCondition(
			new Hindered({ duration: secondsToFrame(SLOWING_BULLET_SECONDS), percent: SLOWING_BULLET_PERCENT }),
		);
		super.hit();
	}
}
