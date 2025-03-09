export interface IMemTableStructure<TKey, TValue> {
    find(value: TKey): TValue | null
    insert(key: TKey, value: TValue): void
    delete(key: TKey): void
    print?(): void
    getCount(): number
    getSortedArray(): { key: TKey; value: TValue }[]
    clear(): void
}