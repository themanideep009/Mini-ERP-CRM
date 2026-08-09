import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import DashboardLayout from './layouts/DashboardLayout.js';

import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import Customers from './pages/Customers.js';
import CustomerForm from './pages/CustomerForm.js';
import CustomerDetail from './pages/CustomerDetail.js';
import Products from './pages/Products.js';
import ProductForm from './pages/ProductForm.js';
import ProductDetail from './pages/ProductDetail.js';
import Inventory from './pages/Inventory.js';
import Challans from './pages/Challans.js';
import ChallanCreate from './pages/ChallanCreate.js';
import ChallanDetail from './pages/ChallanDetail.js';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />

        {/* Authenticated Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Customer CRM Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />}>
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
              <Route path="/customers/create" element={<CustomerForm />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />
            </Route>

            {/* Product Catalog Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']} />}>
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />}>
              <Route path="/products/create" element={<ProductForm />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />
            </Route>

            {/* Inventory Movements Route */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE', 'ACCOUNTS']} />}>
              <Route path="/inventory" element={<Inventory />} />
            </Route>

            {/* Sales Challan Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']} />}>
              <Route path="/challans" element={<Challans />} />
              <Route path="/challans/:id" element={<ChallanDetail />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
              <Route path="/challans/create" element={<ChallanCreate />} />
            </Route>
          </Route>
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
