import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.js';
import Navbar from '../components/Navbar.js';

const getPageTitle = (pathname: string): string => {
  if (pathname === '/dashboard') return 'Executive & Operations Dashboard';
  if (pathname.startsWith('/customers/create')) return 'Add New Customer';
  if (pathname.includes('/edit') && pathname.startsWith('/customers')) return 'Edit Customer';
  if (pathname.startsWith('/customers/')) return 'Customer Details';
  if (pathname === '/customers') return 'Customer CRM Management';
  if (pathname.startsWith('/products/create')) return 'Add New Product';
  if (pathname.includes('/edit') && pathname.startsWith('/products')) return 'Edit Product';
  if (pathname.startsWith('/products/')) return 'Product Details';
  if (pathname === '/products') return 'Product Catalog';
  if (pathname === '/inventory') return 'Inventory Stock Movements';
  if (pathname.startsWith('/challans/create')) return 'Create Sales Challan';
  if (pathname.startsWith('/challans/')) return 'Sales Challan Details';
  if (pathname === '/challans') return 'Sales Challans Directory';
  return 'Mini ERP + CRM Operations Portal';
};

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Navbar title={pageTitle} />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
