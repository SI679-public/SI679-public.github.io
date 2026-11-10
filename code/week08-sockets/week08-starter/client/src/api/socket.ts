// Live updates from the server, over a WebSocket.
//
// Right now these do nothing, so the screens still need a reload to see
// changes. In class we fill them in with socket.io.

// Start listening for `event`, and call `handler` each time it arrives.
// Returns a function that stops listening. Screens call this inside
// useEffect and return what it gives back, so React stops listening when
// the screen goes away.
// #region subscribe
export const subscribe = (
  event: string,
  handler: (data: any) => void
): (() => void) => {
  return () => {};
};
// #endregion subscribe

// Reconnect with whatever token we have now. login() and logout() call
// this, so the server always knows who's on the other end.
export const reconnectSocket = (): void => {};
