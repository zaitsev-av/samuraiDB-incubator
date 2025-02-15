import {ISamuraiDB} from "./i-samurai-db";
import {IMemTable} from "../mem-table/i-mem-table";


export class SamuraiDB<TKey, TValue> implements ISamuraiDB<TKey, TValue> {
    constructor(private memTable: IMemTable<TKey, TValue>) {}

    public put(key: TKey, value: TValue): void {
        this.memTable.put(key, value);
    }

    public get(key: TKey): TValue | undefined {
        const foundItem =  this.memTable.get(key);
        console.log("foundItem: ", foundItem)
        return foundItem;
    }

    public delete(key: TKey): void  {
        this.memTable.delete(key);
    }
}