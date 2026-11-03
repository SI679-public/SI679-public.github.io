import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Product } from '../types.ts';
import { getProducts, restockProduct } from '../api/products.ts';
import { money, swatch } from '../format.ts';

const LOW_STOCK = 3;

// Staff: what's in stock, and a way to add more.
export const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const handleRestock = async (event: FormEvent, id: string) => {
    event.preventDefault();
    setBusyId(id);
    try {
      const updated = await restockProduct(id, Number(amounts[id]));
      setProducts(products.map((p) => (p.id === id ? updated : p)));
      setAmounts({ ...amounts, [id]: '' });
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <h2>Inventory</h2>
      {loading && <p aria-busy="true">Loading products…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>In stock</th>
              <th>Restock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <span
                    className="swatch"
                    style={{ background: swatch(product.color) }}
                    title={product.color}
                  />
                  {product.modelName}
                  <br />
                  <small>
                    {product.manufacturer} · {product.modelNumber}
                  </small>
                </td>
                <td>{money(product.price)}</td>
                <td>
                  {product.quantity === 0 ? (
                    <span className="badge out">0</span>
                  ) : product.quantity <= LOW_STOCK ? (
                    <span className="badge low">{product.quantity}</span>
                  ) : (
                    product.quantity
                  )}
                </td>
                <td>
                  <form
                    className="restock"
                    onSubmit={(e) => handleRestock(e, product.id)}
                  >
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={amounts[product.id] ?? ''}
                      onChange={(e) =>
                        setAmounts({ ...amounts, [product.id]: e.target.value })
                      }
                      aria-label={`Restock ${product.modelName}`}
                      required
                    />
                    <button
                      type="submit"
                      aria-busy={busyId === product.id}
                      disabled={busyId === product.id}
                    >
                      Add
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
