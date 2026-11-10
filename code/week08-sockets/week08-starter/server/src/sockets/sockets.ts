// The socket server: how browsers keep a connection open to us, so we can
// tell them when something changes.
//
// Empty for now. In class we fill it in.

import type { Server as HttpServer } from 'node:http';
import type { Server } from 'socket.io';

export const initSockets = (httpServer: HttpServer): void => {};

export const getIo = (): Server | null => null;
