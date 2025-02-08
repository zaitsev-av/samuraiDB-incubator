export interface IMemTableStructure<T> {
    find(value: T): T | null
    insert(value: T): void
    delete(value: T): void
}