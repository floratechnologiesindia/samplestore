import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN;

type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  status: string;
  category?: { name: string } | null;
  variants: { id: number; sku: string; size: string | null; color: string | null; stock: number }[];
};

type AdminOrder = {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  createdAt: string;
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(cents / 100);
}

function App() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [newProductSlug, setNewProductSlug] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("streetwear");
  const [newProductImage, setNewProductImage] = useState("");

  useEffect(() => {
    if (!isAuthed) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const commonInit: RequestInit = ADMIN_TOKEN
          ? { headers: { "x-admin-token": ADMIN_TOKEN } }
          : {};
        const [productsRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/products`, commonInit),
          fetch(`${API_BASE_URL}/admin/orders`, commonInit),
        ]);
        if (!productsRes.ok || !ordersRes.ok) {
          throw new Error("Failed to load admin data");
        }
        setProducts((await productsRes.json()) as AdminProduct[]);
        setOrders((await ordersRes.json()) as AdminOrder[]);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthed]);

  const reloadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const commonInit: RequestInit = ADMIN_TOKEN
        ? { headers: { "x-admin-token": ADMIN_TOKEN } }
        : {};
      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/products`, commonInit),
        fetch(`${API_BASE_URL}/admin/orders`, commonInit),
      ]);
      if (!productsRes.ok || !ordersRes.ok) {
        throw new Error("Failed to load admin data");
      }
      setProducts((await productsRes.json()) as AdminProduct[]);
      setOrders((await ordersRes.json()) as AdminOrder[]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedEmail = import.meta.env.VITE_ADMIN_EMAIL ?? "admin@trendvibes.test";
    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD ?? "admin123";
    if (email === expectedEmail && password === expectedPassword) {
      setIsAuthed(true);
      setError(null);
    } else {
      setError("Invalid admin credentials");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductSlug || !newProductPrice) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ADMIN_TOKEN ? { "x-admin-token": ADMIN_TOKEN } : {}),
        },
        body: JSON.stringify({
          name: newProductName,
          slug: newProductSlug,
          description: newProductName,
          basePrice: Math.round(Number(newProductPrice) * 100),
          status: "published",
          brand: "TrendVibes",
          categorySlug: newProductCategory,
          imageUrl: newProductImage || undefined,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to create product");
      }
      setNewProductName("");
      setNewProductSlug("");
      setNewProductPrice("");
      setNewProductImage("");
      await reloadData();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleOrderStatusChange = async (id: number, status: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(ADMIN_TOKEN ? { "x-admin-token": ADMIN_TOKEN } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error("Failed to update order status");
      }
      await reloadData();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="admin-brand-mark">TV</span>
          <div>
            <div className="admin-brand-title">TrendVibes Boutique</div>
            <div className="admin-brand-subtitle">Admin console</div>
          </div>
        </div>
        <nav className="admin-nav">
          <button
            className={tab === "products" ? "admin-tab admin-tab-active" : "admin-tab"}
            onClick={() => setTab("products")}
          >
            Products
          </button>
          <button
            className={tab === "orders" ? "admin-tab admin-tab-active" : "admin-tab"}
            onClick={() => setTab("orders")}
          >
            Orders
          </button>
        </nav>
      </header>

      <main className="admin-main">
        {!isAuthed && (
          <section className="admin-login-card">
            <h2 className="admin-section-title">Admin login</h2>
            <p className="admin-text-muted">
              Sign in to access the TrendVibes admin console. For local testing, use the credentials
              configured in <code>VITE_ADMIN_EMAIL</code> and <code>VITE_ADMIN_PASSWORD</code>.
            </p>
            <form className="admin-login-form" onSubmit={handleAdminLogin}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@trendvibes.test"
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                />
              </label>
              <button type="submit" className="admin-login-button">
                Enter console
              </button>
            </form>
            {error && <p className="admin-text-error">{error}</p>}
          </section>
        )}

        {isAuthed && (
        <>
          {loading && <p className="admin-text-muted">Loading data…</p>}
          {error && <p className="admin-text-error">{error}</p>}

          {!loading && !error && tab === "products" && (
          <section>
            <h2 className="admin-section-title">Catalog overview</h2>
            <p className="admin-text-muted">
              Manage the products that power your TrendVibes storefront.
            </p>
            <form className="admin-login-form" onSubmit={handleCreateProduct}>
              <label>
                <span>Name</span>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="New product name"
                />
              </label>
              <label>
                <span>Slug</span>
                <input
                  type="text"
                  value={newProductSlug}
                  onChange={(e) => setNewProductSlug(e.target.value)}
                  placeholder="new-product-slug"
                />
              </label>
              <label>
                <span>Base price (USD)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  placeholder="79.00"
                />
              </label>
              <label>
                <span>Category</span>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                >
                  <option value="streetwear">Streetwear</option>
                  <option value="essentials">Essentials</option>
                  <option value="accessories">Accessories</option>
                </select>
              </label>
              <label>
                <span>Image URL (optional)</span>
                <input
                  type="url"
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  placeholder="https://images..."
                />
              </label>
              <button type="submit" className="admin-login-button">
                Add product
              </button>
            </form>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Base price</th>
                    <th>Variants</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.category?.name ?? "–"}</td>
                      <td>{p.status}</td>
                      <td>{formatPrice(p.basePrice)}</td>
                      <td>{p.variants.length}</td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="admin-text-muted">
                        No products yet. Seeded products will appear here as you expand the catalog.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

          {!loading && !error && tab === "orders" && (
          <section>
            <h2 className="admin-section-title">Recent orders</h2>
            <p className="admin-text-muted">
              Review and update the status of incoming TrendVibes orders.
            </p>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.orderNumber}</td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleOrderStatusChange(o.id, e.target.value)
                          }
                        >
                          <option value="pending">pending</option>
                          <option value="paid">paid</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td>{o.paymentStatus}</td>
                      <td>{formatPrice(o.grandTotal)}</td>
                      <td>{new Date(o.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="admin-text-muted">
                        No orders yet. Complete a dummy checkout from the storefront to see data
                        here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          )}
        </>
        )}
      </main>
    </div>
  );
}

export default App;
