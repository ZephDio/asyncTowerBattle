import { Path, PathNode } from "../../engine/path/domain/path"
import { TowerBase, TowerBaseEntity } from "../../engine/tower-base/domain/tower-base"
import { Tower, TowerEntity } from "../../engine/tower/domain/tower"
import { UnitEntity } from "../../engine/units/domain/units"
import { Entity } from "../../shared/entity"
import { Position } from "../../shared/position"
import { Size } from "../../shared/size"
import { Resources } from "../resources"

export abstract class Drawable<T = any>{
  abstract drawPriority: number
  abstract draw(context: CanvasRenderingContext2D): void
  protected drawEllipse(context: CanvasRenderingContext2D, size: Size, position: Position) {
    context.beginPath();
    context.ellipse(position.x, position.y, size.width / 2, size.height / 2, 0, 0, 2 * Math.PI);
    context.fill()
    context.stroke();
  }
  protected drawRectangle(context: CanvasRenderingContext2D, size: Size, position: Position) {
    context.strokeRect(position.x - size.width / 2, position.y - size.height / 2, size.width, size.height)
    context.fillRect(position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
    context.stroke();
  }
  protected drawLines(context: CanvasRenderingContext2D, points: Position[]) {
    context.beginPath()
    for (const point of points) {

      context.lineTo(point.x, point.y)
    }
    context.stroke()
  }

}

export class TowerDrawable extends Drawable<TowerEntity<Tower>> {
  public drawPriority: number = 2
  constructor(public position: Position, public size: Size, public type: string) {
    super()
  }


  draw(context: CanvasRenderingContext2D) {
    const renderShape = Resources.tower[this.type].resource.shape
    this.applyStyle(context)

    if (renderShape == "ellipse") {
      this.drawEllipse(context, this.size, this.position)
      return
    }
    if (renderShape == "rectangle") {
      this.drawRectangle(context, this.size, this.position)
    }
  }

  applyStyle(context: CanvasRenderingContext2D) {
    context.lineWidth = 1
    context.strokeStyle = "black"
    const color = Resources.tower[this.type].resource.color
    context.fillStyle = color
  }

}


export class TowerBaseDrawable extends Drawable<TowerBaseEntity<TowerBase>> {
  public drawPriority: number = 2
  constructor(public position: Position, public size: Size) {
    super()
  }


  draw(context: CanvasRenderingContext2D) {
    const renderShape = Resources.towerBase.resource.shape
    this.applyStyle(context)
    this.drawRectangle(context, this.size, this.position)
  }

  applyStyle(context: CanvasRenderingContext2D) {
    context.lineWidth = 1
    context.strokeStyle = "black"
    const color = Resources.towerBase.resource.color
    context.fillStyle = color
  }

}

export class PathDrawable extends Drawable<Path> {
  public drawPriority: number = 1
  constructor(public type: string, public nodes: PathNode[]) {
    super()
  }
  draw(context: CanvasRenderingContext2D) {
    this.applyStyle(context)
    this.drawLines(context, this.nodes)
  }

  applyStyle(context: CanvasRenderingContext2D) {
    const color = Resources.path[this.type].resource
    context.strokeStyle = color
    context.lineWidth = 50
  }
}

export class UnitEntityDrawable extends Drawable<UnitEntity<any>>{
  public drawPriority = 4

  constructor(public position: Position, public size: Size, public type: string) {
    super()
  }

  applyStyle(context: CanvasRenderingContext2D) {
    context.strokeStyle = 'black',
      context.fillStyle = 'black'
    context.lineWidth = 1
  }


  draw(context: CanvasRenderingContext2D): void {
    this.applyStyle(context)
    const renderShape = Resources.unit[this.type].resource
    if (renderShape == "ellipse") {
      this.drawEllipse(context, this.size, this.position)
      return
    }
    if (renderShape == "rectangle") {
      this.drawRectangle(context, this.size, this.position)
    }
  }
}