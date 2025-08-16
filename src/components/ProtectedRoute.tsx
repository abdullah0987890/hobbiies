// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "customer" | "provider";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ff00c8] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user is authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user role doesn't match required role, redirect to appropriate dashboard
  if (user.role !== requiredRole) {
    if (user.role === "customer") {
      return <Navigate to="/customerDashboard" replace />;
    } else if (user.role === "provider") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If everything checks out, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;