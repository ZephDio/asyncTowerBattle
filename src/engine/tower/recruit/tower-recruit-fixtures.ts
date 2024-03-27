import { BlueTowerRecruit } from "./implementation/blue-tower-recruit";
import { GreenTowerRecruit } from "./implementation/green-tower-recruit";
import { OrangeTowerRecruit } from "./implementation/orange-tower-recruit";
import { BlueTower } from "../entity/implementation/blue-tower";
import { GreenTower } from "../entity/implementation/green-tower";
import { OrangeTower } from "../entity/implementation/orange-tower";
import { GridPosition } from "../../../shared/position";
import { TowerFixtures } from "../entity/tower-fixtures";

export class TowerRecruitBuilder {
	gridPosition: GridPosition;
	gridPositioned(position: GridPosition) {
		this.gridPosition = position;
		return this;
	}
	buildBlue(tower: BlueTower) {
		return new BlueTowerRecruit(tower, this.gridPosition);
	}
	buildGreen(tower: GreenTower) {
		return new GreenTowerRecruit(tower, this.gridPosition);
	}
	buildOrange(tower: OrangeTower) {
		return new OrangeTowerRecruit(tower, this.gridPosition);
	}
}

export class TowerRecruitFixtures {
	static get centerTower() {
		return new TowerRecruitBuilder().gridPositioned({ gridX: 1, gridY: 2 }).buildBlue(TowerFixtures.blue);
	}
	static get topRightTower() {
		return new TowerRecruitBuilder().gridPositioned({ gridX: 4, gridY: 3 }).buildOrange(TowerFixtures.orange);
	}
	static get bottomLeftTower() {
		return new TowerRecruitBuilder().gridPositioned({ gridX: 1, gridY: 2 }).buildGreen(TowerFixtures.green);
	}
	static get bottomMiddleTower() {
		return new TowerRecruitBuilder().gridPositioned({ gridX: 5, gridY: 3 }).buildGreen(TowerFixtures.green);
	}
}
