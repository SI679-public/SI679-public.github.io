// Live updates from the server, over a WebSocket, using socket.io.

// #region connect
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getToken } from './session.ts';

const API_URL = import.meta.env.VITE_API_URL;

// One socket for the whole app, made the first time a screen subscribes.
let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (!socket) {
    socket = io(API_URL, {
      // A function, not a value: socket.io calls it every time it
      // (re)connects, so it always sends the token we have *now*.
      auth: (send) => send({ token: getToken() })
    });
  }
  return socket;
};
// #endregion connect

// Start listening for `event`, and call `handler` each time it arrives.
// Returns a function that stops listening. Screens call this inside
// useEffect and return what it gives back, so React stops listening when
// the screen goes away.
// #region subscribe
export const subscribe = (
  event: string,
  handler: (data: any) => void
): (() => void) => {
  const s = getSocket();
  s.on(event, handler);
  return () => {
    s.off(event, handler);
  };
};
// #endregion subscribe

// Reconnect with whatever token we have now. login() and logout() call
// this, so the server always knows who's on the other end.
// #region reconnect
export const reconnectSocket = (): void => {
  socket?.disconnect().connect();
};
// #endregion reconnect
