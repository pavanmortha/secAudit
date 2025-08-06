import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { QueryProvider } from './providers/QueryProvider';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { Audits } from './pages/Audits';
import { Vulnerabilities } from './pages/Vulnerabilities';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { CertInAudit } from './pages/CertInAudit';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="assets" element={<Assets />} />
              <Route path="audits" element={<Audits />} />
              <Route path="vulnerabilities" element={<Vulnerabilities />} />
              <Route path="certin-audit" element={<CertInAudit />} />
              <Route path="reports" element={<Reports />} />
              <Route path="users" element={
                <ProtectedRoute requiredRole="admin">
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute requiredRole="admin">
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;