import * as fs from "fs";
import * as path from "path";

export class FileManager {
    private directory: string;
    private sstables: Set<number>;

    constructor(directory: string = "data") {
        this.directory = directory;
        this.sstables = new Set();

        this.ensureDirectoryExists();
        this.scanExistingSSTables();
    }

    getDataFolderPath() {
        return this.directory;
    }


    private ensureDirectoryExists(): void {
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }
    }

    private scanExistingSSTables(): void {
        const files = fs.readdirSync(this.directory);

        files.forEach(file => {
            const match = file.match(/^(\d+)\.sst$/);
            if (match) {
                this.sstables.add(parseInt(match[1], 10));
            }
        });
    }

    public getNextSSTableNumber(): number {
        if (this.sstables.size === 0) return 1;

        // Convert Set to array manually to avoid TS2802
        const tableNumbers = Array.from(this.sstables);
        return Math.max.apply(null, tableNumbers) + 1;
    }

    public registerSSTable(number: number): void {
        this.sstables.add(number);
    }
}