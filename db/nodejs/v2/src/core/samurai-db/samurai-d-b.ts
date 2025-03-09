import {ISamuraiDB} from "./i-samurai-db";
import {IMemTable} from "../mem-table/i-mem-table";
import {SSTable} from "../sstable/sstable";
import * as fs from "fs";
import {FileManager} from "./file-manager/file-manager";


export interface IIdManager<TKey> {
    getNextIfNullOrRegisterId(key: TKey | null) : TKey
}

export class IntegerIdStratagy implements IIdManager<number> {
    maxId = 0;
    getNextIfNullOrRegisterId(key: number | null): number {
        if (key === null) {
           ++this.maxId;
           return this.maxId;
        }
        return Number(key)
    }

}


export class SamuraiDB<TKey, TValue> implements ISamuraiDB<TKey, TValue> {
    constructor(private memTable: IMemTable<TKey, TValue>, private fileManager: FileManager, private  idManager: IIdManager<TKey>) {}

    public async set(key: TKey | null, value: TValue): Promise<void> {
        const correctedKey  = this.idManager.getNextIfNullOrRegisterId(key);
        this.memTable.set(correctedKey, {...value, correctedKey});
        const needFlushToSSTable = this.memTable.isFull();
        if (needFlushToSSTable) {
            await this.flushMemtableToSSTable()
        }
    }

    public get(key: TKey): TValue | undefined {
        const foundItem =  this.memTable.get(key);
        console.log("foundItem: ", foundItem)
        return foundItem;
    }

    public delete(key: TKey): void  {
        this.memTable.delete(key);
    }

    private async flushMemtableToSSTable() {
        const nextSSTableNumber = this.fileManager.getNextSSTableNumber();
        const newSSTable = new SSTable(this.fileManager.getDataFolderPath(), nextSSTableNumber.toString());
        await this.memTable.flush(newSSTable);
        this.fileManager.registerSSTable(nextSSTableNumber);
    }
}