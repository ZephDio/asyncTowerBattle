import { AnvilTotemBlueprint } from "./implementation/anvil-blueprint";

export class TotemBlueprintBuilder {
	buildOrangeTotem() {
		return new AnvilTotemBlueprint({});
	}
}

export class TotemBlueprintFixtures {
	static get orange() {
		return new TotemBlueprintBuilder().buildOrangeTotem();
	}
}
