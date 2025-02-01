// Класс для управления процессом уплотнения сегментов
import {IndexManager} from "./index-manager";
import {SegmentManager} from "./segment-manager";
import {FileAdapter} from "./file.adapter";
import { join } from 'node:path';

import {promises as fs} from 'node:fs';

export class CompactionManager {
    constructor(private segmentManager: SegmentManager, private currentIndexManager: IndexManager) {

    }

    async compactSegments() {
        const prevDBRoot = join(process.cwd(), 'db');
        const appRoot = join(process.cwd(), 'db2');
        const newFileAdapter = new FileAdapter(appRoot);
        const newIndexManager = new IndexManager(newFileAdapter)
        await newIndexManager.init();
        const newSegmentManager = new SegmentManager(newFileAdapter)

        for await (const item of this.currentIndexManager.readAll()) {
            const {offset, segmentNumber} = await newSegmentManager.set(item.key, item.data);
            // const {offset} = await this.fileAdapter.set(key, data)
            // Обновляем индекс: сохраняем смещение для ключа
            await newIndexManager.setOffset(item.key, offset, segmentNumber)
        }

        await this.replaceFolders(prevDBRoot, appRoot)


    }

    async replaceFolders(oldFOlderName: string, newFOlderName: string) {
        try {
            // Check if the folder to delete exists
            try {
                await fs.access(oldFOlderName);
                await fs.rm(oldFOlderName, { recursive: true, force: true });
                console.log(`Folder '${oldFOlderName}' has been deleted.`);
            } catch (error) {
                console.log(`Folder '${oldFOlderName}' does not exist or is already removed.`);
            }

            // Rename db2 to db
            await fs.rename(oldFOlderName, newFOlderName);
            console.log(`Folder '${oldFOlderName}' has been renamed to '${newFOlderName}'.`);
        } catch (error) {
            console.error('Error during folder replacement:', error.message);
        }
    }

}