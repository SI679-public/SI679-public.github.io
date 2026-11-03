import { useEffect, useState } from 'react';
import type { Order } from '../types.ts';
import { getOrders } from '../api/orders.ts';
import { OrderCard } from './OrderCard.tsx';

export const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Newest first.
  const sorted = [...orders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return (
    <section className="narrow">
      <h2>My orders</h2>
      {loading && <p aria-busy="true">Loading orders…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p>You haven't placed any orders yet.</p>
      )}
      {sorted.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </section>
  );
};
