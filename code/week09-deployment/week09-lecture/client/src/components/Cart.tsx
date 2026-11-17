import type { Product } from '../types.ts';
import { money } from '../format.ts';

export type CartLine = {
  product: Product;
  quantity: number;
};

type Props = {
  lines: CartLine[];
  onChangeQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onPlaceOrder: () => void;
  placing: boolean;
  error: string | null;
  placedMessage: string | null;
};

export const Cart = ({
  lines,
  onChangeQuantity,
  onRemove,
  onPlaceOrder,
  placing,
  error,
  placedMessage
}: Props) => {
  const total = lines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  );

  return (
    <article className="cart">
      <h3>Your cart</h3>
      {placedMessage && <p className="success">{placedMessage}</p>}
      {lines.length === 0 ? (
        <p>
          <small>Nothing here yet.</small>
        </p>
      ) : (
        <>
          <ul>
            {lines.map((line) => (
              <li key={line.product.id}>
                <span className="line-name">{line.product.modelName}</span>
                <input
                  type="number"
                  min={1}
                  max={line.product.quantity}
                  value={line.quantity}
                  onChange={(e) =>
                    onChangeQuantity(line.product.id, Number(e.target.value))
                  }
                  aria-label={`Quantity of ${line.product.modelName}`}
                />
                <span className="line-price">
                  {money(line.product.price * line.quantity)}
                </span>
                <button
                  className="link"
                  onClick={() => onRemove(line.product.id)}
                  aria-label={`Remove ${line.product.modelName}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <p className="total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </p>
          {error && <p className="error">{error}</p>}
          <button onClick={onPlaceOrder} aria-busy={placing} disabled={placing}>
            Place order
          </button>
        </>
      )}
    </article>
  );
};
