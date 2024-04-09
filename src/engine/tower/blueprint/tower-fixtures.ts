import { BlueTowerBlueprint } from "./implementation/blue-tower";
import { GreenTowerBlueprint } from "./implementation/green-tower";
import { OrangeTowerBlueprint } from "./implementation/orange-tower";
import { YellowTowerBlueprint } from "./implementation/yellow-tower";
import { ZappingTowerBlueprint } from "./implementation/zapping-tower";

export class TowerBlueprintBuilder {
	buildYellow() {
		return new YellowTowerBlueprint({});
	}
	buildBlue() {
		return new BlueTowerBlueprint({});
	}
	buildGreen() {
		return new GreenTowerBlueprint({});
	}
	buildOrange() {
		return new OrangeTowerBlueprint({});
	}
	buildZapping() {
		return new ZappingTowerBlueprint({});
	}
}

export class TowerBlueprintFixtures {
	static get orange() {
		return new TowerBlueprintBuilder().buildOrange();
	}
	static get green() {
		return new TowerBlueprintBuilder().buildGreen();
	}
	static get blue() {
		return new TowerBlueprintBuilder().buildBlue();
	}

	static get yellow() {
		return new TowerBlueprintBuilder().buildYellow();
	}
	static get zapping() {
		return new TowerBlueprintBuilder().buildZapping();
	}
}
