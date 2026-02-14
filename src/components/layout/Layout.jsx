import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';

const Layout = () => {
  const { user, loading } = useAuth();
  const { currentOrg } = useOrg();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {!currentOrg ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Organization Selected</h2>
            <p className="text-gray-500 mb-4">Please create or join an organization to get started.</p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default Layout;