import { Game } from "../../engine/game";
import { Path, PathNode } from "../../engine/path/domain/path";
import { Tower } from "../../engine/tower/domain/tower";
import { Unit, UnitEntity } from "../../engine/units/domain/units";
import { GameState } from "../../shared/gamestate";
import { Position } from "../../shared/position";
import { Size } from "../../shared/size";
import { Renderer } from "../renderer";
import { Resources } from "../resources";
import { Drawable, PathDrawable, TowerDrawable, UnitEntityDrawable } from "./drawable";
export const proportion = (16 / 7.53)

export class CanvasRenderer implements Renderer {

    public container: HTMLElement
    public canvas: HTMLCanvasElement
    public context: CanvasRenderingContext2D
    constructor(public game: Game) {
        this.container = document.getElementById('container') as HTMLElement
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement
        const context = this.canvas.getContext("2d")
        if (!context) throw new Error()
        this.context = context
    }

    async draw() {
        const state = await this.game.getState()
        const drawableState = this.stateToDrawable(state)
        this.drawBackGround()
        for (const drawable of drawableState) {
            drawable.draw(this.context)
        }
    }

    getCanvasPosition(position: Position) {
        const x = (this.canvas.width / 100) * position.x
        const y = this.canvas.height - (this.canvas.width / 100) * position.y// !
        return { x, y }
    }

    stateToDrawable(state: GameState) {
        const drawables: Drawable[] = []
        drawables.push(...state.towers.map((tower) => this.towerToTowerDrawable(tower)))
        drawables.push(this.pathToPathDrawable(state.path))
        drawables.push(...state.enemyEntities.map((unit) => this.unitToDrawable(unit)))
        drawables.sort((drawableA, drawableB) => drawableA.drawPriority - drawableB.drawPriority)
        return drawables
    }

    towerToTowerDrawable(tower: Tower) {
        const position = this.getCanvasPosition(tower.position)
        const { width, height } = Resources.tower[tower.type].size as Size
        const size = this.getCanvasSize(width, height)
        return new TowerDrawable(position, size, tower.type)
    }

    pathToPathDrawable(path: Path) {
        const relativeNodes = [...path.nodes.map((node) => this.getCanvasPosition(node))]
        return new PathDrawable(path.type, relativeNodes)
    }

    unitToDrawable(unit: UnitEntity<Unit>) {
        const position = this.getCanvasPosition(unit.position)
        const { width, height } = Resources.unit[unit.unitType].size as Size
        const size = this.getCanvasSize(width, height)
        return new UnitEntityDrawable(position, size, unit.unitType)
    }


    drawBackGround() {
        this.context.fillStyle = 'grey'
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }


    init() {

        const render = () => {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.sizeGame()
            this.draw()
            window.requestAnimationFrame(render)
        }
        render()
    }

    sizeGame() {
        const { width, height } = this.container.getBoundingClientRect()
        if (width > height * proportion) {
            this.canvas.height = height
            this.canvas.width = height * proportion
            return
        }
        this.canvas.width = width
        this.canvas.height = width / proportion
    }

    getCanvasSize(width: number, height: number) {
        const cWidth = (this.canvas.width / 100) * width
        const cHeight = (this.canvas.width / 100) * height
        return { width: cWidth, height: cHeight }
    }

    static PercentToReal(position: Position) {
        return {
            x: position.x,
            y: position.y / proportion
        }
    }

}

export const PercentToReal = (position: Position) => {
    return {
        x: position.x,
        y: position.y / proportion
    }
}
