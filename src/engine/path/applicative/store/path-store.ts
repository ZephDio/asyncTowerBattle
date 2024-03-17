import { Path } from "../../domain/path";

export abstract class PathStore{
    abstract getPath(): Promise<Path>
}