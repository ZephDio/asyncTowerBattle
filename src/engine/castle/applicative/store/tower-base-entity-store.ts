import { Castle, CastleRecruit } from "../../domain/castle";

export abstract class CastleEntityStore {
  abstract getAll(): Promise<CastleRecruit<Castle>[]>;
}
