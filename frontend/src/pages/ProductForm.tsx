import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorMessage from '../components/ErrorMessage.js';

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStock: 10,
    warehouseLocation: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isEdit && id) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/products/${id}`);
          if (res.data.success) {
            const data = res.data.data;
            setFormData({
              productName: data.productName || '',
              sku: data.sku || '',
              category: data.category || '',
              unitPrice: data.unitPrice || 0,
              currentStock: data.currentStock || 0,
              minimumStock: data.minimumStock || 0,
              warehouseLocation: data.warehouseLocation || '',
            });
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch product details');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (isEdit && id) {
        await api.put(`/products/${id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      navigate('/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading product data..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-dark">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <p className="text-secondary text-sm">Define pricing, stock thresholds, and location</p>
        </div>
        <Link to="/products" className="btn btn-secondary btn-sm">
          ← Back to Catalog
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group md:col-span-2">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="productName"
                className="form-control"
                value={formData.productName}
                onChange={handleChange}
                required
                placeholder="e.g. Dynamic Wireless Bluetooth Speaker"
              />
            </div>

            <div className="form-group">
              <label className="form-label">SKU Code *</label>
              <input
                type="text"
                name="sku"
                className="form-control"
                value={formData.sku}
                onChange={handleChange}
                required
                placeholder="e.g. PROD-SPK-001"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                type="text"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                required
                placeholder="e.g. Electronics, Electricals, Gadgets"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="unitPrice"
                className="form-control"
                value={formData.unitPrice}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Warehouse Location *</label>
              <input
                type="text"
                name="warehouseLocation"
                className="form-control"
                value={formData.warehouseLocation}
                onChange={handleChange}
                required
                placeholder="e.g. Shelf A-3, Bay 4"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Stock Units {!isEdit && '(Initial)'}</label>
              <input
                type="number"
                min="0"
                name="currentStock"
                className="form-control"
                value={formData.currentStock}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Stock Alert Quantity *</label>
              <input
                type="number"
                min="0"
                name="minimumStock"
                className="form-control"
                value={formData.minimumStock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link to="/products" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
