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
              navigate('/'); // Receptionists go to the main dashboard route
              break;
            case 'doctor':
              navigate('/'); // Doctors go to the main dashboard route
              break;
            case 'ophthalmologist':
              navigate('/'); // Ophthalmologists go to the main dashboard route
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
              navigate('/'); // Default to main dashboard route
          }
        }
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Removed demo users and prefilled credentials

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

            {/* Demo credentials and prefill removed */}
          </div>
        </form>
      </div>
    </div>
  );
}