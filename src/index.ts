import { createServer } from 'node:http';
import { app } from './server';

const server = createServer(app);

server.listen(3020, () => {
  console.log('server running at http://localhost:3000');
});
