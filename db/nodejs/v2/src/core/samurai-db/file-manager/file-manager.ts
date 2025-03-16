import * as fs from "fs";
import * as path from "path";

export class FileManager {
    private directory: string;
    private sstablesFilesNumbers: Set<number>;

    constructor(directory: string = "data") {
        this.directory = directory;
        this.sstablesFilesNumbers = new Set();

        this.ensureDirectoryExists();
        this.scanExistingSSTables();
    }

    getDataFolderPath() {
        return this.directory;
    }

    public getSSTablesNumbers() {
      return this.sstablesFilesNumbers;
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
                this.sstablesFilesNumbers.add(parseInt(match[1], 10));
            }
        });
    }

    public getNextSSTableNumber(): number {
        if (this.sstablesFilesNumbers.size === 0) return 1;

        // Convert Set to array manually to avoid TS2802
        const tableNumbers = Array.from(this.sstablesFilesNumbers);
        return Math.max.apply(null, tableNumbers) + 1;
    }

    public registerSSTable(number: number): void {
        this.sstablesFilesNumbers.add(number);
    }
}