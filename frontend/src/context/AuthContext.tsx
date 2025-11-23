import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, PlanType } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserPlan: (plan: PlanType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('🔐 Auth Provider Initializing...');

    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');

    if (storedUser) {
      console.log('   ✅ Found stored user:', JSON.parse(storedUser));
      console.log('   ✅ Found auth token:', storedToken ? 'Yes' : 'No');
      setUser(JSON.parse(storedUser));
    } else {
      console.log('   ℹ️  No stored user found - user needs to login');
    }
    console.log('---');
  }, []);

  const login = async (email: string, password: string) => {
    console.log('\n🔑 Login Attempt:');
    console.log('   Email:', email);
    console.log('   Password:', '***');

    // Mock login - replace with actual API call
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      plan: 'Free',
      createdAt: new Date().toISOString(),
    };

    const token = 'mock-token-' + Date.now();

    console.log('   ✅ Login successful!');
    console.log('   User:', mockUser);
    console.log('   Token generated:', token);

    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', token);

    console.log('   💾 Saved to localStorage');
    console.log('---');
  };

  const logout = () => {
    console.log('\n🚪 Logout:');
    console.log('   Removing user:', user?.email);

    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');

    console.log('   ✅ Logged out successfully');
    console.log('---');
  };

  const updateUserPlan = (plan: PlanType) => {
    console.log('\n📊 Updating User Plan:');
    console.log('   Current Plan:', user?.plan);
    console.log('   New Plan:', plan);

    if (user) {
      const updatedUser = { ...user, plan };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      console.log('   ✅ Plan updated successfully');
    } else {
      console.log('   ❌ No user logged in');
    }
    console.log('---');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUserPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
