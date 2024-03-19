import { Unit, UnitRecruit } from "../../domain/units";

export abstract class UnitEntityStore {
  abstract getAll(): Promise<UnitRecruit<any>[]>;
}
