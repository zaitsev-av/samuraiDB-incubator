import {createServer} from 'net';
import {join} from 'path';
import {MemTable} from "../core/mem-table/mem-table";
import {RedBlackTree} from "../core/mem-table/IMemTableStructure/red-black-tree/red-black-tree";
import {SamuraiDB} from "../core/samurai-db/samurai-d-b";
import { randomUUID } from 'crypto';


const dir = join(__dirname, '..', '..', 'db');

const redBlackTree = new RedBlackTree();
const memTable = new MemTable<string, any>(redBlackTree);
const db = new SamuraiDB<string, any>(memTable);

(async () => {
  //await db.init();
})();

const server = createServer(async (socket) => {
  console.log('Client connected');

  socket.on('data', async (data) => {
    let requestAction = JSON.parse(data.toString().split('\n')[0]);

    console.log('Received from client:', data.toString());

    switch (requestAction.type) {
      case 'SET': {
        const id = randomUUID();
        await db.put(id, { ...requestAction.payload, id: id });
        let response = {
          ...requestAction.payload,
          id,
          uuid: requestAction.uuid,
        };
        console.log(JSON.stringify(response));
        socket.write(JSON.stringify(response));
        break;
      }
      case 'GET': {
        const data = await db.get(requestAction.payload.id);
        let response = {
          ...data,
          uuid: requestAction.uuid,
        };
        console.log('response: ', JSON.stringify(response));
        socket.write(JSON.stringify(response));
        break;
      }
      case 'DELETE': {
        const data = await db.delete(requestAction.payload.id);
        let response = {
          uuid: requestAction.uuid,
        };
        console.log('response: ', JSON.stringify(response));
        socket.write(JSON.stringify(response));
        break;
      }
      default: {
        console.error(`Unknown request type: ${requestAction.type}`);
        socket.write('Unknown request type');
        break;
      }
    }
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', () => {
    console.log('Client error');
  });
});

server.listen(4001, () => {
  console.log('Server listening on port 4001');
});