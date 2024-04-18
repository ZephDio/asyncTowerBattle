import { Cell } from "../../../shared/position";
import { GobelinPortalBlueprint } from "../blueprint/implementation/gobelin-portal";
import { OrangeTotemBlueprint } from "../blueprint/implementation/orange-totem";
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
	buildGobelinPortal(tower?: GobelinPortalBlueprint){
		return new GobelinPortal(this.cell, tower)
	}
}

export class TotemFixtures {
	static get topRightTower() {
		return new TotemBuilder().celled(new Cell({ x: 4, y: 3 })).buildOrange();
	}
}
