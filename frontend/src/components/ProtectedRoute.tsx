import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You can render a loading spinner or a blank page here
    return <div className="min-h-screen flex items-center justify-center"><p>Завантаження...</p></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If children are provided, render them. Otherwise, render Outlet for nested routes.
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute; 