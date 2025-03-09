export interface ISamuraiDB<TKey, TValue> {
    set(key: TKey, value: TValue): void;

    get(key: TKey): TValue | undefined;
}