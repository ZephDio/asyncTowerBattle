import { CastleEntityStore as CastleEntityStore } from "../applicative/store/tower-base-entity-store";
import { Castle, CastleRecruit } from "../domain/castle";

export class CastleEntityStoreInMemory implements CastleEntityStore {
  store: CastleRecruit<Castle>[];
  constructor(stored: CastleRecruit<Castle>[] = []) {
    this.store = stored;
  }

  async getAll() {
    return this.store;
  }
}
