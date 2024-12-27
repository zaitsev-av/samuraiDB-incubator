import {promises as fs} from "node:fs";
import {FileAdapter} from "./file.adapter";

export class SegmentManager {
    private currentSegmentNumber: number;

    constructor(protected fileAdapter: FileAdapter, protected segmentSize = 1024) {
        // this.baseFilename = resolve(baseFilename);
        this.segmentSize = segmentSize;
        this.initCurrentSegment();
        // this.currentFile = this.getSegmentFilename(this.currentSegment);
    }

    initCurrentSegment() {
        this.currentSegmentNumber = 0;
    }

    async set(key: string, data: any) {
        const size = await this.fileAdapter.getFileSize(this.currentSegmentNumber)
        if (size + Buffer.byteLength(JSON.stringify(data), 'utf-8') > this.segmentSize) {
            this.currentSegmentNumber++;
        }

        const result = await this.fileAdapter.set(key, data, this.currentSegmentNumber);
        return {offset: result.offset, segmentNumber: this.currentSegmentNumber};
    }

    async get(offset: number, segmentNumber: number) {
        return await this.fileAdapter.get(offset, segmentNumber);
    }

    // getSegmentFilename(segment) {
    //     return `${this.baseFilename}_segment_${segment}.txt`;
    // }
    //
    // async appendEntry(entry) {
    //     const fileHandle = await fs.open(this.currentFile, 'a');
    //     const offset = (await fileHandle.stat()).size;
    //
    //     if (offset + Buffer.byteLength(entry, 'utf-8') > this.segmentSize) {
    //         this.currentSegment++;
    //         this.currentFile = this.getSegmentFilename(this.currentSegment);
    //     }
    //
    //     await fileHandle.appendFile(entry);
    //     await fileHandle.close();
    //
    //     return { segment: this.currentSegment, offset };
    // }
    //
    // async readEntry(segment, offset) {
    //     const segmentFile = this.getSegmentFilename(segment);
    //     const fileHandle = await fs.open(segmentFile, 'r');
    //
    //     const buffer = Buffer.alloc(1024);
    //     await fileHandle.read(buffer, 0, 1024, offset);
    //     const line = buffer.toString('utf-8').trim();
    //
    //     await fileHandle.close();
    //
    //     return line;
    // }
    //
    // async rebuildIndex(index) {
    //     for (let i = 0; i <= this.currentSegment; i++) {
    //         const segmentFile = this.getSegmentFilename(i);
    //         const fileStream = createReadStream(segmentFile, 'utf-8');
    //         const rl = readline.createInterface({
    //             input: fileStream,
    //             crlfDelay: Infinity
    //         });
    //
    //         let offset = 0;
    //
    //         for await (const line of rl) {
    //             const [key] = line.split(',');
    //
    //             index.set(key, { segment: i, offset });
    //
    //             offset += Buffer.byteLength(line, 'utf-8') + 1;
    //         }
    //     }
    // }
}