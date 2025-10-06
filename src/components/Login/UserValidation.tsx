import { useEffect, useState } from 'react';
import { useHospital } from '../../context/HospitalContext';

interface DemoUser {
  email: string;
  role: string;
}

interface ValidationResult {
  email: string;
  role: string;
  exists: boolean;
  user?: any;
  issues: string[];
}

const demoUsers: DemoUser[] = [
  { email: 'amina@alfaspecialized.co.tz', role: 'Receptionist (Mapokezi)' },
  { email: 'hassan@alfaspecialized.co.tz', role: 'Doctor (Daktari)' },
  { email: 'grace@alfaspecialized.co.tz', role: 'Lab Technician (Maabara)' },
  { email: 'mohamed@alfaspecialized.co.tz', role: 'Pharmacist (Famasi)' },
  { email: 'sarah@alfaspecialized.co.tz', role: 'Radiologist' },
  { email: 'sarah.k@alfaspecialized.co.tz', role: 'Ophthalmologist' },
  { email: 'admin@alfaspecialized.co.tz', role: 'System Administrator' }
];

export function UserValidation() {
  const { users } = useHospital();
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  useEffect(() => {
    const results: ValidationResult[] = demoUsers.map(demoUser => {
      const user = users.find(u => u.email === demoUser.email);
      const issues: string[] = [];
      
      if (!user) {
        issues.push('User not found in system');
        return {
          ...demoUser,
          exists: false,
          issues
        };
      }
      
      // Check if role matches
      const demoRole = demoUser.role.toLowerCase().split(' ')[0]; // Get first word (receptionist, doctor, etc.)
      if (demoRole !== user.role && 
          !(demoRole === 'ophthalmologist' && user.role === 'ophthalmologist') &&
          !(demoRole === 'administrator' && user.role === 'admin')) {
        issues.push(`Role mismatch: demo shows ${demoRole}, system has ${user.role}`);
      }
      
      return {
        ...demoUser,
        exists: true,
        user,
        issues
      };
    });
    
    setValidationResults(results);
  }, [users]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">User Validation Report</h2>
      <p className="text-gray-600 mb-6">Verifying that all demo users in the login form exist in the system</p>
      
      <div className="space-y-4">
        {validationResults.map((result, index) => (
          <div 
            key={index} 
            className={`border rounded-md p-4 ${
              result.exists && result.issues.length === 0 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{result.role}</h3>
                <p className="text-sm text-gray-600">{result.email}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                result.exists && result.issues.length === 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.exists && result.issues.length === 0 ? 'Valid' : 'Invalid'}
              </span>
            </div>
            
            {result.user && (
              <div className="mt-2 text-sm text-gray-600">
                <p>System Role: {result.user.role}</p>
                <p>System Name: {result.user.name}</p>
                <p>System Department: {result.user.department}</p>
              </div>
            )}
            
            {result.issues.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-800">Issues:</p>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {result.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
        <div className="flex space-x-4">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            Valid: {validationResults.filter(r => r.exists && r.issues.length === 0).length}
          </div>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
            Invalid: {validationResults.filter(r => !r.exists || r.issues.length > 0).length}
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            Total: {validationResults.length}
          </div>
        </div>
      </div>
    </div>
  );
}