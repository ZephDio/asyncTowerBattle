import { TowerBase, TowerBaseEntity } from "../../domain/tower-base";

export abstract class TowerBaseEntityStore {
    abstract getAll(): Promise<TowerBaseEntity<TowerBase>[]>
}