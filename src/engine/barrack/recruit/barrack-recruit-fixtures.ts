import { AnyRecruitUnit } from "../../units/recruit/unit-recruit";
import { UnitRecruitFixture } from "../../units/recruit/unit-recruit-fixtures";
import { BasicBarrack } from "../entity/implementation/basic-barrack";
import { BasicBarrackRecruit } from "../recruit/implementation/basic-barrack-recruit";
import { Cell } from "../../../shared/position";
import { WaveBarrack } from "../entity/implementation/wave-barrack";
import { WaveBarrackRecruit } from "./implementation/wave-barrack-recruit";

export class BarrackRecruitBuilder {
	productionSpeed: number | undefined;
	unit: AnyRecruitUnit | undefined;
	cell: Cell;

	withProductionSpeed(speed: number | undefined) {
		this.productionSpeed = speed;
		return this;
	}

	setUnit(unit: AnyRecruitUnit) {
		this.unit = unit;
		return this;
	}

	withCell(cell: Cell) {
		this.cell = cell;
		return this;
	}

	buildBasic(barrack: BasicBarrack) {
		const basicBarrackRecruit = new BasicBarrackRecruit(barrack, this.cell);
		if (this.unit) basicBarrackRecruit.setUnit(this.unit);
		if (this.productionSpeed) basicBarrackRecruit.productionSpeed = this.productionSpeed;
		return basicBarrackRecruit;
	}
	buildWave(barrack: WaveBarrack) {
		const waveBarrackRecruit = new WaveBarrackRecruit(barrack, this.cell);
		if (this.unit) waveBarrackRecruit.setUnit(this.unit);
		if (this.productionSpeed) waveBarrackRecruit.productionSpeed = this.productionSpeed;
		return waveBarrackRecruit;
	}
}

export class BarrackRecruitFixtures {
	static basicWithSoldier(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.soldier)
			.withCell(new Cell({ x: 2, y: 1 }))
			.buildBasic(new BasicBarrack({}));
	}

	static basicWithDragon(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.dragon)
			.withCell(new Cell({ x: 1, y: 1 }))
			.buildBasic(new BasicBarrack({}));
	}

	static waveWithSoldier(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.soldier)
			.withCell(new Cell({ x: 3, y: 1 }))
			.buildWave(new WaveBarrack({}));
	}
}
