import { FileAdapter } from './file.adapter';
import {IndexManager} from "./index-manager";
import {SegmentManager} from "./segment-manager";

class SamuraiDB {
    /**
     *
     * @param indexManager
     */
    constructor(protected segmentManager: SegmentManager, protected indexManager: IndexManager) {}

    async init() {
        return this.indexManager.init()
    }

    async set(key: string, data: any) {
        const {offset, segmentNumber} = await this.segmentManager.set(key, data);
        // const {offset} = await this.fileAdapter.set(key, data)
        // Обновляем индекс: сохраняем смещение для ключа
        await this.indexManager.setOffset(key.toString(), offset, segmentNumber)
    }

    async get(key: string) {
        // Проверяем наличие ключа в индексе
        const indexData = await this.indexManager.getOffset(key);
        if (indexData === undefined) {
            return null; // Если ключа нет в индексе, возвращаем null
        }
        return await this.segmentManager.get(indexData.offset, indexData.segmentNumber);
    }
}


export default SamuraiDB;