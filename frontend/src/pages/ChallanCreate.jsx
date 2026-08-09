import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';

export const ChallanCreate = () => {
  const navigate = useNavigate();

  // Master Data State
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // Challan Cart State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cartItems, setCartItems] = useState([]); // Array of { product, quantity }

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers', { params: { limit: 100 } }),
          api.get('/products', { params: { limit: 100 } }),
        ]);

        if (custRes.data?.success && prodRes.data?.success) {
          setCustomers(custRes.data.data.customers);
          setProducts(prodRes.data.data.products);
        } else {
          setError('Failed to fetch customers or products lists');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading form configuration master data');
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  const handleAddProductToCart = (prodId) => {
    const product = products.find((p) => p.id === prodId);
    if (!product) return;

    // Check if already in cart
    const existing = cartItems.find((item) => item.product.id === prodId);
    if (existing) {
      // Increment qty
      setCartItems(
        cartItems.map((item) =>
          item.product.id === prodId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      // Add new
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
  };

  const handleQtyChange = (prodId, val) => {
    const qty = parseInt(val, 10);
    if (isNaN(qty) || qty <= 0) {
      // Keep input empty or set to 1
      setCartItems(
        cartItems.map((item) => (item.product.id === prodId ? { ...item, quantity: '' } : item))
      );
      return;
    }
    setCartItems(
      cartItems.map((item) => (item.product.id === prodId ? { ...item, quantity: qty } : item))
    );
  };

  const handleQtyBlur = (prodId) => {
    // If user leaves empty, default to 1
    setCartItems(
      cartItems.map((item) =>
        item.product.id === prodId && (item.quantity === '' || item.quantity <= 0)
          ? { ...item, quantity: 1 }
          : item
      )
    );
  };

  const handleRemoveItem = (prodId) => {
    setCartItems(cartItems.filter((item) => item.product.id !== prodId));
  };

  // Calculations
  const totalQty = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
  const totalEstimate = cartItems.reduce(
    (sum, item) => sum + (parseInt(item.quantity, 10) || 0) * item.product.unitPrice,
    0
  );

  const handleSubmitDraft = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomerId) {
      setError('Please select a customer for the challan.');
      return;
    }
    if (cartItems.length === 0) {
      setError('Please select at least one product to add to the challan.');
      return;
    }

    // Check if any cart item has an empty/invalid quantity
    const hasInvalidQty = cartItems.some(
      (item) => item.quantity === '' || isNaN(item.quantity) || item.quantity <= 0
    );
    if (hasInvalidQty) {
      setError('Please verify quantities for all items in the challan.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await api.post('/challans', payload);
      if (res.data && res.data.success) {
        // Direct to detailed view of draft challan
        navigate(`/challans/${res.data.data.id}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save sales challan draft');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/challans" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          ◀ Return to Challans Register
        </Link>
        <h2 style={{ margin: '0.25rem 0 0 0' }}>Draft New Sales Challan</h2>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger-color)', padding: '1rem', marginBottom: '1.5rem', color: 'var(--danger-color)' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmitDraft} style={formContainerStyle}>
        {/* Left Side: Cart items and Customer Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1, minWidth: 0 }}>
          {/* Customer Selection */}
          <div className="card">
            <h3 style={sectionHeadingStyle}>👥 1. Select Customer Partner</h3>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Client Business Name</label>
              <select
                className="form-input"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
                disabled={submitLoading}
              >
                <option value="">-- Choose registered customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} ({c.customerName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart Contents */}
          <div className="card">
            <h3 style={sectionHeadingStyle}>🛒 2. Sales Challan Items Cart</h3>
            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '2rem' }}>🛒</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Your challan items cart is empty.</p>
                <p style={{ fontSize: '0.75rem' }}>Select products from the catalog panel on the right to add them.</p>
              </div>
            ) : (
              <div className="table-container" style={{ border: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product / SKU</th>
                      <th>Warehouse Stock</th>
                      <th>Unit Price</th>
                      <th style={{ width: '120px' }}>Quantity</th>
                      <th>Subtotal</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => {
                      const isLowStock = item.product.currentStock < (item.quantity || 1);
                      return (
                        <tr key={item.product.id}>
                          <td>
                            <strong style={{ fontSize: '0.85rem' }}>{item.product.productName}</strong>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.product.sku}</div>
                          </td>
                          <td>
                            <span style={isLowStock ? { color: 'var(--danger-color)', fontWeight: '700' } : {}}>
                              {item.product.currentStock} units
                            </span>
                          </td>
                          <td>₹{item.product.unitPrice.toLocaleString('en-IN')}</td>
                          <td>
                            <input
                              type="number"
                              className="form-input"
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(item.product.id, e.target.value)}
                              onBlur={() => handleQtyBlur(item.product.id)}
                              min="1"
                              style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}
                              required
                              disabled={submitLoading}
                            />
                            {isLowStock && (
                              <span style={{ fontSize: '0.6rem', color: 'var(--danger-color)', display: 'block', marginTop: '0.125rem' }}>
                                Exceeds stock!
                              </span>
                            )}
                          </td>
                          <td>
                            ₹{((parseInt(item.quantity, 10) || 0) * item.product.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.product.id)}
                              style={{ background: 'none', border: 0, color: 'var(--danger-color)', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                              ❌ Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Product catalogue and Checkout summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '340px', flexShrink: 0 }}>
          {/* Summary Panel */}
          <div className="card">
            <h3 style={sectionHeadingStyle}>📊 Vouchers Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', margin: '1rem 0' }}>
              <div className="flex-between">
                <span>Total Items:</span>
                <strong>{cartItems.length} lines</strong>
              </div>
              <div className="flex-between">
                <span>Total Dispatch Qty:</span>
                <strong>{totalQty} units</strong>
              </div>
              <div className="flex-between" style={{ borderTop: '1px dotted var(--border-color)', paddingTop: '0.5rem', color: 'var(--text-primary)' }}>
                <span>Estimated Value:</span>
                <strong style={{ fontSize: '1rem', color: 'var(--secondary-color)' }}>
                  ₹{totalEstimate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submitLoading || cartItems.length === 0}
            >
              {submitLoading ? 'Saving Draft...' : '💾 Save Draft Challan'}
            </button>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              * Stock is NOT reserved when in DRAFT status. Confirm the challan once saved to lock and deduct stock.
            </p>
          </div>

          {/* Side Product Catalog Picker */}
          <div className="card" style={{ maxHeight: '420px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={sectionHeadingStyle}>🏷️ Add Products</h3>
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', flexGrow: 1, paddingRight: '0.25rem' }}>
              {products.map((p) => {
                const inCart = cartItems.some((item) => item.product.id === p.id);
                return (
                  <div key={p.id} style={pickerCardStyle(inCart)}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                        {p.productName}
                      </p>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        SKU: {p.sku} | Price: ₹{p.unitPrice} | Stock: <strong>{p.currentStock}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddProductToCart(p.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', flexShrink: 0 }}
                      disabled={p.currentStock <= 0}
                    >
                      {p.currentStock <= 0 ? 'Out' : inCart ? '➕ Add' : '➕ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const formContainerStyle = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'start',
};

@media (max-width: 900px) {
  .formContainerStyle {
    flex-direction: column;
  }
}

const sectionHeadingStyle = {
  fontSize: '0.9rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '0.5rem',
  marginBottom: '0.5rem',
};

const pickerCardStyle = (inCart) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem',
  backgroundColor: inCart ? 'var(--bg-accent)' : 'var(--bg-primary)',
  border: inCart ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
});

export default ChallanCreate;
