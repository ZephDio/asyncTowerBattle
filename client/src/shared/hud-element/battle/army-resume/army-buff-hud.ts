import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../traits/render/renderable";
import { ScreenPosition } from "../../../position";
import { DrawPriority } from "../../../traits/render/image-drawable";
import { ArmyBuff, ArmyBuffPercent, Buff } from "../../../../engine/army/battle/army-buff";
import { IconResources } from "../../../../renderer/resources/icons.resources";
import { drawOutlinedText } from "./pixel-meter";
import { HudTooltip, TooltipContent } from "./hud-tooltip";

type BuffKind = {
	icon: HTMLImageElement;
	stacks: (armyBuff: ArmyBuff) => number;
	describe: (stacks: number) => TooltipContent;
};

const effect = (title: string, target: string, stat: string, buff: Buff, stacks: number): TooltipContent => ({
	title,
	lines: [
		`${target}: +${stacks * ArmyBuffPercent[buff]}% ${stat}`,
		`${stacks} ${stacks === 1 ? "stack" : "stacks"} × ${ArmyBuffPercent[buff]}%`,
	],
});

// In display order.
const BuffKinds: BuffKind[] = [
	{
		icon: IconResources.armyBuffMovespeed.image,
		stacks: (armyBuff) => armyBuff.unitArmyBuff.getBuff("movement-speed"),
		describe: (stacks) => effect("Unit speed", "Your units", "🥾", "movement-speed", stacks),
	},
	{
		icon: IconResources.armyBuffVitality.image,
		stacks: (armyBuff) => armyBuff.unitArmyBuff.getBuff("vitality"),
		describe: (stacks) => effect("Unit vitality", "Your units", "💚", "vitality", stacks),
	},
	{
		icon: IconResources.castSpeed.image,
		stacks: (armyBuff) => armyBuff.unitArmyBuff.getBuff("cast-speed"),
		describe: (stacks) => effect("Unit cast speed", "Your units", "cast speed", "cast-speed", stacks),
	},
	{
		icon: IconResources.castleDamage.image,
		stacks: (armyBuff) => armyBuff.unitArmyBuff.getBuff("castle-damage"),
		describe: (stacks) => effect("Castle damage", "Your units", "🗡️", "castle-damage", stacks),
	},
	{
		icon: IconResources.armyBuffAttack.image,
		stacks: (armyBuff) => armyBuff.towerArmyBuff.getBuff("projectile-damage"),
		describe: (stacks) => effect("Tower damage", "Your towers", "⚔️", "projectile-damage", stacks),
	},
	{
		icon: IconResources.armyBuffTowerCastSpeed.image,
		stacks: (armyBuff) => armyBuff.towerArmyBuff.getBuff("cast-speed"),
		describe: (stacks) => effect("Tower cast speed", "Your towers", "💠", "cast-speed", stacks),
	},
];

const PER_ROW = 2;
const CELL = { width: 6.6, height: 3.2 };
const ICON_SIDE = 2.6;
// The icon and its count, from the icon's center.
const HOVER = { left: ICON_SIDE / 2, right: ICON_SIDE / 2 + 2.6, half: ICON_SIDE / 2 };

// The army's active buffs, in a fixed order, flowed two per row: absent buffs leave no gap.
export class ArmyBuffHud extends Derive(TRenderable) {
	constructor(
		public armyBuff: ArmyBuff,
		public position: ScreenPosition,
	) {
		super({});
	}
	override drawPriority = DrawPriority.HoverHUD;

	// The active buffs with the screen position of their icon's center.
	layout(position: ScreenPosition, scale = 1) {
		return BuffKinds.filter((kind) => kind.stacks(this.armyBuff) > 0).map((kind, index) => {
			const row = Math.floor(index / PER_ROW);
			const column = index % PER_ROW;
			const icon = position.add(
				new ScreenPosition({
					x: ((column - (PER_ROW - 1) / 2) * CELL.width - CELL.width / 2 + ICON_SIDE / 2 + 0.2) * scale,
					y: -row * CELL.height * scale,
				}),
			);
			return { kind, icon };
		});
	}

	// The tooltip of the buff under the point, opening past the whole buff block so it never hides another buff.
	tooltipAt(point: ScreenPosition, side: "left" | "right"): HudTooltip | null {
		const buffs = this.layout(this.position);
		const hit = buffs.find(
			({ icon }) =>
				point.x >= icon.x - HOVER.left && point.x <= icon.x + HOVER.right && Math.abs(point.y - icon.y) <= HOVER.half,
		);
		if (!hit) return null;
		const edges = buffs.map(({ icon }) => (side === "right" ? icon.x + HOVER.right : icon.x - HOVER.left));
		const x = side === "right" ? Math.max(...edges) : Math.min(...edges);
		const { kind } = hit;
		return new HudTooltip(new ScreenPosition({ x, y: hit.icon.y }), 0, side, () =>
			kind.describe(kind.stacks(this.armyBuff)),
		);
	}

	override draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const buffs = this.layout(position, scale);
		if (buffs.length === 0) return;
		context.globalAlpha = 1;
		const iconSize = this.getCanvasSize(context, ICON_SIDE, ICON_SIDE, scale);
		const fontSize = iconSize.height * 0.62;
		buffs.forEach(({ kind, icon }) => {
			const iconPosition = this.getCanvasPosition(context, icon);
			this.drawImage(context, iconSize, iconPosition, kind.icon);
			drawOutlinedText(
				context,
				`${kind.stacks(this.armyBuff)}`,
				iconPosition.x + iconSize.width / 2 + iconSize.width * 0.25,
				iconPosition.y + iconSize.height * 0.08,
				fontSize,
				undefined,
				"left",
			);
		});
	}
}
