import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Customer, PaginationMeta } from '../types/index.js';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorMessage from '../components/ErrorMessage.js';
import EmptyState from '../components/EmptyState.js';
import StatusBadge from '../components/StatusBadge.js';
import Pagination from '../components/Pagination.js';
import { useAuth } from '../context/AuthContext.js';

const Customers: React.FC = () => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page: currentPage, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.customerType = typeFilter;

      const res = await api.get('/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete customer '${name}'?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-dark">Customer Directory</h2>
          <p className="text-secondary text-sm">Manage wholesale buyers, leads, and retail clients</p>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <Link to="/customers/create" className="btn btn-primary">
            + Add New Customer
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search name, mobile, GST, email..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="LEAD">LEAD</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div>
            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Customer Types</option>
              <option value="RETAIL">RETAIL</option>
              <option value="WHOLESALE">WHOLESALE</option>
              <option value="DISTRIBUTOR">DISTRIBUTOR</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-secondary w-full">
              🔍 Search
            </button>
          </div>
        </form>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner text="Fetching customer records..." />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorMessage message={error} onRetry={fetchCustomers} />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers found"
            description="Try adjusting your search criteria or add a new customer."
            actionText={hasRole('ADMIN', 'SALES') ? '+ Create Customer' : undefined}
            onAction={hasRole('ADMIN', 'SALES') ? () => window.location.href = '/customers/create' : undefined}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer / Business</th>
                    <th>Contact Info</th>
                    <th>Type</th>
                    <th>GST Number</th>
                    <th>Status</th>
                    <th>Follow-up Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div>
                          <Link to={`/customers/${c.id}`} className="font-bold text-primary hover:underline">
                            {c.customerName}
                          </Link>
                          <div className="text-xs text-secondary">{c.businessName}</div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">{c.mobile}</div>
                        <div className="text-xs text-secondary">{c.email}</div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{c.customerType}</span>
                      </td>
                      <td>
                        <code className="text-xs">{c.gstNumber}</code>
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        {c.followUpDate ? (
                          <span className="text-xs font-medium text-dark">
                            📅 {new Date(c.followUpDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-secondary">—</span>
                        )}
                      </td>
                      <td className="text-right space-x-2">
                        <Link to={`/customers/${c.id}`} className="btn btn-xs btn-outline-secondary">
                          View
                        </Link>
                        {hasRole('ADMIN', 'SALES') && (
                          <Link to={`/customers/${c.id}/edit`} className="btn btn-xs btn-secondary">
                            Edit
                          </Link>
                        )}
                        {hasRole('ADMIN') && (
                          <button
                            onClick={() => handleDelete(c.id, c.customerName)}
                            className="btn btn-xs btn-outline-danger"
                          >
                            Delete
                          </button>
                        )}
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

export default Customers;
