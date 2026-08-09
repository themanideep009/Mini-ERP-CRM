import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';

export const DashboardLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
