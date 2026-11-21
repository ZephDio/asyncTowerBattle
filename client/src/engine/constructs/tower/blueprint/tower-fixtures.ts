import { BlacksmithTowerBlueprint } from "./implementation/blacksmith-tower-blueprint";
import { DrillTowerBlueprint } from "./implementation/drill-tower-blueprint";
import { MagicLighthouseBlueprint } from "./implementation/magic-lighthouse-blueprint";
import { WindmillTurretBlueprint } from "./implementation/windmill-turret-blueprint";
import { WitchHouseBlueprint } from "./implementation/witch-house-blueprint";
import { ZappingTowerBlueprint } from "./implementation/zapping-tower-blueprint";

export class TowerBlueprintBuilder {
	buildYellow() {
		return new WitchHouseBlueprint({});
	}
	buildBlacksmith() {
		return new BlacksmithTowerBlueprint({});
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
	buildMagicLighthouse() {
		return new MagicLighthouseBlueprint({});
	}
}

export class TowerBlueprintFixtures {
	static get windmillTurret() {
		return new TowerBlueprintBuilder().buildWindmillTurret();
	}
	static get blacksmith() {
		return new TowerBlueprintBuilder().buildBlacksmith();
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
	static get magicLighthouse() {
		return new TowerBlueprintBuilder().buildMagicLighthouse();
	}
}
