

export class BattleRandomSeed{
    m : number;
    a : number;
    c : number;
    state : number;

    constructor(seed : number){
            this.m = 0x80000000; // 2**31;
            this.a = 1103515245;
            this.c = 12345;
            this.state = seed 
    }

    nextInt(){
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state;
    }

    random(){
        return this.nextInt() / (this.m - 1);
    }
}

