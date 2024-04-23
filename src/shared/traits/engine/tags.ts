import { Subtrait, Trait } from "@ddd-ts/traits";

export type Tag = "Food" | "Tower" | "Barrack" | "Totem"

export const Tagged = Trait((base) => {
    abstract class Tagged extends base {
        tags: Tag[] = []
    }
    return Tagged;
})

export const FoodTag = Subtrait([Tagged],(base, Props) => {
    abstract class TFoodTag extends base {
        foodTag = true
        constructor(props: typeof Props){
            super(props);
            this.tags.push("Food");
        }
    }
    return TFoodTag;
})

export const TowerTag = Subtrait([Tagged],(base, Props) => {
    abstract class TTowerTag extends base {
        towerTag = true
        constructor(props: typeof Props){
            super(props);
            this.tags.push("Tower");
        }
    }
    return TTowerTag;
})

export const BarrackTag = Subtrait([Tagged],(base, Props) => {
    abstract class TBarrackTag extends base {
        barrackTag = true
        constructor(props: typeof Props){
            super(props);
            this.tags.push("Barrack");
        }
    }
    return TBarrackTag;
})

export const TotemTag = Subtrait([Tagged],(base, Props) => {
    abstract class TTotemTag extends base {
        totemTag = true
        constructor(props: typeof Props){
            super(props);
            this.tags.push("Totem");
        }
    }
    return TTotemTag;
})