import { BlueTower } from "./implementation/blue-tower-recruit";
import { GreenTower } from "./implementation/green-tower-recruit";
import { BlueTowerBlueprint } from "../blueprint/implementation/blue-tower";
import { GreenTowerBlueprint } from "../blueprint/implementation/green-tower";
import { Cell } from "../../../shared/position";
import { TowerBlueprintFixtures } from "../blueprint/tower-fixtures";
import { YellowTowerBlueprint } from "../blueprint/implementation/yellow-tower";
import { YellowTower } from "./implementation/yellow-tower-recruit";
import { ZappingTowerBlueprint } from "../blueprint/implementation/zapping-tower";
import { ZappingTower } from "./implementation/zapping-tower-recruit";
import { FrostTowerBlueprint } from "../blueprint/implementation/frost-tower";
import { FrostTower } from "./implementation/frost-tower-recruit";

export class TowerBuilder {
	cell: Cell;
	celled(position: Cell) {
		this.cell = position;
		return this;
	}
	buildBlue(tower?: BlueTowerBlueprint) {
		return new BlueTower(this.cell, tower);
	}
	buildFrost(tower?: FrostTowerBlueprint) {
		return new FrostTower(this.cell, tower);
	}
	buildGreen(tower?: GreenTowerBlueprint) {
		return new GreenTower(this.cell, tower);
	}
	buildYellow(tower?: YellowTowerBlueprint) {
		return new YellowTower(this.cell, tower);
	}
	buildZapping(tower?: ZappingTowerBlueprint) {
		return new ZappingTower(this.cell, tower);
	}
}

export class TowerFixtures {
	static get centerTower() {
		return new TowerBuilder().celled(new Cell({ x: 1, y: 2 })).buildBlue(TowerBlueprintFixtures.blue);
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
	static get middleZappingTower() {
		return new TowerBuilder().celled(new Cell({ x: 6, y: 3 })).buildZapping(TowerBlueprintFixtures.zapping);
	}
}
