import { Position } from "../../../shared/position";

export type PathNode = Position

export class Path{
    constructor(public nodes : PathNode[], public type: string){}
}


export const PathFixture= {
    default : new Path([{ x : 10 , y : 90}, { x: 10, y : 10}, { x : 40, y: 40},{ x : 55, y: 20},{ x : 90 , y : 10}], "normal")
}