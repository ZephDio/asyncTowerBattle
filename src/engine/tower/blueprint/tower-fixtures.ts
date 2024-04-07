import { BlueTowerBlueprint } from "./implementation/blue-tower";
import { GreenTowerBlueprint } from "./implementation/green-tower";
import { OrangeTowerBlueprint } from "./implementation/orange-tower";
import { YellowTowerBlueprint } from "./implementation/yellow-tower";

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
}
