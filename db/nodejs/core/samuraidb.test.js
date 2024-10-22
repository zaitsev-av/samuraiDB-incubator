import SamuraiDB from './samuraidb.js';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
    promises: {
        appendFile: jest.fn(),
        readFile: jest.fn(),
    },
}));

describe('SamuraiDB', () => {
    const filename = 'testdb.txt';
    let db;

    beforeEach(() => {
        db = new SamuraiDB(filename);
        fs.appendFile.mockClear();
        fs.readFile.mockClear();
    });

    test('set should append data to the file', async () => {
        const key = 'testKey';
        const data = { name: 'John Doe', age: 30 };

        await db.set(key, data);

        expect(fs.appendFile).toHaveBeenCalledWith(filename, `${key},${JSON.stringify(data)}\n`);
    });

    test('get should return the latest value for a given key', async () => {
        const key = 'testKey';
        const data1 = { name: 'John Doe', age: 30 };
        const data2 = { name: 'Jane Doe', age: 25 };
        const fileContent = `${key},${JSON.stringify(data1)}\n${key},${JSON.stringify(data2)}\n`;

        fs.readFile.mockResolvedValue(fileContent);

        const result = await db.get(key);

        expect(result).toEqual(data2);
    });

    test('get should return null if the key is not found', async () => {
        const key = 'nonExistentKey';
        const fileContent = 'anotherKey,{"value":"test"}\n';

        fs.readFile.mockResolvedValue(fileContent);

        const result = await db.get(key);

        expect(result).toBeNull();
    });
});
