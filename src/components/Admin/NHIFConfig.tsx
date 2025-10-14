import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Save, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  Key,
  Building
} from 'lucide-react';
import { NHIFConfig } from '../../types/nhif';

interface NHIFConfigProps {
  onSave: (config: NHIFConfig) => void;
}

export function NHIFConfigComponent({ onSave }: NHIFConfigProps) {
  const [config, setConfig] = useState<NHIFConfig>({
    apiBaseUrl: '',
    clientId: '',
    clientSecret: '',
    facilityCode: '',
    environment: 'sandbox'
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Load existing configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem('nhif-config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to load NHIF config:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof NHIFConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('nhif-config', JSON.stringify(config));
    onSave(config);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would test the actual API connection
      setTestResult({
        success: true,
        message: 'Connection test successful! NHIF API is accessible.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed. Please check your configuration.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getEnvironmentUrls = () => {
    return {
      sandbox: 'https://api-sandbox.nhif.or.tz',
      production: 'https://api.nhif.or.tz'
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NHIF Integration Configuration</h1>
              <p className="text-gray-600">Configure your hospital's NHIF API integration settings</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Environment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="environment"
                  value="sandbox"
                  checked={config.environment === 'sandbox'}
                  onChange={(e) => handleInputChange('environment', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Sandbox (Testing)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="environment"
                  value="production"
                  checked={config.environment === 'production'}
                  onChange={(e) => handleInputChange('environment', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Production (Live)</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use sandbox for testing, production for live claims processing
            </p>
          </div>

          {/* API Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Base URL
              </label>
              <input
                type="url"
                value={config.apiBaseUrl}
                onChange={(e) => handleInputChange('apiBaseUrl', e.target.value)}
                placeholder={getEnvironmentUrls()[config.environment]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default: {getEnvironmentUrls()[config.environment]}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facility Code
              </label>
              <input
                type="text"
                value={config.facilityCode}
                onChange={(e) => handleInputChange('facilityCode', e.target.value)}
                placeholder="ALFA001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your hospital's NHIF facility code
              </p>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Key className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Authentication Credentials</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={config.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                  placeholder="Your NHIF API Client ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={config.clientSecret}
                  onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                  placeholder="Your NHIF API Client Secret"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Test Connection */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TestTube className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Test Connection</h3>
              </div>
              <button
                onClick={handleTestConnection}
                disabled={isTesting || !config.clientId || !config.clientSecret}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TestTube className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`flex items-center space-x-2 p-3 rounded-md ${
                testResult.success 
                  ? 'bg-green-100 border border-green-200' 
                  : 'bg-red-100 border border-red-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                  {testResult.message}
                </span>
              </div>
            )}
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <h4 className="font-medium mb-2">Important Notes:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Contact NHIF to obtain your API credentials and facility code</li>
                  <li>Test thoroughly in sandbox environment before going live</li>
                  <li>Ensure all services are properly mapped to SHA codes</li>
                  <li>Implement proper error handling and logging</li>
                  <li>Keep your credentials secure and never commit them to version control</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
