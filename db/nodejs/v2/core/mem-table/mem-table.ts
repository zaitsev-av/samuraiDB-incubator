import {IMemTable} from "./i-mem-table";
import {IMemTableStructure} from "./IMemTableStructure/i-mem-table-structure";

export class MemTable<TKey, TValue> implements IMemTable<TKey, TValue> {
    private structure: IMemTableStructure<TKey, TValue>;

    constructor(structure: IMemTableStructure<TKey, TValue>) {
        this.structure = structure;
    }

    public put(key: TKey, value: TValue): void {
        this.structure.insert(key, value);
    }

    public delete(key: TKey): void {
        this.structure.delete(key);
    }

    public get(key: TKey): TValue | undefined {
        const found = this.structure.find(key);
        return found || undefined;
    }
}