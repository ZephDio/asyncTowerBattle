import { TowerBaseEntityStore } from "../applicative/store/tower-base-entity-store";
import { TowerBase, TowerBaseEntity } from "../domain/tower-base";

export class TowerBaseEntityStoreInMemory implements TowerBaseEntityStore {
    store: TowerBaseEntity<TowerBase>[]
    constructor(stored: TowerBaseEntity<TowerBase>[] = []) {
        this.store = stored
    }

    async getAll() { return this.store }
}