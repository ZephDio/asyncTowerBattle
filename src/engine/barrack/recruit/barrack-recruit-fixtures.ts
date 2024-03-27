import { Unit } from "../../units/entity/units";
import { SoldierRecruit } from "../../units/recruit/implementation/soldier-recruit";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { UnitRecruitFixture } from "../../units/recruit/unit-recruit-fixtures";
import { BasicBarrack } from "../entity/implementation/basic-barrack";
import { BasicBarrackRecruit } from "../recruit/implementation/basic-barrack-recruit";

export class BarrackRecruitBuilder {
	productionSpeed: number | undefined;
	unit: UnitRecruit<Unit>;

	withProductionSpeed(speed: number | undefined) {
		this.productionSpeed = speed;
		return this;
	}

	setUnit(unit: UnitRecruit<Unit>) {
		this.unit = unit;
		return this;
	}

	buildBasic(basic: BasicBarrack) {
		const barrack = new BasicBarrackRecruit(basic);
		if (this.unit) barrack.setUnit(this.unit);
		return barrack;
	}
}

export class BarrackRecruitFixtures {
	static basicWithSoldier(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.soldier)
			.buildBasic(new BasicBarrack());
	}

	static basicWithDragon(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.dragon)
			.buildBasic(new BasicBarrack());
	}
}
