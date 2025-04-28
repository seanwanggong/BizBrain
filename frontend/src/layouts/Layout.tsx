import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';

const Layout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout; 