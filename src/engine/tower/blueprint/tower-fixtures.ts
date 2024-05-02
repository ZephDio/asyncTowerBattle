
import { BlueTowerBlueprint } from "./implementation/blue-tower-blueprint";
import { GreenTowerBlueprint } from "./implementation/green-tower-blueprint";
import { WitchHouseBlueprint } from "./implementation/witch-house-blueprint";
import { ZappingTowerBlueprint } from "./implementation/zapping-tower-blueprint";

export class TowerBlueprintBuilder {
	buildYellow() {
		return new WitchHouseBlueprint({});
	}
	buildBlue() {
		return new BlueTowerBlueprint({});
	}
	buildGreen() {
		return new GreenTowerBlueprint({});
	}
	buildZapping() {
		return new ZappingTowerBlueprint({});
	}
}

export class TowerBlueprintFixtures {
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
