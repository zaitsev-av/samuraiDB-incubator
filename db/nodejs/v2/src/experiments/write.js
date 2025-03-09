const {createWriteStream} = require("node:fs");

const stream = createWriteStream("test.txt");

for (let i = 0; i < 100000; i++) {
    const ok = stream.write(`Line ${i}\n`);
}

stream.end();