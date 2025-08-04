import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { QueryProvider } from './providers/QueryProvider';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { Audits } from './pages/Audits';
import { Vulnerabilities } from './pages/Vulnerabilities';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="assets" element={<Assets />} />
              <Route path="audits" element={<Audits />} />
              <Route path="vulnerabilities" element={<Vulnerabilities />} />
              <Route path="reports" element={<Reports />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
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