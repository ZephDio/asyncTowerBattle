import { CastleEntityStore as CastleEntityStore } from "../applicative/store/tower-base-entity-store";
import { Castle, CastleEntity } from "../domain/castle";

export class CastleEntityStoreInMemory implements CastleEntityStore {
    store: CastleEntity<Castle>[]
    constructor(stored: CastleEntity<Castle>[] = []) {
        this.store = stored
    }

    async getAll() { return this.store }
}