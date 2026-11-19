import { BlueTowerBlueprint } from "./implementation/blue-tower-blueprint";
import { DrillTowerBlueprint } from "./implementation/drill-tower-blueprint";
import { WindmillTurretBlueprint } from "./implementation/windmill-turret-blueprint";
import { WitchHouseBlueprint } from "./implementation/witch-house-blueprint";
import { ZappingTowerBlueprint } from "./implementation/zapping-tower-blueprint";

export class TowerBlueprintBuilder {
	buildYellow() {
		return new WitchHouseBlueprint({});
	}
	buildBlue() {
		return new BlueTowerBlueprint({});
	}
	buildWindmillTurret() {
		return new WindmillTurretBlueprint({});
	}
	buildZapping() {
		return new ZappingTowerBlueprint({});
	}
	buildDrill() {
		return new DrillTowerBlueprint({});
	}
}

export class TowerBlueprintFixtures {
	static get windmillTurret() {
		return new TowerBlueprintBuilder().buildWindmillTurret();
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
	static get drill() {
		return new TowerBlueprintBuilder().buildDrill();
	}
}
