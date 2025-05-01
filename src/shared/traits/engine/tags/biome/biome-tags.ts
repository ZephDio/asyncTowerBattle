import { Subtrait } from "@ddd-ts/traits";
import { Tagged } from "../tagged";

export type BiomeTag = "Forest" | "Mountain" | "Sky" 

export const ForestTag = Subtrait([Tagged],(base, Props) => {
    abstract class TForestTag extends base {
        forestTag = true
        constructor(props: typeof Props){
            super(props);
            this.tags.push("Forest");
        }
    }
    return TForestTag;
})

export const MountainTag = Subtrait([Tagged],(base, Props) => {
    abstract class TMountainTag extends base {
        mountainTag = true
        constructor(props: typeof Props){
            super(props);
            this.tags.push("Mountain");
        }
    }
    return TMountainTag;
})

export const SkyTag = Subtrait([Tagged],(base, Props) => {
    abstract class TSkyTag extends base {
        skyTag = true
        constructor(props: typeof Props){
            super(props);
            this.tags.push("Sky");
        }
    }
    return TSkyTag;
})
