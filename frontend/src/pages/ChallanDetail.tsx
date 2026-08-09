import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SalesChallan } from '../types/index.js';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorMessage from '../components/ErrorMessage.js';
import StatusBadge from '../components/StatusBadge.js';
import { useAuth } from '../context/AuthContext.js';

const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [challan, setChallan] = useState<SalesChallan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const fetchChallan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/challans/${id}`);
      if (res.data.success) {
        setChallan(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sales challan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirm = async () => {
    if (!challan) return;
    if (!window.confirm(`Confirm sales challan ${challan.challanNumber}? This will immediately deduct warehouse stock.`)) {
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await api.post(`/challans/${challan.id}/confirm`);
      if (res.data.success) {
        setSuccessMessage('Sales challan confirmed successfully! Inventory stock deducted.');
        fetchChallan();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm challan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!challan) return;
    if (!window.confirm(`Cancel sales challan ${challan.challanNumber}? If confirmed previously, stock will be restored.`)) {
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await api.post(`/challans/${challan.id}/cancel`);
      if (res.data.success) {
        setSuccessMessage('Sales challan cancelled. Stock restored to inventory.');
        fetchChallan();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel challan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading sales challan..." />;
  if (error && !challan) return <ErrorMessage message={error} onRetry={fetchChallan} />;
  if (!challan) return null;

  const totalAmount = challan.items?.reduce((sum, i) => sum + (i.subtotal || 0), 0) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Printable Invoice Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-dark">{challan.challanNumber}</h2>
            <StatusBadge status={challan.status} />
          </div>
          <p className="text-secondary text-sm">Created on {new Date(challan.createdAt).toLocaleString()}</p>
        </div>

        <div className="flex gap-2">
          <Link to="/challans" className="btn btn-secondary btn-sm">
            ← Back to Challans
          </Link>
          <button onClick={() => window.print()} className="btn btn-outline-secondary btn-sm">
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-success rounded-lg text-sm font-medium">
          ✅ {successMessage}
        </div>
      )}

      {/* Action Bar for Status Transitions */}
      {challan.status === 'DRAFT' && hasRole('ADMIN', 'SALES', 'WAREHOUSE') && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-bold text-amber-900 block text-sm">Draft Sales Challan</span>
            <span className="text-xs text-amber-700">
              Confirming this order will check stock availability across all items, deduct inventory, and issue snapshot records.
            </span>
          </div>
          <button
            onClick={handleConfirm}
            disabled={actionLoading}
            className="btn btn-success"
          >
            {actionLoading ? 'Processing Stock Check...' : '✅ Confirm Challan & Deduct Stock'}
          </button>
        </div>
      )}

      {challan.status === 'CONFIRMED' && hasRole('ADMIN', 'SALES') && (
        <div className="p-4 bg-gray-50 border rounded-lg flex justify-between items-center">
          <div>
            <span className="font-bold text-dark block text-sm">Order Confirmed</span>
            <span className="text-xs text-secondary">
              Need to reverse this dispatch? Cancelling will restore all item stock back to inventory.
            </span>
          </div>
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            className="btn btn-outline-danger"
          >
            {actionLoading ? 'Restoring Stock...' : '🚫 Cancel Challan'}
          </button>
        </div>
      )}

      {/* Challan Card Layout */}
      <div className="card p-8 print-card space-y-6">
        {/* Company & Client Header */}
        <div className="grid grid-cols-2 gap-6 border-b pb-6">
          <div>
            <h3 className="text-lg font-bold text-primary mb-1">WHOLESALE DISTRIBUTORS PVT LTD</h3>
            <p className="text-xs text-secondary">100 Logistics Park, Ring Road</p>
            <p className="text-xs text-secondary">GSTIN: 07ERPWholesale123</p>
            <p className="text-xs text-secondary">Phone: +91 98765 00000</p>
          </div>

          <div className="text-right">
            <h4 className="font-bold text-dark text-sm uppercase text-secondary">Consignee / Customer Details</h4>
            <div className="font-bold text-dark text-base mt-1">{challan.customer?.customerName}</div>
            <div className="text-sm font-medium text-secondary">{challan.customer?.businessName}</div>
            <div className="text-xs text-secondary mt-1">{challan.customer?.address}</div>
            <div className="text-xs text-secondary">GSTIN: <code>{challan.customer?.gstNumber}</code></div>
          </div>
        </div>

        {/* Snapshot Items Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Snapshot & Description</th>
                <th>SKU</th>
                <th>Unit Price (Snapshot)</th>
                <th>Quantity</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {challan.items?.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  <td className="font-bold text-dark">{item.productNameSnapshot}</td>
                  <td><code>{item.skuSnapshot}</code></td>
                  <td>₹{item.unitPriceSnapshot?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="font-bold">{item.quantity} units</td>
                  <td className="text-right font-bold text-dark">
                    ₹{item.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Calculation */}
        <div className="flex justify-between items-center border-t pt-4">
          <div className="text-xs text-secondary">
            Issued By: <strong>{challan.creator?.name}</strong> ({challan.creator?.email})
          </div>

          <div className="text-right space-y-1">
            <div className="text-sm text-secondary">
              Total Dispatch Quantity: <strong className="text-dark">{challan.totalQuantity} units</strong>
            </div>
            <div className="text-2xl font-bold text-primary">
              Grand Total: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallanDetail;
