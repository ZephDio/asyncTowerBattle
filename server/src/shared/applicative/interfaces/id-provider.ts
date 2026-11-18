// Output port shared by the use cases: the ids of the entities they create, so the entities have them before they are
// stored. Abstract so it can be used as the injection token.
export abstract class IdProvider {
	abstract next(): string;
}
