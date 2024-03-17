import { Game } from "../../engine/game";
import { Tower } from "../../engine/tower/domain/tower";
import { Position } from "../../shared/position";
import { Renderer } from "../renderer";


export class CanvasRenderer implements Renderer{

    public container: HTMLElement
    public canvas: HTMLCanvasElement
    public context : CanvasRenderingContext2D
    constructor(public game : Game){
        this.container = document.getElementById('container') as HTMLElement
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement
        const context = this.canvas.getContext("2d")
        if(!context) throw new Error()
        this.context = context
    }

    async draw() {
       const state = await this.game.getState()
       this.drawBackGround()
       for(const tower of state.towers){
        this.drawTower(tower)
       }

    }

    drawTower(tower: Tower){
        this.context.fillStyle = tower.type
        const position = this.getCanvasPosition(tower.position)

        const size = this.getCanvasSize(5,5)
        this.context.fillRect(position.x,position.y,size.width,size.height)
    }

    drawBackGround(){
        this.context.fillStyle = 'grey'
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height)
    }


    init(){

        const render = () => {
            this.context.clearRect(0,0, this.canvas.width, this.canvas.height)
            this.sizeGame()
            this.draw()
            window.requestAnimationFrame(render)
        }
        render()
    }

    sizeGame(){
        this.canvas.width = this.container.getBoundingClientRect().width
        this.canvas.height = this.container.getBoundingClientRect().height
    }

    getCanvasSize(width : number, height : number){
        const cWidth = (this.canvas.width / 100) * width
        const cHeight = (this.canvas.height / 100) * height * (16/7.53) // considered to be the perfect ratio considering Navigator HeadBar
        return { width : cWidth, height : cHeight}
    }

    getCanvasPosition(position : Position){
        const x = (this.canvas.width / 100) * position.x
        const y = (this.canvas.height / 100) *  (100 - position.y)
        return { x , y }
    }
}