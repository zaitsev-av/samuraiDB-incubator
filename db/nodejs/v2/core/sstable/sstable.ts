import * as fs from "fs";
import * as path from "path";

export class SSTable {
    private dataFilePath: string;
    private indexFilePath: string;
    private index: Map<string, number>;

    constructor(directory: string, fileName: string) {
        this.dataFilePath = path.join(directory, `${fileName}.sst`);
        this.indexFilePath = path.join(directory, `${fileName}.idx`);
        this.index = new Map();

        this.loadIndex();
    }

    private loadIndex(): void {
        if (!fs.existsSync(this.indexFilePath)) return;

        const indexData = fs.readFileSync(this.indexFilePath, "utf-8");
        indexData.split("\n").forEach(line => {
            if (!line.trim()) return;
            const [key, pos] = line.split(":");
            this.index.set(key, Number(pos));
        });
    }

    flush(data: { key: string; value: string }[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const dataStream = fs.createWriteStream(this.dataFilePath, { flags: "w" });
            const indexStream = fs.createWriteStream(this.indexFilePath, { flags: "w" });

            let position = 0; // Отслеживаем смещение вручную

            data.forEach(({ key, value }) => {
                const line = `${key}:${value}\n`;

                dataStream.write(line);
                indexStream.write(`${key}:${position}\n`); // Записываем смещение в индекс-файл

                this.index.set(key, position); // Записываем смещение в память

                position += Buffer.byteLength(line, "utf-8"); // Обновляем смещение
            });

            dataStream.end();
            indexStream.end();

            let completed = 0;
            const checkCompletion = () => {
                if (++completed === 2) resolve();
            };

            dataStream.on("finish", checkCompletion);
            indexStream.on("finish", checkCompletion);
            dataStream.on("error", reject);
            indexStream.on("error", reject);
        });
    }

    read(key: string): string | null {
        if (!this.index.has(key)) return null;

        const position = this.index.get(key)!;
        const fd = fs.openSync(this.dataFilePath, "r");
        const buffer = Buffer.alloc(1024);

        const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, position);
        fs.closeSync(fd);

        if (bytesRead === 0) return null;

        const line = buffer.toString("utf-8", 0, bytesRead).split("\n")[0];
        return line.includes(":") ? line.split(":")[1] : null;
    }

    delete(): void {
        if (fs.existsSync(this.dataFilePath)) fs.unlinkSync(this.dataFilePath);
        if (fs.existsSync(this.indexFilePath)) fs.unlinkSync(this.indexFilePath);
    }
}