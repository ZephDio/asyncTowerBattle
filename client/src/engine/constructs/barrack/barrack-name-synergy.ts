import { ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../../shared/position";
import { GridElement } from "../../../shared/traits/engine/core/grid-element";
import { hasTag } from "../../../shared/traits/engine/tags/tagged";
import { TDescriptor } from "../../../shared/traits/render/huds/item-descriptor";

export const BARRACK_NAME_CAST_SPEED_PERCENT = 5;

const cells = (...coords: [number, number][]) => coords.map(([x, y]) => new Cell({ x, y }));

// The cells touching a one cell barrack on its sides, corners left out:
//   xsx
//   sos
//   xsx
export const SURROUNDING_CELLS_1X1 = () => cells([0, 1], [-1, 0], [1, 0], [0, -1]);

// The cells touching a two cell barrack (anchored on its left cell) on its sides, corners left out:
//   xssx
//   soos
//   xssx
export const SURROUNDING_CELLS_2X1 = () => cells([0, 1], [1, 1], [-1, 0], [2, 0], [0, -1], [1, -1]);

const barrackName = (element: ImplementsTrait<typeof GridElement> | undefined) => {
	if (!element || !hasTag(element, "Barrack") || !implementsTrait(element, TDescriptor)) return null;
	return element.description.name;
};

export const isBarrackWithOtherName = (ownName: string, element: ImplementsTrait<typeof GridElement> | undefined) => {
	const name = barrackName(element);
	return name !== null && name !== ownName;
};

// One per distinct name: two barracks of the same other name next to it count once.
export const countBarrackNames = (ownName: string, neighbors: (ImplementsTrait<typeof GridElement> | undefined)[]) =>
	new Set(neighbors.filter((element) => isBarrackWithOtherName(ownName, element)).map(barrackName)).size;

export const barrackNameCastSpeedPercent = (
	ownName: string,
	neighbors: (ImplementsTrait<typeof GridElement> | undefined)[],
) => countBarrackNames(ownName, neighbors) * BARRACK_NAME_CAST_SPEED_PERCENT;
