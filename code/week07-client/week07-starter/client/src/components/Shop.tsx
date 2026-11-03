import { useEffect, useState } from 'react';
import type { Product, User } from '../types.ts';
import { getProducts } from '../api/products.ts';
import { placeOrder } from '../api/orders.ts';
import { money, swatch } from '../format.ts';
import { Cart } from './Cart.tsx';
import type { CartLine } from './Cart.tsx';

type Props = {
  user: User | null;
  onLoginClick: () => void;
};

export const Shop = ({ user, onLoginClick }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The cart lives only here, in the browser, until the order is placed.
  const [cart, setCart] = useState<CartLine[]>([]);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedMessage, setPlacedMessage] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setProducts(await getProducts());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const inCart = (productId: string): number =>
    cart.find((line) => line.product.id === productId)?.quantity ?? 0;

  const addToCart = (product: Product) => {
    setPlacedMessage(null);
    if (inCart(product.id) > 0) {
      changeQuantity(product.id, inCart(product.id) + 1);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const changeQuantity = (productId: string, quantity: number) => {
    setCart(
      cart.map((line) =>
        line.product.id === productId ? { ...line, quantity } : line
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((line) => line.product.id !== productId));
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setOrderError(null);
    try {
      const order = await placeOrder(
        cart.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity
        }))
      );
      setCart([]);
      setPlacedMessage(`Order placed: ${money(order.total)}.`);
      loadProducts(); // stock has changed
    } catch (err) {
      setOrderError((err as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="shop">
      <section>
        <h2>Coffee makers</h2>
        {loading && <p aria-busy="true">Loading products…</p>}
        {error && <p className="error">{error}</p>}
        <div className="products">
          {products.map((product) => (
            <article key={product.id} className="product">
              <span
                className="swatch"
                style={{ background: swatch(product.color) }}
                title={product.color}
              />
              <h3>{product.modelName}</h3>
              <p>
                <small>
                  {product.manufacturer} · {product.modelNumber}
                </small>
              </p>
              <p className="price">{money(product.price)}</p>
              <p>
                {product.quantity === 0 ? (
                  <span className="badge out">Sold out</span>
                ) : (
                  <small>{product.quantity} in stock</small>
                )}
              </p>
              {user?.role === 'customer' && (
                <button
                  onClick={() => addToCart(product)}
                  disabled={inCart(product.id) >= product.quantity}
                >
                  Add to cart
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <aside>
        {user?.role === 'customer' ? (
          <Cart
            lines={cart}
            onChangeQuantity={changeQuantity}
            onRemove={removeFromCart}
            onPlaceOrder={handlePlaceOrder}
            placing={placing}
            error={orderError}
            placedMessage={placedMessage}
          />
        ) : (
          <article>
            <h3>Your cart</h3>
            <p>
              <button className="link" onClick={onLoginClick}>
                Log in
              </button>{' '}
              to start an order.
            </p>
          </article>
        )}
      </aside>
    </div>
  );
};
