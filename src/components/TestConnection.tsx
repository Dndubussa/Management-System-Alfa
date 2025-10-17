import React, { useState, useEffect } from 'react';
import { supabase, supabaseService } from '../lib/supabase';

const TestConnection: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    console.log('🔍 Testing Supabase Connection...\n');

    // Test 1: Environment Variables
    addResult('Environment Variables', 'success', 'Checking environment variables...');
    const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasAnonKey = !!import.meta.env.VITE_SUPABASE_KEY;
    const hasServiceKey = !!import.meta.env.VITE_SUPABASE_SERVICE_KEY;
    
    addResult('VITE_SUPABASE_URL', hasUrl ? 'success' : 'error', hasUrl ? 'Set' : 'Missing');
    addResult('VITE_SUPABASE_KEY', hasAnonKey ? 'success' : 'error', hasAnonKey ? 'Set' : 'Missing');
    addResult('VITE_SUPABASE_SERVICE_KEY', hasServiceKey ? 'success' : 'error', hasServiceKey ? 'Set' : 'Missing');

    // Test 2: Anon Client Connection
    addResult('Anon Client', 'success', 'Testing anon client connection...');
    try {
      const { data, error } = await supabase.from('patients').select('count').limit(1);
      if (error) {
        addResult('Anon Client Query', 'warning', `Query error: ${error.message}`);
      } else {
        addResult('Anon Client Query', 'success', 'Can query patients table');
      }
    } catch (err: any) {
      addResult('Anon Client', 'error', `Error: ${err.message}`);
    }

    // Test 3: Service Role Client Connection
    addResult('Service Role Client', 'success', 'Testing service role client connection...');
    try {
      const { data, error } = await supabaseService.from('patients').select('count').limit(1);
      if (error) {
        addResult('Service Role Query', 'error', `Query error: ${error.message}`);
      } else {
        addResult('Service Role Query', 'success', 'Can query patients table');
      }
    } catch (err: any) {
      addResult('Service Role Client', 'error', `Error: ${err.message}`);
    }

    // Test 4: Database Schema Check
    addResult('Schema Check', 'success', 'Checking if cash_amount field exists...');
    try {
      const { data: columns, error } = await supabaseService
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'patients')
        .eq('column_name', 'cash_amount');
      
      if (error) {
        addResult('Schema Check', 'error', `Error: ${error.message}`);
      } else if (columns && columns.length > 0) {
        addResult('Schema Check', 'success', 'cash_amount field exists');
      } else {
        addResult('Schema Check', 'warning', 'cash_amount field missing - run add-cash-amount-field.sql');
      }
    } catch (err: any) {
      addResult('Schema Check', 'error', `Error: ${err.message}`);
    }

    // Test 5: RLS Policies Check
    addResult('RLS Policies', 'success', 'Checking RLS policies...');
    try {
      const { data: policies, error } = await supabaseService
        .from('pg_policies')
        .select('policyname, cmd')
        .eq('tablename', 'patients');
      
      if (error) {
        addResult('RLS Policies', 'error', `Error: ${error.message}`);
      } else if (policies && policies.length >= 4) {
        addResult('RLS Policies', 'success', `${policies.length} policies configured`);
      } else {
        addResult('RLS Policies', 'warning', 'RLS policies may be missing');
      }
    } catch (err: any) {
      addResult('RLS Policies', 'error', `Error: ${err.message}`);
    }

    // Test 6: Patient Count
    addResult('Patient Count', 'success', 'Getting patient count...');
    try {
      const { data, error } = await supabaseService
        .from('patients')
        .select('id', { count: 'exact' });
      
      if (error) {
        addResult('Patient Count', 'error', `Error: ${error.message}`);
      } else {
        addResult('Patient Count', 'success', `${data?.length || 0} patients in database`);
      }
    } catch (err: any) {
      addResult('Patient Count', 'error', `Error: ${err.message}`);
    }

    setIsRunning(false);
    console.log('🎯 Connection Test Complete!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 Supabase Connection Test</h1>
        
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-medium ${
              isRunning
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? 'Running Tests...' : 'Run Connection Tests'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Test Results:</h2>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">{getStatusIcon(result.status)}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{result.test}</span>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className={`text-sm ${getStatusColor(result.status)}`}>
                    {result.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {testResults.length > 0 && !isRunning && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Next Steps:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• If any tests failed, check your environment variables</li>
              <li>• Run the SQL scripts for any missing schema/policies</li>
              <li>• Test patient update functionality in the application</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestConnection;
