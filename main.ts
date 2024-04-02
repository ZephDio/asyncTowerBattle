import { Derive, ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";


const Walk = Trait((base) => {
    abstract class TWalk extends base {
        abstract walk(): void;
    }
    return TWalk;
});


const getChildWalk = Subtrait([Walk],(base) => {
    abstract class IChildWalk extends base {
        walk : () => void
        constructor(child: ImplementsTrait<typeof Walk>){
            super(child)
            this.walk = child.walk;
        }
    }
    return IChildWalk;
    });

class A extends Derive(Walk,getChildWalk) {
    constructor(child : B){
        super(child)
    }
}

class B extends Derive(Walk){
    walk(){
        console.log('B walking');
    }
}

new A(new B({})).walk()