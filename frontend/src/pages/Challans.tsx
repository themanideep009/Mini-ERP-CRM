import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SalesChallan, PaginationMeta } from '../types/index.js';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorMessage from '../components/ErrorMessage.js';
import EmptyState from '../components/EmptyState.js';
import StatusBadge from '../components/StatusBadge.js';
import Pagination from '../components/Pagination.js';
import { useAuth } from '../context/AuthContext.js';

const Challans: React.FC = () => {
  const { hasRole } = useAuth();
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchChallans = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page: currentPage, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/challans', { params });
      if (res.data.success) {
        setChallans(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sales challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [currentPage, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-dark">Sales Challans Directory</h2>
          <p className="text-secondary text-sm">Issue draft challans and confirm goods dispatch orders</p>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <Link to="/challans/create" className="btn btn-primary">
            + Create Sales Challan
          </Link>
        )}
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-dark">Status Filter:</label>
          <select
            className="form-control max-w-xs"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Challans</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* List Table */}
      <div className="card">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner text="Fetching sales challans..." />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorMessage message={error} onRetry={fetchChallans} />
          </div>
        ) : challans.length === 0 ? (
          <EmptyState
            title="No sales challans found"
            description="Create a draft challan to start the order dispatch workflow."
            actionText={hasRole('ADMIN', 'SALES') ? '+ Create Challan' : undefined}
            onAction={hasRole('ADMIN', 'SALES') ? () => window.location.href = '/challans/create' : undefined}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Challan Number</th>
                    <th>Customer Name</th>
                    <th>Status</th>
                    <th>Total Quantity</th>
                    <th>Created By</th>
                    <th>Created Date</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {challans.map((ch) => (
                    <tr key={ch.id}>
                      <td>
                        <Link to={`/challans/${ch.id}`} className="font-bold text-primary hover:underline">
                          {ch.challanNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="font-medium text-dark">{ch.customer?.customerName || 'N/A'}</div>
                        <div className="text-xs text-secondary">{ch.customer?.businessName}</div>
                      </td>
                      <td>
                        <StatusBadge status={ch.status} />
                      </td>
                      <td className="font-bold text-dark">{ch.totalQuantity} units</td>
                      <td className="text-xs text-secondary">{ch.creator?.name || 'User'}</td>
                      <td className="text-xs text-secondary">
                        {new Date(ch.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <Link to={`/challans/${ch.id}`} className="btn btn-xs btn-outline-secondary">
                          View Details
                        </Link>
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
    </div>
  );
};

export default Challans;
