import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";

export const FoodConsumer = Trait((base) => {
	abstract class IFoodConsumer extends base {
		abstract foodCost: number;
	}
	return IFoodConsumer;
});

export const HTFoodConsumer = Subtrait([FoodConsumer], (base, Props) => {
	abstract class IHTFoodConsumer extends base {
		declare foodCost: number;
		constructor(props: { foodConsumer: ImplementsTrait<typeof FoodConsumer> } & typeof Props) {
			super(props);
			this.foodCost = props.foodConsumer.foodCost;
		}
	}
	return IHTFoodConsumer;
});
