import { Game } from "../../engine/game";
import { Path } from "../../engine/path/entity/path";
import { BattleState, GameState, ShopState, SummaryState } from "../../shared/gamestate";
import { Position } from "../../shared/position";
import { Size } from "../../shared/size";
import { Renderer } from "../renderer";
import { Resources } from "../resources";
import { Drawable } from "./drawables/drawable";
import { PhysicEntity, Recruit } from "../../shared/physic";
import { BattleCastle } from "../../engine/castle/battle/battle-castle";
import { TowerDrawable } from "./drawables/tower-drawable";
import { CastleDrawable } from "./drawables/castle-drawable";
import { PathDrawable } from "./drawables/path-drawable";
import { UnitEntityDrawable } from "./drawables/unit-drawable";
import { BattleVerdict } from "../../engine/battle-summary/battle-summary";
import { VerdictDrawable } from "./drawables/verdict-drawable";
import { BattleTower } from "../../engine/tower/battle/battle-tower";
import { TowerRecruit } from "../../engine/tower/recruit/tower-recruit";
import { Tower } from "../../engine/tower/entity/tower";
import { UnitRecruit } from "../../engine/units/recruit/unit-recruit";
import { Unit } from "../../engine/units/entity/units";
import { Projectile } from "../../engine/projectile/entity/projectile";
import { ProjectileDrawable } from "./drawables/projectiles-drawable";
import { Buyable } from "../../engine/shop/shop";
import { BuyableDrawable } from "./drawables/buyable-drawable";
import { HudElement } from "../../shared/hud-element";
import { HudElementDrawable } from "./drawables/hud-element-drawable";
import { CastleRecruit } from "../../engine/castle/recruit/castle-recruit";
import { Castle } from "../../engine/castle/entity/castle";
export const proportion = 16 / 9.8;

export class CanvasRenderer implements Renderer {
  public container: HTMLElement;
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  constructor(public game: Game) {
    this.container = document.getElementById("container") as HTMLElement;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error();
    this.context = context;
  }

  async draw() {
    const state = await this.game.getState();
    const drawableState = this.stateToDrawable(state);
    this.drawBackGround();
    for (const drawable of drawableState) {
      drawable.draw(this.context);
    }
  }

  stateToDrawable(state: GameState) {
    if (state.type === "summary") {
      return this.summaryStateToDrawable(state as SummaryState);
    }
    if (state.type === "battle") {
      return this.battleStateToDrawable(state as BattleState);
    }
    if (state.type === "shop") {
      return this.shopStateToDrawable(state as ShopState);
    }
    return [];
  }

  battleStateToDrawable(state: BattleState) {
    const drawables: Drawable[] = [];
    drawables.push(...state.towers.map((tower) => this.towerToTowerDrawable(tower)));
    drawables.push(...state.projectiles.map((projectile) => this.projectileToDrawable(projectile)));
    drawables.push(...state.paths.map((path) => this.pathToPathDrawable(path)));
    drawables.push(...state.entities.map((physicUnit) => this.unitToDrawable(physicUnit)));
    drawables.push(...state.castles.map((castle) => this.castleToCastleDrawable(castle)));
    drawables.sort((drawableA, drawableB) => drawableA.drawPriority - drawableB.drawPriority);
    return drawables;
  }

  summaryStateToDrawable(state: SummaryState) {
    const drawables: Drawable[] = [];
    drawables.push(this.verdictToDrawableVerdict(state.battleVerdict));
    return drawables;
  }

  shopStateToDrawable(state: ShopState) {
    const drawables: Drawable[] = [];
    drawables.push(...state.hudElements.map((hudElement) => this.HudtoHudElementDrawable(hudElement)));
    drawables.push(...[...state.retail.buyables.keys()].map((buyable) => this.buyableToDrawableBuyable(buyable)));
    drawables.push(this.pathToPathDrawable(state.path));
    drawables.push(this.castleToCastleDrawable(state.castle));
    drawables.push(...state.towers.map((tower) => this.towerToTowerDrawable(tower)));
    drawables.sort((drawableA, drawableB) => drawableA.drawPriority - drawableB.drawPriority);
    return drawables;
  }

  HudtoHudElementDrawable(button: HudElement) {
    const position = this.getCanvasPosition(button.position);
    const size = this.getCanvasSize(button.size.width, button.size.height);
    return new HudElementDrawable(button, size, position);
  }
  verdictToDrawableVerdict(verdict: BattleVerdict) {
    const position = this.getCanvasPosition({ x: 50, y: 30 });
    const { width, height } = Resources.verdict[verdict].size as Size;
    const size = this.getCanvasSize(width, height);

    return new VerdictDrawable(verdict, size, position);
  }

  towerToTowerDrawable(tower: BattleTower<TowerRecruit<Tower>> | TowerRecruit<Tower>) {
    const position = this.getCanvasPosition(tower.position);
    const { width, height } = Resources.tower[tower.type].size as Size;
    const size = this.getCanvasSize(width, height);
    return new TowerDrawable(position, size, tower.type);
  }

  castleToCastleDrawable(castle: BattleCastle | CastleRecruit<Castle>) {
    const position = this.getCanvasPosition(castle.position);
    const { width, height } = Resources.castle.size as Size;
    const size = this.getCanvasSize(width, height);
    return new CastleDrawable(position, size);
  }

  getCanvasPosition(position: Position) {
    const x = (this.canvas.width / 100) * position.x;
    const y = this.canvas.height - (this.canvas.width / 100) * position.y; // !
    return { x, y };
  }

  pathToPathDrawable(path: Path) {
    const relativeNodes = [...path.getNodes().map((node) => this.getCanvasPosition(node))];
    return new PathDrawable(path.type, relativeNodes);
  }

  buyableToDrawableBuyable(buyable: Buyable<Recruit>) {
    const canvasPosition = this.getCanvasPosition(buyable.position);
    const { width, height } = Resources[buyable.type][buyable.entity.type].size as Size;
    const size = this.getCanvasSize(width, height);
    return new BuyableDrawable(buyable, size, canvasPosition);
  }

  projectileToDrawable(projectile: PhysicEntity<Projectile>) {
    const position = this.getCanvasPosition(projectile.position);
    const size = this.getCanvasSize(2, 2);
    return new ProjectileDrawable(position, size, projectile.theta);
  }

  unitToDrawable(physicUnit: PhysicEntity<UnitRecruit<Unit>>) {
    const position = this.getCanvasPosition(physicUnit.position);
    const { width, height } = Resources.unit[physicUnit.entity.type].size as Size;
    const size = this.getCanvasSize(width, height);
    return new UnitEntityDrawable(position, size, physicUnit.entity.type);
  }

  drawBackGround() {
    this.context.fillStyle = "grey";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  init() {
    const render = async () => {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.sizeGame();
      this.draw();
      await new Promise((res: any) => setTimeout(() => res(), 1))
      window.requestAnimationFrame(render);
    };
    render();
  }

  sizeGame() {
    const { width, height } = this.container.getBoundingClientRect();
    if (width > height * proportion) {
      this.canvas.height = height;
      this.canvas.width = height * proportion;
      return;
    }
    this.canvas.width = width;
    this.canvas.height = width / proportion;
  }

  getCanvasSize(width: number, height: number) {
    const cWidth = (this.canvas.width / 100) * width;
    const cHeight = (this.canvas.width / 100) * height;
    return { width: cWidth, height: cHeight };
  }
}

export const PercentToReal = (position: Position) => {
  return {
    x: position.x,
    y: position.y / proportion,
  };
};
