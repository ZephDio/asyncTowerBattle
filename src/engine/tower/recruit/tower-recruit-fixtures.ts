import { BlueTower } from "./implementation/blue-tower-recruit";
import { GreenTower } from "./implementation/green-tower-recruit";
import { OrangeTower } from "./implementation/orange-tower-recruit";
import { BlueTowerBlueprint } from "../blueprint/implementation/blue-tower";
import { GreenTowerBlueprint } from "../blueprint/implementation/green-tower";
import { OrangeTowerBlueprint } from "../blueprint/implementation/orange-tower";
import { Cell } from "../../../shared/position";
import { TowerBlueprintFixtures } from "../blueprint/tower-fixtures";
import { YellowTowerBlueprint } from "../blueprint/implementation/yellow-tower";
import { YellowTower } from "./implementation/yellow-tower-recruit";

export class TowerBuilder {
	cell: Cell;
	celled(position: Cell) {
		this.cell = position;
		return this;
	}
	buildBlue(tower: BlueTowerBlueprint) {
		return new BlueTower(tower, this.cell);
	}
	buildGreen(tower: GreenTowerBlueprint) {
		return new GreenTower(tower, this.cell);
	}
	buildOrange(tower: OrangeTowerBlueprint) {
		return new OrangeTower(tower, this.cell);
	}
	buildYellow(tower: YellowTowerBlueprint) {
		return new YellowTower(tower, this.cell);
	}
}

export class TowerFixtures {
	static get centerTower() {
		return new TowerBuilder().celled(new Cell({ x: 1, y: 2 })).buildBlue(TowerBlueprintFixtures.blue);
	}
	static get topRightTower() {
		return new TowerBuilder().celled(new Cell({ x: 4, y: 3 })).buildOrange(TowerBlueprintFixtures.orange);
	}
	static get bottomLeftTower() {
		return new TowerBuilder().celled(new Cell({ x: 1, y: 2 })).buildGreen(TowerBlueprintFixtures.green);
	}
	static get bottomMiddleTower() {
		return new TowerBuilder().celled(new Cell({ x: 5, y: 3 })).buildGreen(TowerBlueprintFixtures.green);
	}
	static get bottomLeftYellowTower() {
		return new TowerBuilder().celled(new Cell({ x: 3, y: 1 })).buildYellow(TowerBlueprintFixtures.yellow);
	}
}
