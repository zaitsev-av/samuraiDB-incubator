import net from 'net';
import { fileURLToPath } from 'url';
import SamuraiDB from "../core/samuraidb.js";
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new SamuraiDB(__dirname + '/samuraidb.txt');

const server = net.createServer(async (socket) => {
    console.log('Client connected');


    socket.on('data', async (data) => {
        let requestAction = JSON.parse(data.toString());

        console.log('Received from client:', data.toString());


        switch (requestAction.type) {
            case 'SET': {
                await db.set(requestAction.payload.id, requestAction.payload.dto)
                break;
            }
            case 'GET': {
                const data = await db.get(requestAction.payload.id)
                console.log(JSON.stringify(data))
                socket.write(JSON.stringify(data))
                break;
            }
            default: {
                console.error(`Unknown request type: ${requestAction.type}`);
                socket.write('Unknown request type')
                break;
            }
        }
    });

    socket.on('end', () => {
        console.log('Client disconnected');
    });
});

server.listen(4001, () => {
    console.log('Server listening on port 4001');
});