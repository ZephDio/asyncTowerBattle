import { Trait } from "@ddd-ts/traits";

export const Orientable = Trait((base) => {
    abstract class TOrientable extends base {
        _orientation: number = 0;
        setOrientation(orientation: number){
            this._orientation = orientation;
        }
        get orientation(){
            return this._orientation;
        }
    }
    return TOrientable;
})