import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Database, Globe, Settings } from 'lucide-react';
import { useError } from '../../context/ErrorContext';
import { supabaseService } from '../../services/supabaseService';
import { api } from '../../services/api';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
  duration?: number;
}

export function DataLoadingDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { addError } = useError();

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    const results: DiagnosticResult[] = [];

    // 1. Check environment variables
    const startTime = Date.now();
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
      const isProduction = import.meta.env.PROD;
      const hasSupabaseUrl = !!supabaseUrl;
      const forceSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      const useSupabase = isProduction || forceSupabase || hasSupabaseUrl;

      results.push({
        name: 'Environment Variables',
        status: 'success',
        message: `Supabase URL: ${supabaseUrl ? 'Set' : 'Missing'}, Key: ${supabaseKey ? 'Set' : 'Missing'}`,
        details: `Production: ${isProduction}, Force Supabase: ${forceSupabase}, Use Supabase: ${useSupabase}`,
        duration: Date.now() - startTime
      });
    } catch (error) {
      results.push({
        name: 'Environment Variables',
        status: 'error',
        message: 'Failed to check environment variables',
        details: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      });
    }

    // 2. Test Supabase connection
    const supabaseStartTime = Date.now();
    try {
      const { data, error } = await supabaseService.getSupabaseClient()
        .from('patients')
        .select('count')
        .limit(1);

      if (error) {
        results.push({
          name: 'Supabase Connection',
          status: 'error',
          message: 'Supabase connection failed',
          details: error.message,
          duration: Date.now() - supabaseStartTime
        });
      } else {
        results.push({
          name: 'Supabase Connection',
          status: 'success',
          message: 'Supabase connection successful',
          details: 'Able to query patients table',
          duration: Date.now() - supabaseStartTime
        });
      }
    } catch (error) {
      results.push({
        name: 'Supabase Connection',
        status: 'error',
        message: 'Supabase connection error',
        details: error instanceof Error ? error.message : String(error),
        duration: Date.now() - supabaseStartTime
      });
    }

    // 3. Test patients endpoint
    const patientsStartTime = Date.now();
    try {
      const patients = await supabaseService.getPatients();
      results.push({
        name: 'Patients Data Loading',
        status: 'success',
        message: `Successfully loaded ${patients.length} patients`,
        details: patients.length > 0 ? `First patient: ${patients[0].firstName} ${patients[0].lastName}` : 'No patients found',
        duration: Date.now() - patientsStartTime
      });
    } catch (error) {
      results.push({
        name: 'Patients Data Loading',
        status: 'error',
        message: 'Failed to load patients',
        details: error instanceof Error ? error.message : String(error),
        duration: Date.now() - patientsStartTime
      });

      // Add error to error context
      addError({
        type: 'error',
        title: 'Patients Data Loading Failed',
        message: 'Failed to load patients data',
        details: error instanceof Error ? error.message : String(error),
        component: 'DataLoadingDiagnostics',
        action: 'runDiagnostics',
        userAction: 'User ran data loading diagnostics',
        metadata: { error: error }
      });
    }

    // 4. Test service prices endpoint
    const servicePricesStartTime = Date.now();
    try {
      const servicePrices = await supabaseService.getServicePrices();
      results.push({
        name: 'Service Prices Loading',
        status: 'success',
        message: `Successfully loaded ${servicePrices.length} service prices`,
        details: servicePrices.length > 0 ? `First service: ${servicePrices[0].serviceName}` : 'No service prices found',
        duration: Date.now() - servicePricesStartTime
      });
    } catch (error) {
      results.push({
        name: 'Service Prices Loading',
        status: 'error',
        message: 'Failed to load service prices',
        details: error instanceof Error ? error.message : String(error),
        duration: Date.now() - servicePricesStartTime
      });
    }

    // 5. Test users endpoint
    const usersStartTime = Date.now();
    try {
      const users = await supabaseService.getUsers();
      results.push({
        name: 'Users Data Loading',
        status: 'success',
        message: `Successfully loaded ${users.length} users`,
        details: users.length > 0 ? `First user: ${users[0].name} (${users[0].role})` : 'No users found',
        duration: Date.now() - usersStartTime
      });
    } catch (error) {
      results.push({
        name: 'Users Data Loading',
        status: 'error',
        message: 'Failed to load users',
        details: error instanceof Error ? error.message : String(error),
        duration: Date.now() - usersStartTime
      });
    }

    // 6. Test database tables existence
    const tablesStartTime = Date.now();
    try {
      const tables = ['patients', 'service_prices', 'users', 'medical_records', 'notifications'];
      const tableResults = [];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabaseService.getSupabaseClient()
            .from(table)
            .select('count')
            .limit(1);
          
          if (error) {
            tableResults.push(`${table}: Error - ${error.message}`);
          } else {
            tableResults.push(`${table}: OK`);
          }
        } catch (err) {
          tableResults.push(`${table}: Error - ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      results.push({
        name: 'Database Tables Check',
        status: 'success',
        message: 'Database tables accessibility checked',
        details: tableResults.join(', '),
        duration: Date.now() - tablesStartTime
      });
    } catch (error) {
      results.push({
        name: 'Database Tables Check',
        status: 'error',
        message: 'Failed to check database tables',
        details: error instanceof Error ? error.message : String(error),
        duration: Date.now() - tablesStartTime
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'bg-blue-50 border-blue-200';
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Data Loading Diagnostics</h2>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running...' : 'Run Diagnostics'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {diagnostics.map((diagnostic, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getStatusColor(diagnostic.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getStatusIcon(diagnostic.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{diagnostic.name}</h3>
                  <p className="text-sm text-gray-700 mt-1">{diagnostic.message}</p>
                  {diagnostic.details && (
                    <p className="text-xs text-gray-600 mt-2">{diagnostic.details}</p>
                  )}
                </div>
              </div>
              {diagnostic.duration && (
                <span className="text-xs text-gray-500 ml-2">
                  {diagnostic.duration}ms
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Environment Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Environment:</span> {import.meta.env.MODE}
          </div>
          <div>
            <span className="font-medium">Production:</span> {import.meta.env.PROD ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Supabase URL:</span> {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}
          </div>
          <div>
            <span className="font-medium">Supabase Key:</span> {import.meta.env.VITE_SUPABASE_KEY ? 'Set' : 'Missing'}
          </div>
        </div>
      </div>
    </div>
  );
}
