import { OrangeTotemBlueprint } from "./implementation/orange-totem";

export class TotemBlueprintBuilder {
	buildOrangeTotem() {
		return new OrangeTotemBlueprint({});
	}
}

export class TotemBlueprintFixtures {
	static get orange() {
		return new TotemBlueprintBuilder().buildOrangeTotem();
	}
}
