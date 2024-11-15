class SamuraiDB {
    /**
     *
     * @param {FileAdapter} fileAdapter
     */
    constructor(fileAdapter) {
        this.fileAdapter = fileAdapter;
       // this.index = new Map();
    }

    async init() {
        this.index = await this.fileAdapter.readIndex();
    }

    async set(key, data) {
        const {offset} = await this.fileAdapter.set(key, data)
        // Обновляем индекс: сохраняем смещение для ключа
        this.index.set(key.toString(), offset);
        await this.fileAdapter.saveIndex(this.index);
    }

    async get(key) {
        // Проверяем наличие ключа в индексе
        const offset = this.index.get(key);
        if (offset === undefined) {
            return null; // Если ключа нет в индексе, возвращаем null
        }
        return await this.fileAdapter.get(offset);
    }
}


export default SamuraiDB;