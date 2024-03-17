import { Unit, UnitEntity } from "../../domain/units";

export abstract class UnitEntityStore{
    abstract getAll(): Promise<UnitEntity<any>[]>
}