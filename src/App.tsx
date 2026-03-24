/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';
import { seedInitialData } from './lib/seedData';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import MemberDashboard from './pages/MemberDashboard';
import Members from './pages/Members';
import Equipment from './pages/Equipment';
import Schedule from './pages/Schedule';
import Progress from './pages/Progress';
import Payments from './pages/Payments';
import Feedback from './pages/Feedback';
import Attendance from './pages/Attendance';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      seedInitialData();
    }
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/trainer-dashboard" element={
          <ProtectedRoute allowedRoles={['trainer']}>
            <TrainerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/member-dashboard" element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberDashboard />
          </ProtectedRoute>
        } />

        <Route path="/members" element={
          <ProtectedRoute allowedRoles={['admin', 'trainer']}>
            <Members />
          </ProtectedRoute>
        } />

        <Route path="/equipment" element={
          <ProtectedRoute allowedRoles={['admin', 'member']}>
            <Equipment />
          </ProtectedRoute>
        } />

        <Route path="/schedule" element={
          <ProtectedRoute allowedRoles={['admin', 'trainer', 'member']}>
            <Schedule />
          </ProtectedRoute>
        } />

        <Route path="/progress" element={
          <ProtectedRoute allowedRoles={['member', 'trainer']}>
            <Progress />
          </ProtectedRoute>
        } />

        <Route path="/payments" element={
          <ProtectedRoute allowedRoles={['admin', 'member']}>
            <Payments />
          </ProtectedRoute>
        } />

        <Route path="/feedback" element={
          <ProtectedRoute allowedRoles={['admin', 'member']}>
            <Feedback />
          </ProtectedRoute>
        } />

        <Route path="/attendance" element={
          <ProtectedRoute allowedRoles={['admin', 'trainer']}>
            <Attendance />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
