import { PathStore } from "../applicative/store/path-store";
import { Path } from "../domain/path";



export class PathStoreInMemory implements PathStore{
    path : Path
    constructor(path : Path){
        this.path = path
    }

    async getPath(){
        return this.path
    }
}