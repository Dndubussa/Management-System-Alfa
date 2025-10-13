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

export function UserValidation() {
  const { users } = useHospital();
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  useEffect(() => {
    // Validate all users in the system
    const results: ValidationResult[] = users.map(user => {
      const issues: string[] = [];
      
      // Check if user has required fields
      if (!user.name || user.name.trim() === '') {
        issues.push('User name is missing or empty');
      }
      
      if (!user.email || user.email.trim() === '') {
        issues.push('User email is missing or empty');
      }
      
      if (!user.role || user.role.trim() === '') {
        issues.push('User role is missing or empty');
      }
      
      if (!user.department || user.department.trim() === '') {
        issues.push('User department is missing or empty');
      }
      
      // Check for valid email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (user.email && !emailRegex.test(user.email)) {
        issues.push('Invalid email format');
      }
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
      <p className="text-gray-600 mb-6">Validating all users in the system for data integrity and completeness</p>
      
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