import { FileAdapter } from './file.adapter';
import {IndexManager} from "./index-manager";
import {SegmentManager} from "./segment-manager";
import {CompactionManager} from "./compaction-manager";

class SamuraiDB {
    /**
     *
     * @param indexManager
     */
    constructor(protected segmentManager: SegmentManager,
                protected indexManager: IndexManager,
                protected compactionManager: CompactionManager) {}

    async init() {
        await this.indexManager.init()
        this.runCompactionInterval()
    }

    runCompactionInterval() {
        setInterval( async () => {
            await this.compactionManager.compactSegments();
            this.runCompactionInterval();
            console.log("COMPACTION FINISHED")
        }, 10 * 1000)
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

    async delete(key: string) {
        await this.segmentManager.delete(key);
        await this.indexManager.delete(key);

    }
}


export default SamuraiDB;