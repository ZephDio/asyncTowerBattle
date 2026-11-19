import { BlueTower } from "./implementation/blue-tower";
import { WindmillTurret } from "./implementation/windmill-turret";
import { WindmillTurretBlueprint } from "../blueprint/implementation/windmill-turret-blueprint";
import { Cell } from "../../../../shared/position";
import { TowerBlueprintFixtures } from "../blueprint/tower-fixtures";
import { WitchHouseBlueprint } from "../blueprint/implementation/witch-house-blueprint";
import { WitchHouse } from "./implementation/witch-house";
import { ZappingTowerBlueprint } from "../blueprint/implementation/zapping-tower-blueprint";
import { ZappingTower } from "./implementation/zapping-tower";
import { FrostTowerBlueprint } from "../blueprint/implementation/frost-tower-blueprint";
import { FrostTower } from "./implementation/frost-tower";
import { BlueTowerBlueprint } from "../blueprint/implementation/blue-tower-blueprint";
import { DrillTowerBlueprint } from "../blueprint/implementation/drill-tower-blueprint";
import { DrillTower } from "./implementation/drill-tower";

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
	buildWindmillTurret(tower?: WindmillTurretBlueprint) {
		return new WindmillTurret(this.cell, tower);
	}
	buildYellow(tower?: WitchHouseBlueprint) {
		return new WitchHouse(this.cell, tower);
	}
	buildZapping(tower?: ZappingTowerBlueprint) {
		return new ZappingTower(this.cell, tower);
	}
	buildDrill(tower?: DrillTowerBlueprint) {
		return new DrillTower(this.cell, tower);
	}
}

export class TowerFixtures {
	static get centerTower() {
		return new TowerBuilder().celled(new Cell({ x: 1, y: 2 })).buildBlue(TowerBlueprintFixtures.blue);
	}
	static get bottomLeftTower() {
		return new TowerBuilder()
			.celled(new Cell({ x: 1, y: 2 }))
			.buildWindmillTurret(TowerBlueprintFixtures.windmillTurret);
	}
	static get bottomMiddleTower() {
		return new TowerBuilder()
			.celled(new Cell({ x: 5, y: 3 }))
			.buildWindmillTurret(TowerBlueprintFixtures.windmillTurret);
	}
	static get bottomLeftYellowTower() {
		return new TowerBuilder().celled(new Cell({ x: 3, y: 1 })).buildYellow(TowerBlueprintFixtures.yellow);
	}
	static get middleZappingTower() {
		return new TowerBuilder().celled(new Cell({ x: 6, y: 3 })).buildZapping(TowerBlueprintFixtures.zapping);
	}
}
