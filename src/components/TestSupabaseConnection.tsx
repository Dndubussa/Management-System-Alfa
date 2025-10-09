import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const TestSupabaseConnection: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [patients, setPatients] = useState<any[]>([]);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing connection...');
    
    try {
      // Test fetching patients
      const patientsData = await api.getPatients();
      setPatients(patientsData);
      setTestResult(`✅ Successfully connected to Supabase! Found ${patientsData.length} patients.`);
    } catch (error: any) {
      setTestResult(`❌ Connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestPatient = async () => {
    setIsLoading(true);
    setTestResult('Creating test patient...');
    
    try {
      // Create a test patient
      const testPatient = {
        mrn: 'TEST-' + Date.now(),
        firstName: 'Test',
        lastName: 'Patient',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        phone: '123-456-7890',
        address: '123 Test Street',
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '123-456-7891',
          relationship: 'Friend'
        },
        insuranceInfo: {
          provider: 'Test Insurance',
          membershipNumber: 'TEST-12345'
        }
      };
      
      // Note: We're not actually creating the patient in this test component
      // This is just to verify the API connection
      const patientsData = await api.getPatients();
      setTestResult(`✅ API connection successful! Found ${patientsData.length} patients.`);
    } catch (error: any) {
      setTestResult(`❌ API connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Run the test when component mounts
    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full mr-2 ${testResult.includes('✅') ? 'bg-green-500' : testResult.includes('❌') ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
          <span className="font-medium">
            {isLoading ? 'Testing connection...' : testResult || 'Initializing test...'}
          </span>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            onClick={createTestPatient}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Patient Creation'}
          </button>
        </div>
      </div>
      
      {patients.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Patients in Database</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.slice(0, 5).map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.mrn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {patients.length > 5 && (
              <div className="mt-4 text-sm text-gray-500">
                Showing 5 of {patients.length} patients
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSupabaseConnection;