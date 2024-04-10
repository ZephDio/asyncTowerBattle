import { AnyPathTile } from "../../engine/tile/recruit/tile";
import { Cell } from "../position";

const memoMap = new Map<string, any>();
const hashTiles = (from: Cell, to: Cell, tiles: AnyPathTile[]) => {
	let hash = from.toHash() + to.toHash();
	tiles.sort().forEach((tile) => {
		hash += tile.toHash();
	});
	return hash;
};

export const MemorizePath = () => {
	return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
		const originalMethod = descriptor.value;
		descriptor.value = (from: Cell, to: Cell, tiles: AnyPathTile[]) => {
			const hash = hashTiles(from, to, tiles);
			const memorized = memoMap.has(hash);
			if (memorized) {
				return memoMap.get(hash);
			}
			try {
				const result = originalMethod(from, to, tiles);
				if (memoMap.size > 1000) {
					memoMap.clear();
				}
				memoMap.set(hash, result);
				return result;
			} catch (e) {
				memoMap.set(hash, null);
				return null;
			}
		};
	};
};

class A {
	bonjour = "bonjour";
	cul(a: any) {
		return a;
	}
}

const a = new A();
//const b = new A();

console.log(a.cul(1));
