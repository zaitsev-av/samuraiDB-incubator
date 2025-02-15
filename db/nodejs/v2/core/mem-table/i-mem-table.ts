export interface IMemTable<TKey, TValue> {
    put(key: TKey, value: TValue): void;
    get(key: TKey): TValue | undefined;
    delete(key: TKey): void;
}

