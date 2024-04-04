import { BlueTowerRecruit } from "./implementation/blue-tower-recruit";
import { GreenTowerRecruit } from "./implementation/green-tower-recruit";
import { OrangeTowerRecruit } from "./implementation/orange-tower-recruit";
import { BlueTower } from "../entity/implementation/blue-tower";
import { GreenTower } from "../entity/implementation/green-tower";
import { OrangeTower } from "../entity/implementation/orange-tower";
import { Cell } from "../../../shared/position";
import { TowerFixtures } from "../entity/tower-fixtures";
import { YellowTower } from "../entity/implementation/yellow-tower";
import { YellowTowerRecruit } from "./implementation/yellow-tower-recruit";

export class TowerRecruitBuilder {
	cell: Cell;
	celled(position: Cell) {
		this.cell = position;
		return this;
	}
	buildBlue(tower: BlueTower) {
		return new BlueTowerRecruit(tower, this.cell);
	}
	buildGreen(tower: GreenTower) {
		return new GreenTowerRecruit(tower, this.cell);
	}
	buildOrange(tower: OrangeTower) {
		return new OrangeTowerRecruit(tower, this.cell);
	}
	buildYellow(tower: YellowTower) {
		return new YellowTowerRecruit(tower, this.cell);
	}
}

export class TowerRecruitFixtures {
	static get centerTower() {
		return new TowerRecruitBuilder().celled(new Cell({ x: 1, y: 2 })).buildBlue(TowerFixtures.blue);
	}
	static get topRightTower() {
		return new TowerRecruitBuilder().celled(new Cell({ x: 4, y: 3 })).buildOrange(TowerFixtures.orange);
	}
	static get bottomLeftTower() {
		return new TowerRecruitBuilder().celled(new Cell({ x: 1, y: 2 })).buildGreen(TowerFixtures.green);
	}
	static get bottomMiddleTower() {
		return new TowerRecruitBuilder().celled(new Cell({ x: 5, y: 3 })).buildGreen(TowerFixtures.green);
	}
	static get bottomLeftYellowTower() {
		return new TowerRecruitBuilder().celled(new Cell({ x: 3, y: 1 })).buildYellow(TowerFixtures.yellow);
	}
}
