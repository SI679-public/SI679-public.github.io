// #region order-created
// Everything the server tells browsers, in one place: which event, and who
// hears it. The rest of the app calls these functions and never touches
// socket.io itself.
//
// The rule: notify right after a change is saved, from the layer that saved
// it.

import type { Order } from '../models/order.js';
import { getIo } from './sockets.js';

// A new order: tell every staff member.
export const orderCreated = (order: Order): void => {
  // getIo() is null in the supertest tests, which don't start a socket
  // server; ?. makes this do nothing then.
  getIo()?.to('staff').emit('order:created', order);
};
// #endregion order-created
