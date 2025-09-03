import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Auth } from '../pages/Auth';
import { Dashboard } from '../pages/Dashboard';
import { Claims } from '../pages/Claims';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';
import { Onboarding } from '../pages/Onboarding';
import { Subscription } from '../pages/Subscription';
import { PageLayout } from '../components/layout/PageLayout';

// Protected route wrapper
const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
};

// Onboarding check wrapper
const OnboardingCheck: React.FC = () => {
  const { user } = useAuth();
  
  // Check if user has completed onboarding
  // This is a placeholder - you would typically check a field in the user profile
  const hasCompletedOnboarding = user?.subscriptionPlan !== 'basic';
  
  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <Outlet />;
};

// Auth route wrapper (redirects to dashboard if already authenticated)
const AuthRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Auth />;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthRoute />} />
        
        {/* Protected routes that require authentication */}
        <Route element={<ProtectedRoute />}>
          {/* Onboarding route */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/subscription" element={<Subscription />} />
          
          {/* Routes that require completed onboarding */}
          <Route element={<OnboardingCheck />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        
        {/* Redirect root to dashboard or auth */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

