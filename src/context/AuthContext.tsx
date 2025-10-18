import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

// Determine which service to use based on environment
const isProduction = import.meta.env.PROD;
// Force use of API service in production to use Vercel serverless functions
const useSupabase = !isProduction && import.meta.env.VITE_USE_SUPABASE === 'true';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('hospital_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (useSupabase && supabase) {
        // Use Supabase authentication
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          console.error('Supabase login failed:', authError.message);
          setIsLoading(false);
          return false;
        }

        if (authData.user) {
          // Get user details from users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (userError) {
            console.error('Failed to fetch user details:', userError.message);
            setIsLoading(false);
            return false;
          }

          if (userData) {
            const user: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              department: userData.department
            };

            setUser(user);
            localStorage.setItem('hospital_user', JSON.stringify(user));
            setIsLoading(false);
            return true;
          }
        }
      } else {
        // Use local API
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Login failed:', errorData.error);
          setIsLoading(false);
          return false;
        }

        const data = await response.json();
        
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('hospital_user', JSON.stringify(data.user));
          localStorage.setItem('auth_token', data.token);
          setIsLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    if (useSupabase && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('hospital_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
