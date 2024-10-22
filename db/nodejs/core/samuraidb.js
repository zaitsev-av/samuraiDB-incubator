import { promises as fs, createReadStream } from 'node:fs';
import { resolve, join } from 'node:path';
import readline from 'node:readline';

class SamuraiDB {
    constructor(filename = 'samuraidb.txt') {
        // todo: join vs resolve
        this.filename = join(filename);
        this.index = new Map();
    }

    async set(key, data) {
        // Сериализуем данные в JSON и создаем строку в формате "ключ,значение"
        const entry = `${key},${JSON.stringify(data)}\n`;

        // Открываем файл для получения текущего смещения
        const fileHandle = await fs.open(this.filename, 'a');
        const offset = (await fileHandle.stat()).size;

        await fs.appendFile(this.filename, entry);

        // Закрываем файл
        await fileHandle.close();

        // Обновляем индекс: сохраняем смещение для ключа
        this.index.set(key.toString(), offset);
    }

    async get(key) {
        // Проверяем наличие ключа в индексе
        const offset = this.index.get(key);
        if (offset === undefined) {
            return null; // Если ключа нет в индексе, возвращаем null
        }

        // Открываем файл и переходим к нужному смещению
        const fileHandle = await fs.open(this.filename, 'r');

        // Читаем строку с ключом и значением
        const buffer = Buffer.alloc(1024); // Создаем буфер для чтения строки
        await fileHandle.read(buffer, 0, 1024, offset);
        const line = buffer.toString('utf-8').trim();

        // Закрываем файл
        await fileHandle.close();

        const [storedKey, storedValue] = line.split(/,(.+)/);

        if (storedKey === key) {
            return JSON.parse(storedValue);
        } else {
            return null; // В случае непредвиденного несоответствия ключей
        }
    }
}


export default SamuraiDB;