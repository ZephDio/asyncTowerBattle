import { Game } from "../../engine/game";
import { Position } from "../../shared/position";
import { Renderer } from "../renderer";

export const proportion = 16 / 9.8;

/**
 * Path: the road to castle
 * Tile: a square of the Path
 *
 * Grid: a rectangle of
 *
 */

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
    const { drawables, grid } = this.game.getRenderState();
    // const drawableState = this.stateToDrawable(state);
    this.drawBackGround();
    drawables
      .sort((drawableA, drawableB) => drawableA.drawPriority - drawableB.drawPriority)
      .map((drawable) => drawable.render(this.context, grid));
  }

  // stateToDrawable(state: GameState) {
  //   if (state.type === "summary") {
  //     return this.summaryStateToDrawable(state as SummaryState);
  //   }
  //   if (state.type === "battle") {
  //     return this.battleStateToDrawable(state as BattleState);
  //   }
  //   if (state.type === "shop") {
  //     return this.shopStateToDrawable(state as ShopState);
  //   }
  //   return [];
  // }

  // battleStateToDrawable(state: BattleState) {
  //   const drawables: Drawable[] = [];
  //   drawables.push(...state.towers.map((tower) => this.towerToTowerDrawable(tower, tower.position)));
  //   drawables.push(...state.projectiles.map((projectile) => this.projectileToDrawable(projectile)));
  //   drawables.push(...state.paths.map((path) => this.pathToPathDrawable(path, state.grid)));
  //   drawables.push(...state.entities.map((physicUnit) => this.unitToDrawable(physicUnit)));
  //   drawables.push(...state.castles.map((castle) => this.castleToCastleDrawable(castle, castle.position)));
  //   drawables.push(...state.areaEffects.map((areaEffect) => this.areaEffectToDrawable(areaEffect)));
  //   drawables.push(this.gridToGridDrawable(state.grid));

  //   drawables.sort((drawableA, drawableB) => drawableA.drawPriority - drawableB.drawPriority);
  //   return drawables;
  // }

  // summaryStateToDrawable(state: SummaryState) {
  //   const drawables: Drawable[] = [];
  //   drawables.push(this.verdictToDrawableVerdict(state.battleVerdict));
  //   return drawables;
  // }

  // shopStateToDrawable(drawables: ImplementsTrait<typeof TDrawable>[]) {
  //   // const drawables: (ImplementsTrait<typeof TDrawable> | Drawable)[] = [];
  //   // drawables.push(...state.hudElements.map((hudElement) => this.HudtoHudElementDrawable(hudElement)));
  //   // drawables.push(...[...state.retail.buyables.keys()].map((buyable) => this.buyableToDrawableBuyable(buyable, buyable.position)));
  //   // drawables.push(this.pathToPathDrawable(state.path, state.grid));
  //   // drawables.push(state.castle);
  //   // drawables.push(...state.towers);
  //   // drawables.push(this.gridToGridDrawable(state.grid));
  //   // drawables.sort((drawableA, drawableB) => drawableA.drawPriority - drawableB.drawPriority);
  //   // if (state.hold) {
  //   //   if (TokenDrag.isBuyableToken(state.hold)) {
  //   //     drawables.push(this.buyableToDrawableBuyable(state.hold.entity, state.hold.position));
  //   //   }
  //   //   if (TokenDrag.isTowerToken(state.hold)) {
  //   //     drawables.push(this.towerToTowerDrawable(state.hold.entity.toSerialized(new Grid()), state.hold.position));
  //   //   }
  //   // }
  //   // if (state.grid.overEffect) {
  //   //   drawables.push(this.hoverEffectToDrawable(state.grid.overEffect, state.grid));
  //   // }
  //   // drawables.push(...state.grid.synergiesEffects.map((synergyEffect) => this.synergyEffectToDrawable(synergyEffect, state.grid)));
  //   drawables.map((drawable) => drawable.draw(this.context, this.game.army.grid));
  //   return drawables;
  // }

  // HudToHudElementDrawable(button: HudElement) {
  //   const position = this.getCanvasPosition(button.position);
  //   const size = this.getCanvasSize(button.size.width, button.size.height);
  //   return new HudElementDrawable(button, size, position);
  // }
  // verdictToDrawableVerdict(verdict: BattleVerdict) {
  //   const position = this.getCanvasPosition({ x: 50, y: 30 });
  //   const { width, height } = Resources.verdict[verdict].size as Size;
  //   const size = this.getCanvasSize(width, height);

  //   return new VerdictDrawable(verdict, size, position);
  // }

  // gridToGridDrawable(grid: BattleGrid | Grid) {
  //   const position = this.getCanvasPosition(grid.position);
  //   const tileSize = this.getCanvasSize(grid.tileSize, grid.tileSize).width;
  //   return new GridDrawable(position, { width: grid.width, height: grid.height }, tileSize);
  // }

  // hoverEffectToDrawable(overEffect: GridPosition, grid: Grid) {
  //   const position = this.getCanvasPosition(grid.cellToReal(overEffect));
  //   const size = this.getCanvasSize(grid.tileSize, grid.tileSize);
  //   return new HoverEffectDrawable(position, size);
  // }

  // synergyEffectToDrawable(synergyEffect: GridPosition, grid: Grid) {
  //   const position = this.getCanvasPosition(grid.cellToReal(synergyEffect));
  //   const size = this.getCanvasSize(grid.tileSize / 2, grid.tileSize / 2);
  //   return new SynergyEffectDrawable(position, size);
  // }

  // towerToTowerDrawable(tower: AnyTowerRecruit, position: Position) {
  //   const canvasPosition = this.getCanvasPosition(position);
  //   const { width, height } = (Resources.tower as any)[tower.type].size as Size;
  //   const size = this.getCanvasSize(width, height);
  //   return new TowerDrawable(canvasPosition, size, tower.type);
  // }

  // castleToCastleDrawable(_castle: SerializedBattleCastle | SerializedCastleRecruit, position: Position) {
  //   const canvasPosition = this.getCanvasPosition(position);
  //   const { width, height } = Resources.castle.size as Size;
  //   const size = this.getCanvasSize(width, height);
  //   return new CastleDrawable(canvasPosition, size);
  // }

  getCanvasPosition(position: Position) {
    const x = (this.canvas.width / 100) * position.x;
    const y = this.canvas.height - (this.canvas.width / 100) * position.y; // !
    return { x, y };
  }

  // pathToPathDrawable(path: SerializedPath, grid: SerializedGrid) {
  //   const relativeTiles = [
  //     ...path.tiles.map((tile) => {
  //       return {
  //         position: this.getCanvasPosition(this.game.army.grid.cellToReal(tile.cell)),
  //         type: "normal",
  //       };
  //     }),
  //   ];
  //   const size = this.getCanvasSize(grid.tileSize, grid.tileSize);
  //   return new PathDrawable(relativeTiles, size);
  // }

  // buyableToDrawableBuyable(buyable: Buyable<Recruit>, position: Position) {
  //   const canvasPosition = this.getCanvasPosition(position);
  //   const { width, height } = (Resources as any)[buyable.type as any][buyable.entity.type as any].size as Size;
  //   const size = this.getCanvasSize(width, height);
  //   return new BuyableDrawable(buyable, size, canvasPosition);
  // }

  // projectileToDrawable(projectile: PhysicEntity<Projectile>) {
  //   const position = this.getCanvasPosition(projectile.position);
  //   const size = this.getCanvasSize(2, 2);
  //   return new ProjectileDrawable(position, size, projectile.theta, projectile.type);
  // }

  // areaEffectToDrawable(areaEffect: AreaEffect) {
  //   const position = this.getCanvasPosition(areaEffect.position);
  //   const size = this.getCanvasSize(areaEffect.size.width, areaEffect.size.height);
  //   return new AreaEffectDrawable(areaEffect, size, position);
  // }

  // unitToDrawable(physicUnit: PhysicEntity<UnitRecruit<Unit>>) {
  //   const position = this.getCanvasPosition(physicUnit.position);
  //   const { width, height } = (Resources as any).unit[physicUnit.entity.type].size as Size;
  //   const size = this.getCanvasSize(width, height);
  //   return new UnitEntityDrawable(position, size, physicUnit.entity.type);
  // }

  drawBackGround() {
    this.context.fillStyle = "#A65";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  init() {
    const render = async () => {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.sizeGame();
      this.draw();
      await new Promise((res: any) => setTimeout(() => res(), 1));
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

export const PercentToReal = (position: { x: number; y: number }) => {
  return new Position({
    x: position.x,
    y: position.y / proportion,
  });
};
