import { SoldierRecruit } from "../../units/recruit/implementation/soldier-recruit";
import { UnitRecruitFixture } from "../../units/recruit/unit-recruit-fixtures";
import { BasicBarrackRecruit } from "../recruit/implementation/basic-barrack-recruit";
import { BasicBarrack } from "./implementation/basic-barrack";

export class BarrackFixtures {
	static basic() {
		return new BasicBarrack();
	}
}
