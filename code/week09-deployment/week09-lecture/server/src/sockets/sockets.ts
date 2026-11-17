// The socket server: how browsers keep a connection open to us, so we can
// tell them when something changes.
//
// Set up once in index.ts with initSockets(), then used anywhere through
// getIo() -- the same shape as connect() and getDb() in db/db.ts.

// #region setup
import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { getClientOrigin } from '../config.js';
import { verifyToken } from '../services/auth-service.js';

let io: Server | null = null;

export const initSockets = (httpServer: HttpServer): void => {
  // Sockets do CORS separately from Express, so they need the same origin.
  io = new Server(httpServer, {
    cors: { origin: getClientOrigin() }
  });
  // #endregion setup

  // #region auth
  // Runs once per connection, before 'connection'. A browser that sends a
  // token gets checked; one without a token is let in anonymously and only
  // ever hears broadcasts. A bad token is turned away.
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      next();
      return;
    }
    try {
      socket.data.user = verifyToken(token);
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });
  // #endregion auth

  // #region connection
  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`socket connected: ${user ? user.username : 'anonymous'}`);

    // Rooms are named groups of sockets we can send to. Who joins which
    // comes from the token, never from anything the browser asks for.
    if (user) {
      socket.join(`user:${user.sub}`);
      if (user.role === 'staff') {
        socket.join('staff');
      }
    }
  });
  // #endregion connection
};

// #region get-io
// null until initSockets() runs.
export const getIo = (): Server | null => io;
// #endregion get-io
