import type { ReactNode } from 'react';
import type { Order } from '../types.ts';
import { dateTime, money } from '../format.ts';

type Props = {
  order: Order;
  showCustomer?: boolean;
  children?: ReactNode; // e.g. a button, shown at the bottom
};

// One order: when, what, how much, and its status.
export const OrderCard = ({ order, showCustomer, children }: Props) => (
  <article className="order">
    <header>
      <span>
        <strong>{dateTime(order.createdAt)}</strong>
        {showCustomer && <small> · {order.customerUsername}</small>}
      </span>
      <span className={`badge ${order.status}`}>{order.status}</span>
    </header>
    <ul>
      {order.items.map((item) => (
        <li key={item.productId}>
          <span>
            {item.quantity} × {item.modelName}
          </span>
          <span>{money(item.price * item.quantity)}</span>
        </li>
      ))}
    </ul>
    <p className="total">
      <span>Total</span>
      <strong>{money(order.total)}</strong>
    </p>
    {children}
  </article>
);
