import { AnyUnit } from "../../units/recruit/unit-recruit";
import { UnitRecruitFixture } from "../../units/recruit/unit-recruit-fixtures";
import { BasicBarrackBlueprint } from "../blueprint/implementation/basic-barrack";
import { BasicBarrack } from "../recruit/implementation/basic-barrack-recruit";
import { Cell } from "../../../shared/position";
import { WaveBarrackBlueprint } from "../blueprint/implementation/wave-barrack";
import { WaveBarrack } from "./implementation/wave-barrack-recruit";

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

	buildBasic(barrack: BasicBarrackBlueprint) {
		const basicBarrackRecruit = new BasicBarrack(barrack, this.cell);
		if (this.unit) basicBarrackRecruit.setUnit(this.unit);
		if (this.productionSpeed) basicBarrackRecruit.productionSpeed = this.productionSpeed;
		return basicBarrackRecruit;
	}
	buildWave(barrack: WaveBarrackBlueprint) {
		const waveBarrackRecruit = new WaveBarrack(barrack, this.cell);
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
			.buildBasic(new BasicBarrackBlueprint({}));
	}

	static basicWithDragon(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.dragon)
			.withCell(new Cell({ x: 1, y: 1 }))
			.buildBasic(new BasicBarrackBlueprint({}));
	}

	static waveWithSoldier(speed?: number) {
		return new BarrackRecruitBuilder()
			.withProductionSpeed(speed)
			.setUnit(UnitRecruitFixture.soldier)
			.withCell(new Cell({ x: 3, y: 1 }))
			.buildWave(new WaveBarrackBlueprint({}));
	}
}
