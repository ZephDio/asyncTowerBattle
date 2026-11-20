import { AnyUnit } from "../../../units/recruit/unit";
import { UnitRecruitFixture } from "../../../units/recruit/unit-fixtures";
import { BasicBarrack } from "./implementation/basic-barrack";
import { Cell } from "../../../../shared/position";
import { WaveBarrack } from "./implementation/wave-barrack";
import { VeterantBarrack } from "./implementation/veterant-barrack";
import { RushBarrack } from "./implementation/rush-barrack";

export class BarrackRecruitBuilder {
	productionSpeed: number | undefined;
	unit: AnyUnit | undefined;
	cell: Cell;

	withProductionSpeed(speed: number | undefined) {
		this.productionSpeed = speed;
		return this;
	}

	setUnit(unit: AnyUnit) {
		this.unit = unit;
		return this;
	}

	withCell(cell: Cell) {
		this.cell = cell;
		return this;
	}

	buildBasic() {
		const basicBarrackRecruit = new BasicBarrack(this.cell);
		if (this.unit) basicBarrackRecruit.setUnit(this.unit);
		return basicBarrackRecruit;
	}

	buildWave() {
		const waveBarrackRecruit = new WaveBarrack(this.cell);
		if (this.unit) waveBarrackRecruit.setUnit(this.unit);
		return waveBarrackRecruit;
	}

	buildVeterant() {
		const veterantBarrackRecruit = new VeterantBarrack(this.cell);
		if (this.unit) veterantBarrackRecruit.unitRecruit = this.unit;
		return veterantBarrackRecruit;
	}

	buildRush() {
		const rushBarrackRecruit = new RushBarrack(this.cell);
		if (this.unit) rushBarrackRecruit.setUnit(this.unit);
		return rushBarrackRecruit;
	}
}

export class BarrackRecruitFixtures {
	static basicWithDefaultUnit(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.withCell(new Cell({ x: 2, y: 1 }))
			.buildBasic();
	}

	static basicWithDragon(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.dragon)
			.withCell(new Cell({ x: 1, y: 1 }))
			.buildBasic();
	}

	static waveWithSoldier(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.withCell(new Cell({ x: 3, y: 1 }))
			.buildWave();
	}

	static basicWithWhiteStag(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.whiteStag)
			.withCell(new Cell({ x: 4, y: 0 }))
			.buildBasic();
	}

	static waveWithWhiteStag(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.whiteStag)
			.withCell(new Cell({ x: 4, y: 0 }))
			.buildWave();
	}

	static waveWithDragon(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.dragon)
			.withCell(new Cell({ x: 1, y: 1 }))
			.buildWave();
	}

	static waveWithChoupisson(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.choupisson)
			.withCell(new Cell({ x: 6, y: 5 }))
			.buildWave();
	}

	static veterantWithDragon(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.dragon)
			.withCell(new Cell({ x: 2, y: 1 }))
			.buildVeterant();
	}

	static rushWithDragon(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.dragon)
			.withCell(new Cell({ x: 1, y: 1 }))
			.buildRush();
	}
}
