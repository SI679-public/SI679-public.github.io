// Helpers for testing sockets. You don't need to change these, but read
// them: they're how the tests in sockets.e2e.test.ts talk to the server.
//
// Testing sockets needs a real server, listening on a real port. supertest
// alone makes one request and it's over; a socket has to stay connected
// while something else happens.

import { createServer } from 'node:http';
import type { Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import jwt from 'jsonwebtoken';
import { io as connectClient } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { app } from '../app.js';
import { getJwtSecret } from '../config.js';
import { getIo, initSockets } from '../sockets/sockets.js';

let server: HttpServer | null = null;
let url = '';
const clients: Socket[] = [];

// #region start
// Start our app, sockets and all, on a free port (port 0 means "any free
// port"). Returns its address, which supertest can use too.
export const startTestServer = async (): Promise<string> => {
  server = createServer(app);
  initSockets(server);
  await new Promise<void>((resolve) => server!.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  url = `http://localhost:${port}`;
  return url;
};
// #endregion start

export const stopTestServer = async (): Promise<void> => {
  for (const client of clients) {
    client.disconnect();
  }
  clients.length = 0;
  // Closing the socket server closes the HTTP server under it too.
  await new Promise<void>((resolve) => {
    const io = getIo();
    if (io) {
      io.close(() => resolve());
    } else {
      server?.close(() => resolve());
    }
  });
};

// A token for a made-up user, signed with our secret.
export const tokenFor = (
  sub: string,
  username: string,
  role: 'customer' | 'staff'
): string => jwt.sign({ sub, username, role }, getJwtSecret());

// #region connect
// Connect a test client, the way a browser would: with a token, or with
// none. Resolves once the server has let it in; rejects if it's turned away.
export const connectAs = async (token?: string): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    const client = connectClient(url, {
      auth: token ? { token } : {},
      transports: ['websocket']
    });
    clients.push(client);
    client.on('connect', () => resolve(client));
    client.on('connect_error', (err) => reject(err));
  });
};
// #endregion connect

// #region listen-for
// Starts listening for `event` on this client, and resolves with its data
// when it arrives. Call it *before* doing whatever should cause the event,
// and await it after. Fails the test if nothing arrives within `ms`
// milliseconds.
export const listenFor = async (
  client: Socket,
  event: string,
  ms: number = 2000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`No ${event} within ${ms}ms`));
    }, ms);
    client.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
};
// #endregion listen-for

// #region heard-within
// Resolves true if this client hears `event` within `ms` milliseconds, and
// false if it doesn't. For checking that someone *didn't* hear something.
export const heardWithin = async (
  client: Socket,
  event: string,
  ms: number = 300
): Promise<boolean> => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), ms);
    client.once(event, () => {
      clearTimeout(timer);
      resolve(true);
    });
  });
};
// #endregion heard-within
