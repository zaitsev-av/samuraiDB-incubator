import {SSTableFile} from "./SSTableFile";

describe('SSTableFile.ts', () => {
    test('blabal', () => {
        const table = new SSTableFile();
        expect(table.mergeAllSelectedAndOverlap()).toBe(true);
    })
})