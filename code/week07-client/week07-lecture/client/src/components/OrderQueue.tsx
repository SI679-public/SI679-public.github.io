import { useEffect, useState } from 'react';
import type { Order } from '../types.ts';
import { fulfillOrder, getOrders } from '../api/orders.ts';
import { OrderCard } from './OrderCard.tsx';

// Staff: orders waiting to be fulfilled, and the ones already done.
export const OrderQueue = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setOrders(await getOrders());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleFulfill = async (id: string) => {
    setBusyId(id);
    try {
      const updated = await fulfillOrder(id);
      setOrders(orders.map((o) => (o.id === id ? updated : o)));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  // Waiting: oldest first, so the next one to do is on top.
  const waiting = orders
    .filter((o) => o.status === 'placed')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  // Done: newest first.
  const done = orders
    .filter((o) => o.status === 'fulfilled')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="queue">
      {loading && <p aria-busy="true">Loading orders…</p>}
      {error && <p className="error">{error}</p>}
      <section>
        <h2>To fulfill ({waiting.length})</h2>
        {!loading && waiting.length === 0 && <p>All caught up.</p>}
        {waiting.map((order) => (
          <OrderCard key={order.id} order={order} showCustomer>
            <button
              onClick={() => handleFulfill(order.id)}
              aria-busy={busyId === order.id}
              disabled={busyId === order.id}
            >
              Fulfill
            </button>
          </OrderCard>
        ))}
      </section>
      <section>
        <h2>Fulfilled ({done.length})</h2>
        {done.map((order) => (
          <OrderCard key={order.id} order={order} showCustomer />
        ))}
      </section>
    </div>
  );
};
