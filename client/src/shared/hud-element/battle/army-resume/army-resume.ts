import { Derive } from "@ddd-ts/traits";
import { BattleDwarfCastle } from "../../../../engine/castle/battle/battle-dwarf-castle";
import { HudElementResources } from "../../../../renderer/resources/hud-element.resources";
import { BattleArmy } from "../../../../engine/army/battle/battle-army";
import { ScreenPosition } from "../../../position";
import { CastleLifeBar } from "./castle-life-bar";
import { FoodBarHud } from "./army-food-bar";
import { BannerBackground } from "../../../traits/render/huds/banner-background";
import { ArmyBuffHud } from "./army-buff-hud";
import { FurryHud } from "./furry-hud";

export class ArmyResume extends Derive(BannerBackground) {
	override drawPriority = 8;
	size = { width: 20, height: 38 };
	castleLifeBar: CastleLifeBar;
	foodBar: FoodBarHud;
	armyBuffHud: ArmyBuffHud;

	furryHud: FurryHud;
	constructor(
		public army: BattleArmy,
		public position: ScreenPosition,
		public playerName: string,
	) {
		super({});
		const faction = army.castle instanceof BattleDwarfCastle ? "Dwarf" : "Elf";
		this.bannerImage = HudElementResources.armyBanner[faction].image;
		this.castleLifeBar = new CastleLifeBar(
			army.castle,
			this.position.add(new ScreenPosition({ x: 0, y: this.size.height / 3 })),
		);
		this.foodBar = new FoodBarHud(
			this.army.foodEconomy,
			this.position.add(new ScreenPosition({ x: 0, y: this.size.height / 6 })),
		);

		this.armyBuffHud = new ArmyBuffHud(
			this.army.armyBuff,
			this.position.add(new ScreenPosition({ x: 0, y: -this.size.height / 6 })),
			{
				width: this.size.width * 0.8,
				height: this.size.height / 2,
			},
		);
		this.furryHud = new FurryHud(
			this.army.furry,
			this.position.add(new ScreenPosition({ x: 0, y: -this.size.height / 4 })),
		);
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number) {
		context.save();
		context.globalAlpha = 1;
		context.imageSmoothingEnabled = false;
		const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawBanner(context, canvasSize, canvasPosition);
		this.drawPlayerName(context, position, scale);
		this.castleLifeBar.render(context);
		this.foodBar.render(context);
		this.armyBuffHud.render(context);
		this.furryHud.render(context);
		context.restore();
	}

	// Above the castle's health bar, as wide as the bar.
	private drawPlayerName(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number) {
		const size = this.getCanvasSize(context, 14, 2.2, scale);
		const canvasPosition = this.getCanvasPosition(
			context,
			position.add(new ScreenPosition({ x: 0, y: this.size.height / 3 + 2.6 })),
		);
		context.fillStyle = "#fff4dc";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = `${size.height}px title`;
		context.fillText(this.playerName, canvasPosition.x, canvasPosition.y, size.width);
		context.textBaseline = "alphabetic";
	}
}
