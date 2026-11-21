import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { MagicLighthouseDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds, secondsToFrame } from "../../../../../shared/seconds";
import { TowerResources } from "../../../../../renderer/resources/tower.resources";
import { TowerTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TTargeting } from "../../../../../shared/traits/engine/targeting";
import { TargetZone } from "../../../../target-zone/target-zone";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { MagicLighthouse } from "../../recruit/implementation/magic-lighthouse";

const cellRectangle = () => new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE });
const cells = (...coords: [number, number][]) => coords.map(([x, y]) => new Cell({ x, y }));

export type LighthouseSide = "left" | "top" | "right" | "bottom";

// The cells each beam lights, relative to the anchor (the bottom cell of the tower), in the order its sweep reaches
// them: every side is swept clockwise around the tower.
//
//   x s s s x      row +2   top:    left -> right
//   s x o x s      row +1
//   s x o x s      row  0   left: bottom -> top, right: top -> bottom
//   x s s s x      row -1   bottom: right -> left
export const LIGHTHOUSE_BEAMS: Record<LighthouseSide, Cell[]> = {
	left: cells([-2, 0], [-2, 1]),
	top: cells([-1, 2], [0, 2], [1, 2]),
	right: cells([2, 1], [2, 0]),
	bottom: cells([1, -1], [0, -1], [-1, -1]),
};

export class MagicLighthouseBlueprint extends Derive(
	TRarity(Rarity.Uncommon),
	TShopBlueprint(20, 10),
	// One square per cell of the vertical 1x2 piece, relative to the anchor cell (the bottom one)
	THitbox(
		new HitBox([
			[cellRectangle(), new GridPosition({ x: 0, y: 0 })],
			[cellRectangle(), new GridPosition({ x: 0, y: STANDARD_CELL_SIZE })],
		]),
	),
	TDescriptor,
	TImageDrawable(
		TowerResources.magicLighthouse.image,
		TowerResources.magicLighthouse.size,
		DrawPriority.NormalGridElement,
	),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: 7,
		attackSpeed: NaN,
		castSpeed: castSpeedFromSeconds(2),
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 2.5,
		summonTime: NaN,
		range: NaN,
	}),
	TowerTag,
	TTargeting,
) {
	// Every cast lights one pair of sides, the next cast the other pair.
	beamPairs: LighthouseSide[][] = [
		["left", "right"],
		["top", "bottom"],
	];

	// The 10 beam cells, so the shop shows them as target cells.
	override targetZone = new TargetZone(Object.values(LIGHTHOUSE_BEAMS).flat());

	// How long one beam takes to sweep its whole side, in battle ticks.
	sweepTicks = Math.round(secondsToFrame(0.3));
	// How long the streak stays on screen after the sweep, fading, in battle ticks. It hits nothing then.
	fadeTicks = 6;

	// Every this many distinct enemy units lit in a battle, the army's towers gain one projectile damage buff.
	enemiesPerBuff = 10;

	toRecruit(cell: Cell) {
		return new MagicLighthouse(cell, this);
	}

	description = new MagicLighthouseDescription("Magic Lighthouse", this);
}
