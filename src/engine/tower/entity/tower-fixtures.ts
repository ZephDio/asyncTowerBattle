import { BlueTower } from "./implementation/blue-tower";
import { GreenTower } from "./implementation/green-tower";
import { OrangeTower } from "./implementation/orange-tower";

export class TowerBuilder {
	buildBlue() {
		return new BlueTower();
	}
	buildGreen() {
		return new GreenTower();
	}
	buildOrange() {
		return new OrangeTower();
	}
}

export class TowerFixtures {
	static get orange() {
		return new TowerBuilder().buildOrange();
	}
	static get green() {
		return new TowerBuilder().buildGreen();
	}
	static get blue() {
		return new TowerBuilder().buildBlue();
	}
}
