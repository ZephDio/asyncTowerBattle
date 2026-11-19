// Output port shared by the stores and use cases that pick at random: a number in [0, 1). Abstract so it can be used as
// the injection token, and so tests can pick deterministically.
export abstract class RandomProvider {
	abstract next(): number;
}
