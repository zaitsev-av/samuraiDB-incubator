import {SSTable} from "../sstable/sstable";

export interface IMemTable<TKey, TValue> {
    set(key: TKey, value: TValue): void;
    get(key: TKey): TValue | undefined;
    delete(key: TKey): void;
    isFull(): boolean;
    flush(ssTable: SSTable): Promise<void>;
}

