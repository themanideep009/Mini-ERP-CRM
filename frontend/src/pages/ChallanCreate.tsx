import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Customer, Product } from '../types/index.js';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorMessage from '../components/ErrorMessage.js';

interface LineItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  currentStock: number;
  productName: string;
  sku: string;
  subtotal: number;
}

const ChallanCreate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCustomerId = searchParams.get('customerId') || '';

  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId);

  const [items, setItems] = useState<LineItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers', { params: { limit: 100 } }),
          api.get('/products', { params: { limit: 100 } }),
        ]);

        if (custRes.data.success) {
          setCustomers(custRes.data.data);
          if (!selectedCustomerId && custRes.data.data.length > 0) {
            setSelectedCustomerId(custRes.data.data[0].id);
          }
        }

        if (prodRes.data.success) {
          setProducts(prodRes.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load customers and products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddItem = () => {
    if (products.length === 0) return;
    const firstProduct = products[0];

    const newItem: LineItem = {
      productId: firstProduct.id,
      productName: firstProduct.productName,
      sku: firstProduct.sku,
      unitPrice: firstProduct.unitPrice,
      currentStock: firstProduct.currentStock,
      quantity: 1,
      subtotal: firstProduct.unitPrice * 1,
    };

    setItems((prev) => [...prev, newItem]);
  };

  const handleProductChange = (index: number, productId: string) => {
    const selectedProd = products.find((p) => p.id === productId);
    if (!selectedProd) return;

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: selectedProd.id,
        productName: selectedProd.productName,
        sku: selectedProd.sku,
        unitPrice: selectedProd.unitPrice,
        currentStock: selectedProd.currentStock,
        subtotal: selectedProd.unitPrice * updated[index].quantity,
      };
      return updated;
    });
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const qty = Math.max(1, quantity);
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: qty,
        subtotal: updated[index].unitPrice * qty,
      };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one product item to the challan.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      customerId: selectedCustomerId,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await api.post('/challans', payload);
      if (res.data.success) {
        navigate(`/challans/${res.data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create sales challan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Initializing challan creation wizard..." />;

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-dark">Create Sales Challan (DRAFT)</h2>
          <p className="text-secondary text-sm">Drafting a challan does not deduct stock until confirmed.</p>
        </div>
        <Link to="/challans" className="btn btn-secondary btn-sm">
          ← Back to Challans
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selector Card */}
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-bold text-dark border-b pb-2">1. Select Customer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Customer / Business Name *</label>
              <select
                className="form-control"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName} ({c.businessName}) - {c.customerType}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-3 bg-gray-50 rounded text-xs space-y-1">
                <div><strong>GSTIN:</strong> <code>{selectedCustomer.gstNumber}</code></div>
                <div><strong>Contact:</strong> {selectedCustomer.mobile} | {selectedCustomer.email}</div>
                <div><strong>Address:</strong> {selectedCustomer.address}</div>
              </div>
            )}
          </div>
        </div>

        {/* Product Items Table */}
        <div className="card p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-bold text-dark">2. Product Line Items</h3>
            <button type="button" onClick={handleAddItem} className="btn btn-sm btn-outline-primary">
              + Add Product Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-secondary border-2 border-dashed rounded-lg">
              No products added yet. Click <strong>"+ Add Product Item"</strong> above.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Available Stock</th>
                    <th>Unit Price (₹)</th>
                    <th style={{ width: '120px' }}>Quantity</th>
                    <th>Subtotal (₹)</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <select
                          className="form-control"
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          required
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.productName} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`font-bold ${item.quantity > item.currentStock ? 'text-danger' : 'text-success'}`}>
                          {item.currentStock} units
                        </span>
                        {item.quantity > item.currentStock && (
                          <div className="text-2xs text-danger font-semibold">
                            ⚠️ Exceeds stock (Confirm will block)
                          </div>
                        )}
                      </td>
                      <td className="font-semibold">
                        ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                          required
                        />
                      </td>
                      <td className="font-bold text-dark">
                        ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="btn btn-xs btn-outline-danger"
                        >
                          ✕ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals Summary */}
          {items.length > 0 && (
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right space-y-1">
                <div className="text-sm text-secondary">
                  Total Items Quantity: <strong className="text-dark font-bold">{totalQuantity} units</strong>
                </div>
                <div className="text-xl font-bold text-primary">
                  Estimated Total: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/challans" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={submitting || items.length === 0} className="btn btn-primary">
            {submitting ? 'Saving Draft...' : 'Save Draft Challan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChallanCreate;
