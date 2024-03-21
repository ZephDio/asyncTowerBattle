import { BattleProjectile } from "../../../engine/projectile/battle/battle-projectile";
import { Projectile } from "../../../engine/projectile/entity/projectile";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class ProjectileDrawable extends Drawable<BattleProjectile<Projectile>> {
    public image: HTMLImageElement;
    public drawPriority: number = 5;
    constructor(public position: Position, public size: Size) {
        super();
        this.image = new Image(size.width, size.height);
        this.image.src = Resources.projectiles.resource.src;
    }

    draw(context: CanvasRenderingContext2D) {
        this.drawImage(context, this.size, this.position, this.image);
    }

    applyStyle(context: CanvasRenderingContext2D) {
        context.lineWidth = 1;
        context.strokeStyle = "black";
        const color = Resources.projectile.resource.color;
        context.fillStyle = color;
    }
}