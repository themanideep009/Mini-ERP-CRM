import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Customer } from '../types/index.js';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorMessage from '../components/ErrorMessage.js';
import StatusBadge from '../components/StatusBadge.js';
import { useAuth } from '../context/AuthContext.js';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchCustomer = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.data.success) {
        setCustomer(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading customer profile..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCustomer} />;
  if (!customer) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-dark">{customer.customerName}</h2>
            <StatusBadge status={customer.status} />
            <span className="badge badge-secondary">{customer.customerType}</span>
          </div>
          <p className="text-secondary text-sm">{customer.businessName}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/customers" className="btn btn-secondary btn-sm">
            ← Back to List
          </Link>
          {hasRole('ADMIN', 'SALES') && (
            <Link to={`/customers/${customer.id}/edit`} className="btn btn-primary btn-sm">
              ✏️ Edit Customer
            </Link>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 space-y-4 md:col-span-2">
          <h3 className="font-bold text-lg border-b pb-2">Business & Contact Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-secondary block">Business Name</span>
              <span className="font-medium text-dark">{customer.businessName}</span>
            </div>
            <div>
              <span className="text-secondary block">GST Number</span>
              <code className="font-mono text-dark">{customer.gstNumber}</code>
            </div>
            <div>
              <span className="text-secondary block">Mobile Number</span>
              <span className="font-medium text-dark">{customer.mobile}</span>
            </div>
            <div>
              <span className="text-secondary block">Email Address</span>
              <span className="font-medium text-dark">{customer.email}</span>
            </div>
            <div className="col-span-2">
              <span className="text-secondary block">Address</span>
              <span className="font-medium text-dark">{customer.address}</span>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2">CRM Follow-up</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-secondary block">Follow-up Date</span>
              <span className="font-bold text-primary">
                {customer.followUpDate
                  ? `📅 ${new Date(customer.followUpDate).toLocaleDateString()}`
                  : 'No date scheduled'}
              </span>
            </div>
            <div>
              <span className="text-secondary block mb-1">Notes & Interaction History</span>
              <div className="p-3 bg-gray-50 rounded border text-xs text-dark min-h-20 whitespace-pre-wrap">
                {customer.notes || 'No CRM notes recorded for this customer.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales Challans for Customer */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="card-title">Challan Order History ({customer.challans?.length || 0})</h3>
          {hasRole('ADMIN', 'SALES') && (
            <Link to={`/challans/create?customerId=${customer.id}`} className="btn btn-xs btn-primary">
              + New Challan
            </Link>
          )}
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Challan No</th>
                <th>Status</th>
                <th>Total Qty</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!customer.challans || customer.challans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-secondary py-4">
                    No sales challans recorded for this customer yet.
                  </td>
                </tr>
              ) : (
                customer.challans.map((ch) => (
                  <tr key={ch.id}>
                    <td>
                      <Link to={`/challans/${ch.id}`} className="font-bold text-primary hover:underline">
                        {ch.challanNumber}
                      </Link>
                    </td>
                    <td>
                      <StatusBadge status={ch.status} />
                    </td>
                    <td className="font-semibold">{ch.totalQuantity} units</td>
                    <td className="text-xs text-secondary">
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to={`/challans/${ch.id}`} className="btn btn-xs btn-outline-secondary">
                        View
                      </Link>
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

export default CustomerDetail;
