import { Entity } from "../../../shared/entity";
import { UnitEntityStore } from "../applicative/store/unit-store";
import { UnitEntity } from "../domain/units";


export class UnitEntityStoreInMemory implements UnitEntityStore{

    units : UnitEntity<any>[]
    constructor(units : UnitEntity<any>[] = []){
        this.units = units
    }
    async getAll(){
        return this.units
    }
}