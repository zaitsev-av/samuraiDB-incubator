import SamuraiDB from "./core/samuraidb.js";

const samuraiDB = new SamuraiDB()


async function seedDB() {
    for (let i = 0; i < 100; i++) {
        await samuraiDB.set(i, {
            id: i,
            title: 'Some title ' + i,
            date: new Date(2024,11,11)
        })
    }
}

async function updateSomeData() {
    for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
            await samuraiDB.set(i, {
                id: i,
                title: 'Updated title'+ i,
                date: new Date(2024,11,11)
            })
        }
    }
}

await seedDB();
//updateSomeData();
const foundItem = await samuraiDB.get('98');
console.log(foundItem)
