import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../traits/render/renderable";
import { ScreenPosition } from "../../../position";
import { DrawPriority } from "../../../traits/render/image-drawable";
import { ArmyBuff } from "../../../../engine/army/battle/army-buff";
import { Size } from "../../../size";
import { getRelativePositionPercent } from "../../../../renderer/implementation/canvas-renderer";
import { IconResources } from "../../../../renderer/resources/icons.resources";

export class ArmyBuffHud extends Derive(TRenderable) {
	speedIcon = IconResources.movespeed.image;
	vitalityIcon = IconResources.vitality.image;
	castSpeedIcon = IconResources.castSpeed.image;
	attackIcon = IconResources.attack.image;

	towerIcon = IconResources.tower.image;
	unitIcon = IconResources.unit.image;

	constructor(
		public armyBuff: ArmyBuff,
		public position: ScreenPosition,
		public size: Size,
	) {
		super({});
	}
	override drawPriority: DrawPriority.HoverHUD;
	override draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.globalAlpha = 1;
		this.drawUnitIcon(context, position, scale);
		this.drawTowerIcon(context, position, scale);
		const speedBuffs = this.armyBuff.unitArmyBuff.getBuff("movement-speed");
		if (speedBuffs) {
			this.drawSpeedBuff(context, position, scale, speedBuffs);
		}
		const vitalityBuffs = this.armyBuff.unitArmyBuff.getBuff("vitality");
		if (vitalityBuffs) {
			this.drawVitalityBuff(context, position, scale, vitalityBuffs);
		}
		const castSpeedUnitBuffs = this.armyBuff.unitArmyBuff.getBuff("cast-speed");
		if (castSpeedUnitBuffs) {
			this.drawUnitCastSpeedBuff(context, position, scale, castSpeedUnitBuffs);
		}
		const damageTowerBuffs = this.armyBuff.towerArmyBuff.getBuff("attack");
		if (damageTowerBuffs) {
			this.drawAttackTowerBuff(context, position, scale, damageTowerBuffs);
		}
		const castSpeedTowerBuffs = this.armyBuff.towerArmyBuff.getBuff("cast-speed");
		if (castSpeedTowerBuffs) {
			this.drawTowerCastSpeedBuff(context, position, scale, castSpeedTowerBuffs);
		}
	}

	drawUnitIcon(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number) {
		const unitIconPosition = getRelativePositionPercent(position, this.size, { x: 22, y: 90 });
		const unitIconCanvasPosition = this.getCanvasPosition(context, unitIconPosition);
		const size = this.getCanvasSize(context, this.size.width / 7, this.size.width / 7, scale);
		this.drawImage(context, size, unitIconCanvasPosition, this.unitIcon);
	}

	drawTowerIcon(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number) {
		const speedIconPosition = getRelativePositionPercent(position, this.size, { x: 22, y: 65 });
		const speedIconCanvasPosition = this.getCanvasPosition(context, speedIconPosition);
		const size = this.getCanvasSize(context, this.size.width / 7, this.size.width / 7, scale);
		this.drawImage(context, size, speedIconCanvasPosition, this.towerIcon);
	}

	drawSpeedBuff(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number, amount: number) {
		const speedIconPosition = getRelativePositionPercent(position, this.size, { x: 42, y: 90 });
		const speedIconCanvasPosition = this.getCanvasPosition(context, speedIconPosition);
		const size = this.getCanvasSize(context, this.size.width / 7, this.size.width / 7, scale);
		this.drawImage(context, size, speedIconCanvasPosition, this.speedIcon);
		context.font = `${size.width / 1.9}px text`;
		context.fillStyle = "green";
		context.fillText(`${amount}`, speedIconCanvasPosition.x, speedIconCanvasPosition.y, size.width);
	}

	drawVitalityBuff(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number, amount: number) {
		const vitalityIconPosition = getRelativePositionPercent(position, this.size, { x: 62, y: 90 });
		const vitalityIconCanvasPosition = this.getCanvasPosition(context, vitalityIconPosition);
		const size = this.getCanvasSize(context, this.size.width / 7, this.size.width / 7, scale);
		this.drawImage(context, size, vitalityIconCanvasPosition, this.vitalityIcon);
		context.font = `${size.width / 1.9}px text`;
		context.fillStyle = "green";
		context.fillText(`${amount}`, vitalityIconCanvasPosition.x, vitalityIconCanvasPosition.y, size.width);
	}

	drawUnitCastSpeedBuff(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number, amount: number) {
		const castSpeedIconPosition = getRelativePositionPercent(position, this.size, { x: 82, y: 90 });
		const castSpeedIconCanvasPosition = this.getCanvasPosition(context, castSpeedIconPosition);
		const size = this.getCanvasSize(context, this.size.width / 7, this.size.width / 7, scale);
		this.drawImage(context, size, castSpeedIconCanvasPosition, this.castSpeedIcon);
		context.font = `${size.width / 1.9}px text`;
		context.fillStyle = "green";
		context.fillText(`${amount}`, castSpeedIconCanvasPosition.x, castSpeedIconCanvasPosition.y, size.width);
	}

	drawAttackTowerBuff(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number, amount: number) {
		const damageTowerIconPosition = getRelativePositionPercent(position, this.size, { x: 42, y: 65 });
		const damageTowerIconCanvasPosition = this.getCanvasPosition(context, damageTowerIconPosition);
		const size = this.getCanvasSize(context, this.size.width / 7, this.size.width / 7, scale);
		this.drawImage(context, size, damageTowerIconCanvasPosition, this.attackIcon);
		context.font = `${size.width / 1.9}px text`;
		context.fillStyle = "green";
		context.fillText(`${amount}`, damageTowerIconCanvasPosition.x, damageTowerIconCanvasPosition.y, size.width);
	}

	drawTowerCastSpeedBuff(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number, amount: number) {
		const castSpeedIconPosition = getRelativePositionPercent(position, this.size, { x: 62, y: 65 });
		const castSpeedIconCanvasPosition = this.getCanvasPosition(context, castSpeedIconPosition);
		const size = this.getCanvasSize(context, this.size.width / 7, this.size.width / 7, scale);
		this.drawImage(context, size, castSpeedIconCanvasPosition, this.castSpeedIcon);
		context.font = `${size.width / 1.9}px text`;
		context.fillStyle = "green";
		context.fillText(`${amount}`, castSpeedIconCanvasPosition.x, castSpeedIconCanvasPosition.y, size.width);
	}
}
