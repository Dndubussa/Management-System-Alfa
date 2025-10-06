import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Get the user from localStorage to determine their role
        const savedUser = localStorage.getItem('hospital_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          
          // Redirect to role-specific dashboard
          switch (user.role) {
            case 'receptionist':
              navigate('/dashboard');
              break;
            case 'doctor':
              navigate('/dashboard');
              break;
            case 'lab':
              navigate('/lab-orders');
              break;
            case 'pharmacy':
              navigate('/prescriptions');
              break;
            case 'radiologist':
              navigate('/lab-orders'); // Radiologists work with imaging tests in lab orders
              break;
            case 'admin':
              navigate('/admin');
              break;
            case 'ot-coordinator':
              navigate('/ot-dashboard');
              break;
            default:
              navigate('/dashboard');
          }
        }
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    { email: 'amina@alfaspecialized.co.tz', role: 'Receptionist (Mapokezi)' },
    { email: 'hassan@alfaspecialized.co.tz', role: 'Doctor (Daktari)' },
    { email: 'grace@alfaspecialized.co.tz', role: 'Lab Technician (Maabara)' },
    { email: 'mohamed@alfaspecialized.co.tz', role: 'Pharmacist (Famasi)' },
    { email: 'sarah@alfaspecialized.co.tz', role: 'Radiologist' },
    { email: 'sarah.k@alfaspecialized.co.tz', role: 'Ophthalmologist' },
    { email: 'admin@alfaspecialized.co.tz', role: 'System Administrator' },
    { email: 'ot-coordinator@alfaspecialized.co.tz', role: 'OT Coordinator' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img 
              src="https://i.postimg.cc/SnTLcyRY/hospital-logo.png" 
              alt="Alfa Specialized Hospital Logo" 
              className="h-16 w-16 rounded-lg object-contain"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Alfa Specialized Hospital
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hospital Management System
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Demo Login Credentials (Ufunguo wa Kuingia):</p>
                <div className="grid gap-2 text-xs">
                  {demoUsers.map((user, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setEmail(user.email);
                        setPassword('password123');
                      }}
                      className="text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                    >
                      {user.role}: {user.email}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Nywila (Password): password123</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}