export interface ISamuraiDB<TKey, TValue> {
    put(key: TKey, value: TValue): void;

    get(key: TKey): TValue | undefined;
}