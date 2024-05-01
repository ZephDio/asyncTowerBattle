import { Cell } from "../../../shared/position";
import { CropsFieldBlueprint } from "../blueprint/implementation/crops-field-blueprint";
import { GobelinPortalBlueprint } from "../blueprint/implementation/gobelin-portal";
import { AnvilTotemBlueprint } from "../blueprint/implementation/anvil-blueprint";
import { WindmillBlueprint } from "../blueprint/implementation/windmill-blueprint";
import { CropsField } from "./implementation/crops-flied-recruit";
import { GobelinPortal } from "./implementation/gobelin-totem-recruit";
import { AnvilTotem } from "./implementation/anvil";
import { Windmill } from "./implementation/windmill";

export class TotemBuilder {
	cell: Cell;
	celled(position: Cell) {
		this.cell = position;
		return this;
	}
	buildOrange(tower?: AnvilTotemBlueprint) {
		return new AnvilTotem(this.cell, tower);
	}
	buildGobelinPortal(tower?: GobelinPortalBlueprint) {
		return new GobelinPortal(this.cell, tower);
	}

	buildCropsField(field?: CropsFieldBlueprint) {
		return new CropsField(this.cell, field);
	}

	buildWindmill(windmill? : WindmillBlueprint) {
		return new Windmill(this.cell, windmill);
	}

}

export class TotemFixtures {
	static get topRightTower() {
		return new TotemBuilder().celled(new Cell({ x: 4, y: 3 })).buildOrange();
	}
}
