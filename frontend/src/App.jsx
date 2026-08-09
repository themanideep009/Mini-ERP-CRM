import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Pages Import
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Customers from './pages/Customers.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';
import CustomerForm from './pages/CustomerForm.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import ProductForm from './pages/ProductForm.jsx';
import Inventory from './pages/Inventory.jsx';
import Challans from './pages/Challans.jsx';
import ChallanCreate from './pages/ChallanCreate.jsx';
import ChallanDetail from './pages/ChallanDetail.jsx';

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Overview */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Customers CRM (Restricted to ADMIN, SALES, ACCOUNTS) */}
            <Route
              path="customers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="customers/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}>
                  <CustomerDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="customers/create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
                  <CustomerForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="customers/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
                  <CustomerForm />
                </ProtectedRoute>
              }
            />

            {/* Products Catalog (Viewable by all, editable by ADMIN, WAREHOUSE) */}
            <Route
              path="products"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="products/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="products/create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="products/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}>
                  <ProductForm />
                </ProtectedRoute>
              }
            />

            {/* Inventory Balance Dashboard (ADMIN, SALES, WAREHOUSE, ACCOUNTS) */}
            <Route
              path="inventory"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
                  <Inventory />
                </ProtectedRoute>
              }
            />

            {/* Sales Challan Module (Viewable by all, editable by ADMIN, SALES) */}
            <Route
              path="challans"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
                  <Challans />
                </ProtectedRoute>
              }
            />
            <Route
              path="challans/create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
                  <ChallanCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="challans/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
                  <ChallanDetail />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch All Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
