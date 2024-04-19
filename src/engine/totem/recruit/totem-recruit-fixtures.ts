import { Cell } from "../../../shared/position";
import { CropsFieldBlueprint } from "../blueprint/implementation/crops-field";
import { GobelinPortalBlueprint } from "../blueprint/implementation/gobelin-portal";
import { OrangeTotemBlueprint } from "../blueprint/implementation/orange-totem";
import { CropsField } from "./implementation/crops-flied-recruit";
import { GobelinPortal } from "./implementation/gobelin-totem-recruit";
import { OrangeTotem } from "./implementation/orange-tower-recruit";

export class TotemBuilder {
	cell: Cell;
	celled(position: Cell) {
		this.cell = position;
		return this;
	}
	buildOrange(tower?: OrangeTotemBlueprint) {
		return new OrangeTotem(this.cell, tower);
	}
	buildGobelinPortal(tower?: GobelinPortalBlueprint) {
		return new GobelinPortal(this.cell, tower);
	}

	buildCropsField(field?: CropsFieldBlueprint) {
		return new CropsField(this.cell, field);
	}
}

export class TotemFixtures {
	static get topRightTower() {
		return new TotemBuilder().celled(new Cell({ x: 4, y: 3 })).buildOrange();
	}
}
