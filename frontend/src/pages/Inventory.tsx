import React, { useState, useEffect } from 'react';
import { StockMovement, PaginationMeta, Product } from '../types/index.js';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorMessage from '../components/ErrorMessage.js';
import EmptyState from '../components/EmptyState.js';
import StatusBadge from '../components/StatusBadge.js';
import Pagination from '../components/Pagination.js';
import Modal from '../components/Modal.js';
import { useAuth } from '../context/AuthContext.js';

const Inventory: React.FC = () => {
  const { hasRole } = useAuth();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Manual Stock Movement Modal
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [quantityChanged, setQuantityChanged] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');

  const fetchMovements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/stock-movements', {
        params: { page: currentPage, limit: 15 },
      });
      if (res.data.success) {
        setMovements(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inventory movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [currentPage]);

  const handleOpenModal = async () => {
    setModalError('');
    try {
      const res = await api.get('/products', { params: { limit: 100 } });
      if (res.data.success) {
        setProductsList(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedProductId(res.data.data[0].id);
        }
      }
      setModalOpen(true);
    } catch (err: any) {
      alert('Failed to load products for manual movement');
    }
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      await api.post('/stock-movements', {
        productId: selectedProductId,
        quantityChanged: Number(quantityChanged),
        movementType,
        reason,
      });

      setModalOpen(false);
      fetchMovements();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to record stock movement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-dark">Inventory Stock Movements Ledger</h2>
          <p className="text-secondary text-sm">Real-time audit log of stock IN and stock OUT transactions</p>
        </div>
        {hasRole('ADMIN', 'WAREHOUSE') && (
          <button onClick={handleOpenModal} className="btn btn-primary">
            + Log Stock Movement
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="card">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner text="Fetching inventory audit log..." />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorMessage message={error} onRetry={fetchMovements} />
          </div>
        ) : movements.length === 0 ? (
          <EmptyState
            title="No stock movements logged"
            description="Inventory transactions will appear here automatically when stock changes occur."
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Name & SKU</th>
                    <th>Movement Type</th>
                    <th>Quantity</th>
                    <th>Reason / Reference</th>
                    <th>Logged By</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="font-bold text-dark">{m.product?.productName || 'N/A'}</div>
                        <div className="text-xs text-secondary">SKU: <code>{m.product?.sku}</code></div>
                      </td>
                      <td>
                        <StatusBadge status={m.movementType} />
                      </td>
                      <td className={`font-bold ${m.quantityChanged > 0 ? 'text-success' : 'text-danger'}`}>
                        {m.quantityChanged > 0 ? `+${m.quantityChanged}` : m.quantityChanged} units
                      </td>
                      <td className="text-sm text-dark">{m.reason}</td>
                      <td className="text-xs text-secondary">{m.creator?.name || 'System Auto'}</td>
                      <td className="text-xs text-secondary">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && <Pagination meta={meta} onPageChange={(page) => setCurrentPage(page)} />}
          </>
        )}
      </div>

      {/* Manual Stock Entry Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Manual Stock Movement"
      >
        <form onSubmit={handleMovementSubmit} className="space-y-4">
          {modalError && <ErrorMessage message={modalError} />}

          <div className="form-group">
            <label className="form-label">Select Product *</label>
            <select
              className="form-control"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
            >
              {productsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} ({p.sku}) - Current Stock: {p.currentStock}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Movement Direction *</label>
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
            <label className="form-label">Quantity Changed *</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={quantityChanged}
              onChange={(e) => setQuantityChanged(Number(e.target.value))}
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
              placeholder="e.g. Warehouse receipt, Damaged stock audit, Opening inventory adjustment"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Recording...' : 'Record Stock Movement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
