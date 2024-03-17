import { Game } from "../engine/game";

export abstract class Renderer{
    abstract game : Game
    abstract draw(): void
}