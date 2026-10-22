import { Derive } from "@ddd-ts/traits";
import { BattleArmy } from "../../../../engine/army/battle/battle-army";
import { ScreenPosition } from "../../../position";
import { CastleLifeBar } from "./castle-life-bar";
import { FoodBarHud } from "./army-food-bar";
import { BannerBackground } from "../../../traits/render/huds/banner-background";
import { ArmyBuffHud } from "./army-buff-hud";
import { FurryHud } from "./furry-hud";

export class ArmyResume extends Derive(BannerBackground) {
	override drawPriority = 8;
	size = { width: 22, height: 38 };
	castleLifeBar: CastleLifeBar;
	foodBar: FoodBarHud;
	armyBuffHud: ArmyBuffHud;

	furryHud: FurryHud;
	constructor(
		public army: BattleArmy,
		public position: ScreenPosition,
	) {
		super({});
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
				width: this.size.width,
				height: this.size.height / 2,
			},
		);
		this.furryHud = new FurryHud(
			this.army.furry,
			this.position.add(new ScreenPosition({ x: 0, y: -this.size.height / 4 })),
		);
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number) {
		context.globalAlpha = 1;
		const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawBanner(context, canvasSize, canvasPosition);
		this.castleLifeBar.render(context);
		this.foodBar.render(context);
		this.armyBuffHud.render(context);
		this.furryHud.render(context);
	}
}
