import { Position } from "./position";
import { Size } from "./size";



type HitShapeType =  'rectangle' | 'ellipse';

export class HitShape{
    constructor(public type : HitShapeType, public size : Size){}

    static pointCollision(shape:HitShape, position : Position){
        if(shape.type === 'ellipse'){
            const theta = 0
            const {width, height} = shape.size
            const radius = (width*height)/Math.sqrt(Math.pow(width, 2) * Math.pow(Math.sin(theta), 2)  + Math.pow(height,2)*Math.pow(Math.cos(theta), 2))
            console.log(radius)
        }
    }
}