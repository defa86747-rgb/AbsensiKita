import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { StudentData } from './pages/StudentData';
import { TeacherAttendance } from './pages/TeacherAttendance';
import { StudentAttendance } from './pages/StudentAttendance';
import { Recap } from './pages/Recap';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" /> : <LandingPage />} 
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/absensi-guru" 
        element={
          <ProtectedRoute>
            <TeacherAttendance />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/absensi-siswa" 
        element={
          <ProtectedRoute>
            <StudentAttendance />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/rekap" 
        element={
          <ProtectedRoute>
            <Recap />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/siswa" 
        element={
          <ProtectedRoute roles={['admin']}>
            <StudentData />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
