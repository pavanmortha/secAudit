import { useState, useContext, createContext, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication with demo credentials
    const demoUsers = {
      'admin@secaudit.com': { password: 'admin123', role: 'admin', name: 'Admin User', department: 'IT Security' },
      'auditor@secaudit.com': { password: 'auditor123', role: 'auditor', name: 'John Auditor', department: 'Security' },
      'auditee@secaudit.com': { password: 'auditee123', role: 'auditee', name: 'Jane Developer', department: 'Development' }
    };

    const demoUser = demoUsers[email as keyof typeof demoUsers];
    
    if (demoUser && demoUser.password === password) {
      const userData = {
        id: '1',
        name: demoUser.name,
        email: email,
        role: demoUser.role as 'admin' | 'auditor' | 'auditee',
        department: demoUser.department,
        lastLogin: new Date()
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('auth_token', 'demo-token-' + Date.now());
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};