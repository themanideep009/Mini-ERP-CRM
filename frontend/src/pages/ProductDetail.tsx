import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types/index.js';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorMessage from '../components/ErrorMessage.js';
import StatusBadge from '../components/StatusBadge.js';
import { useAuth } from '../context/AuthContext.js';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading product profile..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProduct} />;
  if (!product) return null;

  const isLowStock = product.currentStock <= product.minimumStock;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-dark">{product.productName}</h2>
            <span className="badge badge-secondary">{product.category}</span>
            {isLowStock && <span className="badge badge-danger">⚠️ Low Stock Warning</span>}
          </div>
          <p className="text-secondary text-sm">SKU Code: <code>{product.sku}</code></p>
        </div>
        <div className="flex gap-2">
          <Link to="/products" className="btn btn-secondary btn-sm">
            ← Back to Catalog
          </Link>
          {hasRole('ADMIN', 'WAREHOUSE') && (
            <Link to={`/products/${product.id}/edit`} className="btn btn-primary btn-sm">
              ✏️ Edit Product
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <span className="text-secondary text-xs uppercase font-semibold block">Unit Price</span>
          <span className="text-xl font-bold text-dark mt-1 block">
            ₹{product.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="card p-4">
          <span className="text-secondary text-xs uppercase font-semibold block">Current Stock</span>
          <span className={`text-xl font-bold mt-1 block ${isLowStock ? 'text-danger' : 'text-success'}`}>
            {product.currentStock} units
          </span>
        </div>

        <div className="card p-4">
          <span className="text-secondary text-xs uppercase font-semibold block">Minimum Threshold</span>
          <span className="text-xl font-bold text-dark mt-1 block">{product.minimumStock} units</span>
        </div>

        <div className="card p-4">
          <span className="text-secondary text-xs uppercase font-semibold block">Warehouse Location</span>
          <span className="text-lg font-mono font-bold text-primary mt-1 block">
            {product.warehouseLocation}
          </span>
        </div>
      </div>

      {/* Stock Movement History Ledger */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Product Stock Movement Audit Ledger</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Quantity Changed</th>
                <th>Reason</th>
                <th>Recorded By</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {!product.movements || product.movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-secondary py-4">
                    No stock movements logged for this product.
                  </td>
                </tr>
              ) : (
                product.movements.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <StatusBadge status={m.movementType} />
                    </td>
                    <td className={`font-bold ${m.quantityChanged > 0 ? 'text-success' : 'text-danger'}`}>
                      {m.quantityChanged > 0 ? `+${m.quantityChanged}` : m.quantityChanged} units
                    </td>
                    <td className="text-sm text-dark">{m.reason}</td>
                    <td className="text-xs text-secondary">{m.creator?.name || 'System'}</td>
                    <td className="text-xs text-secondary">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
