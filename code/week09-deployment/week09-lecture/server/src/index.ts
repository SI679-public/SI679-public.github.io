import { createServer } from 'node:http';
import { app } from './app.js';
import { connect } from './db/db.js';
import { initSockets } from './sockets/sockets.js';
import { getPort } from './config.js';

const port = getPort();

await connect();

// One HTTP server for both: Express handles ordinary requests, and
// socket.io handles the connections that ask to be upgraded to a socket.
const server = createServer(app);
initSockets(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
