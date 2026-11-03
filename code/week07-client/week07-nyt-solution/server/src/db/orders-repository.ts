import { ObjectId } from 'mongodb';
import type { Document } from 'mongodb';
import { getDb } from './db.js';
import type { NewOrder, Order, OrderStatus } from '../models/order.js';

const ORDERS = 'orders';

const toOrder = (doc: Document): Order => {
  return {
    id: doc._id.toString(),
    customerId: doc.customerId,
    customerUsername: doc.customerUsername,
    items: doc.items,
    total: doc.total,
    status: doc.status,
    createdAt: doc.createdAt
  };
};

export const insertOrder = async (order: NewOrder): Promise<Order> => {
  const result = await getDb().collection(ORDERS).insertOne({ ...order });
  return { id: result.insertedId.toString(), ...order };
};

// Every order, or only one customer's.
export const findOrders = async (filter: {
  customerId?: string;
}): Promise<Order[]> => {
  const query = filter.customerId ? { customerId: filter.customerId } : {};
  const docs = await getDb()
    .collection(ORDERS)
    .find(query)
    .sort({ createdAt: 1 })
    .toArray();
  return docs.map((doc) => toOrder(doc));
};

export const findOrder = async (id: string): Promise<Order | null> => {
  const doc = await getDb()
    .collection(ORDERS)
    .findOne({ _id: new ObjectId(id) });
  return doc ? toOrder(doc) : null;
};

// Changes the status only if it is still `from`, in one step. Returns null
// if the order wasn't in that state (or doesn't exist).
export const changeStatus = async (
  id: string,
  from: OrderStatus,
  to: OrderStatus
): Promise<Order | null> => {
  const doc = await getDb()
    .collection(ORDERS)
    .findOneAndUpdate(
      { _id: new ObjectId(id), status: from },
      { $set: { status: to } },
      { returnDocument: 'after' }
    );
  return doc ? toOrder(doc) : null;
};

export const _clearOrders = async (): Promise<void> => {
  await getDb().collection(ORDERS).deleteMany({});
};
