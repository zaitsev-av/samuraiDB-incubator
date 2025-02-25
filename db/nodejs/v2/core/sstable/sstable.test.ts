import * as fs from "fs";
import * as path from "path";
import { SSTable } from "./sstable";

const TEST_DIR = path.join(__dirname, "test_data");
const TEST_FILE = "test_sstable";



describe("SSTable", () => {
    beforeEach(() => {
        if (!fs.existsSync(TEST_DIR)) {
            fs.mkdirSync(TEST_DIR);
        }

        const dataFile = path.join(TEST_DIR, `${TEST_FILE}.sst`);
        const indexFile = path.join(TEST_DIR, `${TEST_FILE}.idx`);

        if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
        if (fs.existsSync(indexFile)) fs.unlinkSync(indexFile);
    });

    afterEach(() => {

    });


    test("should write and read data correctly", async () => {
        const sstable = new SSTable(TEST_DIR, TEST_FILE);
        const data = [
            { key: "key1", value: "value1" },
            { key: "key2", value: "value2" },
            { key: "key3", value: "value3" },
        ];

        await sstable.flush(data);

        expect(sstable.read("key1")).toBe("value1");
        expect(sstable.read("key2")).toBe("value2");
        expect(sstable.read("key3")).toBe("value3");
        expect(sstable.read("non_existing")).toBeNull();
    });

    test("should persist and load index after restart", async () => {
        const initialSSTable = new SSTable(TEST_DIR, TEST_FILE);
        const data = [
            { key: "keyA", value: "valueA" },
            { key: "keyB", value: "valueB" },
        ];

        await initialSSTable.flush(data);

        // Создаем новый SSTable-объект (эмулируя перезапуск)
        const newSSTable = new SSTable(TEST_DIR, TEST_FILE);

        expect(newSSTable.read("keyA")).toBe("valueA");
        expect(newSSTable.read("keyB")).toBe("valueB");
        expect(newSSTable.read("keyC")).toBeNull();
    });

    test("should delete files correctly", async () => {
        const sstable = new SSTable(TEST_DIR, TEST_FILE);
        await sstable.flush([{ key: "k1", value: "v1" }]);

        expect(fs.existsSync(path.join(TEST_DIR, `${TEST_FILE}.sst`))).toBe(true);
        expect(fs.existsSync(path.join(TEST_DIR, `${TEST_FILE}.idx`))).toBe(true);

        sstable.delete();

        expect(fs.existsSync(path.join(TEST_DIR, `${TEST_FILE}.sst`))).toBe(false);
        expect(fs.existsSync(path.join(TEST_DIR, `${TEST_FILE}.idx`))).toBe(false);
    });
});