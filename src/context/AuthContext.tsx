import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Amina Mwalimu',
    email: 'amina@alfaspecialized.co.tz',
    role: 'receptionist',
    department: 'Mapokezi (Reception)'
  },
  {
    id: '2',
    name: 'Dkt. Hassan Mbwana',
    email: 'hassan@alfaspecialized.co.tz',
    role: 'doctor',
    department: 'Matibabu ya Ndani (Internal Medicine)'
  },
  {
    id: '3',
    name: 'Grace Kimaro',
    email: 'grace@alfaspecialized.co.tz',
    role: 'lab',
    department: 'Maabara (Laboratory)'
  },
  {
    id: '4',
    name: 'Mohamed Ally',
    email: 'mohamed@alfaspecialized.co.tz',
    role: 'pharmacy',
    department: 'Famasi (Pharmacy)'
  },
  {
    id: '5',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@alfaspecialized.co.tz',
    role: 'radiologist',
    department: 'Radiology'
  },
  {
    id: '6',
    name: 'Dr. James Mwangi',
    email: 'james@alfaspecialized.co.tz',
    role: 'ophthalmologist',
    department: 'Macho (Ophthalmology)'
  },
  {
    id: '7',
    name: 'Dr. Michael Chen',
    email: 'michael@alfaspecialized.co.tz',
    role: 'radiologist',
    department: 'Radiology'
  },
  {
    id: '8',
    name: 'Dr. Sarah Kimani',
    email: 'sarah.k@alfaspecialized.co.tz',
    role: 'ophthalmologist',
    department: 'Macho (Ophthalmology)'
  },
  {
    id: '9',
    name: 'System Administrator',
    email: 'admin@alfaspecialized.co.tz',
    role: 'admin',
    department: 'Administration'
  },
  {
    id: '10',
    name: 'OT Coordinator',
    email: 'ot-coordinator@alfaspecialized.co.tz',
    role: 'ot-coordinator',
    department: 'Operating Theatre'
  }
];

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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    // For demo purposes, we'll accept any password
    // In a real application, this would check against a secure password hash
    if (foundUser && password) {
      setUser(foundUser);
      localStorage.setItem('hospital_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hospital_user');
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