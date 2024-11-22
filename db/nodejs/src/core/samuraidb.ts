import { FileAdapter } from './file.adapter';
import {IndexManager} from "./index-manager";

class SamuraiDB {


    /**
     *
     * @param {FileAdapter} fileAdapter
     * @param indexManager
     */
    constructor(protected fileAdapter: FileAdapter, protected indexManager: IndexManager) {}

    async init() {
        return this.indexManager.init()
    }

    async set(key: string, data: any) {
        const {offset} = await this.fileAdapter.set(key, data)
        // Обновляем индекс: сохраняем смещение для ключа
        await this.indexManager.setOffset(key.toString(), offset)
    }

    async get(key: string) {
        // Проверяем наличие ключа в индексе
        const offset = await this.indexManager.getOffset(key);
        if (offset === undefined) {
            return null; // Если ключа нет в индексе, возвращаем null
        }
        return await this.fileAdapter.get(offset);
    }
}


export default SamuraiDB;