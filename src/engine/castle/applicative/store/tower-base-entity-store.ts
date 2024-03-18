import { Castle, CastleEntity } from "../../domain/castle";

export abstract class CastleEntityStore {
    abstract getAll(): Promise<CastleEntity<Castle>[]>
}