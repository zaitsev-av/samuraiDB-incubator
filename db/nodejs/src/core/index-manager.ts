import { FileAdapter } from "./file.adapter";

export class IndexManager {
  private index: Map<string, { segmentNumber: number; offset: number }>

  constructor(protected fileAdapter: FileAdapter) {}

  async init() {
    this.index = await this.fileAdapter.readIndex();
  }

  async *readAll() {
      for (const [key, {offset, segmentNumber }] of this.index.entries()) {
        const data = await this.fileAdapter.get(offset, segmentNumber)
        yield { key, data: data };
      }
  }

  async setOffset(key: string, offset: number, segmentNumber: number) {
    this.index.set(key, {offset, segmentNumber});
    await this.fileAdapter.saveIndex(this.index);
  }

  async getOffset(key: string) {
    return this.index.get(key);
  }

  async delete(key: string) {
    this.index.delete(key);
    await this.fileAdapter.saveIndex(this.index);
  }
}
