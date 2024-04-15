import { Derive } from "@ddd-ts/traits";
import { TImageDrawable } from "../../shared/traits/render/image-drawable";
import { Resources } from "../../renderer/resources";
import { TEnvironmentElement } from "./environment";
import { Cell } from "../../shared/position";

export class Rock extends Derive(
	TEnvironmentElement,
	TImageDrawable(Resources.environment.rock.resource.image, Resources.environment.rock.size, 3),
) {
	constructor(public cell: Cell) {
		super({});
	}

	get position() {
		return this.cell;
	}
}
