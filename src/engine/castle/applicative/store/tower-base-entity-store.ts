import { Castle, CastleEntity } from "../../domain/tower-base";

export abstract class CastleEntityStore {
    abstract getAll(): Promise<CastleEntity<Castle>[]>
}