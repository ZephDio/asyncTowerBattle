import { Derive } from "@ddd-ts/traits";
import { DrawPriority, TImageDrawable } from "../../shared/traits/render/image-drawable";
import { TEnvironmentElement } from "./environment";
import { Cell } from "../../shared/position";
import { BattleGrid } from "../grid/battle-grid";
import { EnvironmentResources } from "../../renderer/resources/environment.resources";

export class Rock extends Derive(
	TEnvironmentElement,
	TImageDrawable(EnvironmentResources.rock.image, EnvironmentResources.rock.size, DrawPriority.NormalGridElement),
) {
	type = "rock" as const;
	constructor(public cell: Cell) {
		super({});
	}

	toEnemy(grid: BattleGrid) {
		return new Rock(BattleGrid.flip(grid, this.cell));
	}

	get position() {
		return this.cell;
	}
}
