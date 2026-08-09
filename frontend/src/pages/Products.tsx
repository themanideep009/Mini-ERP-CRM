import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product, PaginationMeta } from '../types/index.js';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorMessage from '../components/ErrorMessage.js';
import EmptyState from '../components/EmptyState.js';
import Pagination from '../components/Pagination.js';
import Modal from '../components/Modal.js';
import { useAuth } from '../context/AuthContext.js';

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { hasRole } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(
    searchParams.get('lowStock') === 'true'
  );
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Quick Stock Movement Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementModalOpen, setMovementModalOpen] = useState<boolean>(false);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [modalSubmitting, setModalSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page: currentPage, limit: 10 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockFilter) params.lowStock = 'true';

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch product catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, categoryFilter, lowStockFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleOpenStockModal = (product: Product, type: 'IN' | 'OUT') => {
    setSelectedProduct(product);
    setMovementType(type);
    setQuantity(1);
    setReason(type === 'IN' ? 'Stock replenishment' : 'Dispatched / Manual Adjustment');
    setModalError('');
    setMovementModalOpen(true);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setModalSubmitting(true);
    setModalError('');

    try {
      await api.post('/stock-movements', {
        productId: selectedProduct.id,
        quantityChanged: Number(quantity),
        movementType,
        reason,
      });

      setMovementModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to submit stock movement');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product '${name}'?`)) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-dark">Product Catalog & Inventory</h2>
          <p className="text-secondary text-sm">Manage products, stock levels, minimum thresholds, and locations</p>
        </div>
        {hasRole('ADMIN', 'WAREHOUSE') && (
          <Link to="/products/create" className="btn btn-primary">
            + Add New Product
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search product name, SKU, location..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by Category"
              className="form-control"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 text-sm font-medium text-dark cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => {
                  setLowStockFilter(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 text-primary rounded"
              />
              <span>⚠️ Show Low Stock Only</span>
            </label>
          </div>

          <div>
            <button type="submit" className="btn btn-secondary w-full">
              🔍 Filter Products
            </button>
          </div>
        </form>
      </div>

      {/* Catalog Table */}
      <div className="card">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner text="Fetching products list..." />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorMessage message={error} onRetry={fetchProducts} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="No items match your criteria."
            actionText={hasRole('ADMIN', 'WAREHOUSE') ? '+ Add Product' : undefined}
            onAction={hasRole('ADMIN', 'WAREHOUSE') ? () => window.location.href = '/products/create' : undefined}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Current Stock</th>
                    <th>Min Stock</th>
                    <th>Location</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isLowStock = p.currentStock <= p.minimumStock;
                    return (
                      <tr key={p.id} className={isLowStock ? 'bg-red-50/50' : ''}>
                        <td>
                          <div>
                            <Link to={`/products/${p.id}`} className="font-bold text-primary hover:underline">
                              {p.productName}
                            </Link>
                            <div className="text-xs text-secondary">SKU: <code>{p.sku}</code></div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-secondary">{p.category}</span>
                        </td>
                        <td className="font-semibold text-dark">
                          ₹{p.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <span className={`font-bold ${isLowStock ? 'text-danger' : 'text-success'}`}>
                              {p.currentStock} units
                            </span>
                            {isLowStock && <span title="Low Stock Warning">⚠️</span>}
                          </div>
                        </td>
                        <td className="text-secondary">{p.minimumStock}</td>
                        <td>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {p.warehouseLocation}
                          </span>
                        </td>
                        <td className="text-right space-x-1">
                          {hasRole('ADMIN', 'WAREHOUSE') && (
                            <>
                              <button
                                onClick={() => handleOpenStockModal(p, 'IN')}
                                className="btn btn-xs btn-outline-success"
                                title="Stock IN"
                              >
                                + IN
                              </button>
                              <button
                                onClick={() => handleOpenStockModal(p, 'OUT')}
                                className="btn btn-xs btn-outline-danger"
                                title="Stock OUT"
                              >
                                - OUT
                              </button>
                            </>
                          )}
                          <Link to={`/products/${p.id}`} className="btn btn-xs btn-outline-secondary">
                            View
                          </Link>
                          {hasRole('ADMIN', 'WAREHOUSE') && (
                            <Link to={`/products/${p.id}/edit`} className="btn btn-xs btn-secondary">
                              Edit
                            </Link>
                          )}
                          {hasRole('ADMIN') && (
                            <button
                              onClick={() => handleDelete(p.id, p.productName)}
                              className="btn btn-xs btn-outline-danger"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {meta && <Pagination meta={meta} onPageChange={(page) => setCurrentPage(page)} />}
          </>
        )}
      </div>

      {/* Quick Stock Movement Modal */}
      {selectedProduct && (
        <Modal
          isOpen={movementModalOpen}
          onClose={() => setMovementModalOpen(false)}
          title={`Stock ${movementType} Adjustment: ${selectedProduct.productName}`}
        >
          <form onSubmit={handleStockSubmit} className="space-y-4">
            {modalError && <ErrorMessage message={modalError} />}

            <div className="p-3 bg-gray-50 rounded text-sm mb-2">
              Current Stock: <strong>{selectedProduct.currentStock} units</strong> | SKU: <code>{selectedProduct.sku}</code>
            </div>

            <div className="form-group">
              <label className="form-label">Movement Type</label>
              <select
                className="form-control"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as 'IN' | 'OUT')}
                required
              >
                <option value="IN">IN (+ Add Stock)</option>
                <option value="OUT">OUT (- Deduct Stock)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Reference *</label>
              <input
                type="text"
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                placeholder="e.g. Shipment received, damaged goods, stock adjustment..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setMovementModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalSubmitting}
                className={`btn ${movementType === 'IN' ? 'btn-success' : 'btn-danger'}`}
              >
                {modalSubmitting ? 'Processing...' : `Submit Stock ${movementType}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Products;
