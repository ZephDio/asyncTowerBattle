import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../traits/render/renderable";
import { ScreenPosition } from "../../../position";
import { DrawPriority } from "../../../traits/render/image-drawable";
import { ArmyBuff } from "../../../../engine/army/battle/army-buff";
import { IconResources } from "../../../../renderer/resources/icons.resources";
import { drawOutlinedText } from "./pixel-meter";

type ActiveBuff = { icon: HTMLImageElement; amount: number };

const PER_ROW = 3;
const CELL = { width: 5.2, height: 3.4 };
const ICON_SIDE = 2.6;

// The army's active buffs, in a fixed order, flowed into centered rows of at most three: absent buffs leave no gap.
export class ArmyBuffHud extends Derive(TRenderable) {
	constructor(
		public armyBuff: ArmyBuff,
		public position: ScreenPosition,
	) {
		super({});
	}
	override drawPriority = DrawPriority.HoverHUD;

	activeBuffs(): ActiveBuff[] {
		const unit = this.armyBuff.unitArmyBuff;
		const tower = this.armyBuff.towerArmyBuff;
		return [
			{ icon: IconResources.armyBuffMovespeed.image, amount: unit.getBuff("movement-speed") },
			{ icon: IconResources.armyBuffVitality.image, amount: unit.getBuff("vitality") },
			{ icon: IconResources.castSpeed.image, amount: unit.getBuff("cast-speed") },
			{ icon: IconResources.castleDamage.image, amount: unit.getBuff("castle-damage") },
			{ icon: IconResources.armyBuffAttack.image, amount: tower.getBuff("projectile-damage") },
			{ icon: IconResources.armyBuffTowerCastSpeed.image, amount: tower.getBuff("cast-speed") },
		].filter((buff) => buff.amount > 0);
	}

	override draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const buffs = this.activeBuffs();
		if (buffs.length === 0) return;
		context.globalAlpha = 1;
		const rows = Math.ceil(buffs.length / PER_ROW);
		const perRow = Math.ceil(buffs.length / rows);
		const iconSize = this.getCanvasSize(context, ICON_SIDE, ICON_SIDE, scale);
		const fontSize = iconSize.height * 0.62;
		buffs.forEach((buff, index) => {
			const row = Math.floor(index / perRow);
			const inRow = Math.min(perRow, buffs.length - row * perRow);
			const column = index % perRow;
			const cell = position.add(
				new ScreenPosition({
					x: (column - (inRow - 1) / 2) * CELL.width * scale,
					y: -row * CELL.height * scale,
				}),
			);
			const iconPosition = this.getCanvasPosition(
				context,
				cell.add(new ScreenPosition({ x: (-CELL.width / 2 + ICON_SIDE / 2 + 0.2) * scale, y: 0 })),
			);
			this.drawImage(context, iconSize, iconPosition, buff.icon);
			drawOutlinedText(
				context,
				`${buff.amount}`,
				iconPosition.x + iconSize.width / 2 + iconSize.width * 0.08,
				iconPosition.y + iconSize.height * 0.08,
				fontSize,
				undefined,
				"left",
			);
		});
	}
}
