import { Entity } from "../../shared/entity";

export abstract class Physic<T extends Entity> {
  constructor(public entity: T) {}
  abstract tick(): void;
}
