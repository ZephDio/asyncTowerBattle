import { Derive } from "@ddd-ts/traits";
import { BattleArmy } from "../../../../engine/army/battle/battle-army";
import { ScreenPosition } from "../../../position";
import { CastleLifeBar } from "./castle-life-bar";
import { FoodBarHud } from "./army-food-bar";
import { BannerBackground } from "../../../traits/render/huds/banner-background";



export class ArmyResume extends Derive(BannerBackground){
    override drawPriority= 8;
    size = { width : 27 , height : 38}
    castleLifeBar : CastleLifeBar
    foodBar :FoodBarHud
    constructor(public army: BattleArmy,public  position : ScreenPosition) {
        super({});
        console.log('position', position)
        this.castleLifeBar = new CastleLifeBar(army.castle, this.position.add(
            new ScreenPosition({ x: 0, y: this.size.height/3})
        ))
        this.foodBar = new FoodBarHud(this.army.foodEconomy,
            this.position.add(
                new ScreenPosition({ x: 0, y: this.size.height/6})
        ))
    }

    draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number){
        const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
        const canvasPosition = this.getCanvasPosition(context, position);
        this.drawBanner(context,canvasSize,canvasPosition)
        this.castleLifeBar.render(context)
        this.foodBar.render(context)
    }
}