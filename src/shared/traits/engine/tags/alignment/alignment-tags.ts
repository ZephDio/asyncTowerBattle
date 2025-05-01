import { Subtrait, Trait } from "@ddd-ts/traits";
import { Tagged } from "../tagged.js";

export type AlignmentType = "Evil" | "Magic"

export const EvilTag = Subtrait([Tagged],(base, Props) => {
  abstract class TEvilTag extends base {
      evilTag = true
      constructor(props: typeof Props){
          super(props);
          this.tags.push("Evil");
      }
  }
  return TEvilTag;
})

export const MagicTag = Subtrait([Tagged],(base, Props) => {
  abstract class TMagicTag extends base {
      magicTag = true
      constructor(props: typeof Props){
          super(props);
          this.tags.push("Magic");
      }
  }
  return TMagicTag;
})