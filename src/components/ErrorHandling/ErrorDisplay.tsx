import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle, Info, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react';
import { useError, ErrorInfo } from '../../context/ErrorContext';

interface ErrorDisplayProps {
  showResolved?: boolean;
  maxDisplay?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

export function ErrorDisplay({ 
  showResolved = false, 
  maxDisplay = 5,
  position = 'top-right'
}: ErrorDisplayProps) {
  const { errors, removeError, markAsResolved, getUnresolvedErrors } = useError();
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set());

  const displayErrors = showResolved ? errors : getUnresolvedErrors();
  const visibleErrors = displayErrors.slice(0, maxDisplay);

  const getIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const toggleExpanded = (errorId: string) => {
    setExpandedErrors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const toggleDetails = (errorId: string) => {
    setShowDetails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(timestamp);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  if (visibleErrors.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-2 max-w-md`}>
      {visibleErrors.map((error) => (
        <div
          key={error.id}
          className={`border rounded-lg shadow-lg p-4 ${getBgColor(error.type)} transition-all duration-300`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {getIcon(error.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold ${getTextColor(error.type)}`}>
                    {error.title}
                  </h4>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimestamp(error.timestamp)}
                  </span>
                </div>
                
                <p className={`text-sm mt-1 ${getTextColor(error.type)}`}>
                  {error.message}
                </p>

                {error.component && (
                  <p className="text-xs text-gray-600 mt-1">
                    Component: {error.component}
                  </p>
                )}

                {error.action && (
                  <p className="text-xs text-gray-600">
                    Action: {error.action}
                  </p>
                )}

                {error.userAction && (
                  <p className="text-xs text-gray-600">
                    User Action: {error.userAction}
                  </p>
                )}

                {/* Expandable Details */}
                {(error.details || error.metadata) && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleDetails(error.id)}
                      className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      {showDetails.has(error.id) ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      <span>{showDetails.has(error.id) ? 'Hide' : 'Show'} Details</span>
                    </button>

                    {showDetails.has(error.id) && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                        {error.details && (
                          <div className="mb-2">
                            <strong>Details:</strong>
                            <pre className="whitespace-pre-wrap text-gray-700 mt-1">
                              {error.details}
                            </pre>
                          </div>
                        )}
                        
                        {error.metadata && Object.keys(error.metadata).length > 0 && (
                          <div>
                            <strong>Metadata:</strong>
                            <pre className="whitespace-pre-wrap text-gray-700 mt-1">
                              {JSON.stringify(error.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-3">
                  {!error.resolved && (
                    <button
                      onClick={() => markAsResolved(error.id)}
                      className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Mark Resolved</span>
                    </button>
                  )}

                  {(error.details || error.metadata) && (
                    <button
                      onClick={() => copyToClipboard(JSON.stringify({
                        title: error.title,
                        message: error.message,
                        details: error.details,
                        metadata: error.metadata,
                        timestamp: error.timestamp
                      }, null, 2))}
                      className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => removeError(error.id)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {displayErrors.length > maxDisplay && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Showing {maxDisplay} of {displayErrors.length} errors
          </p>
        </div>
      )}
    </div>
  );
}

// Error Summary Component
export function ErrorSummary() {
  const { getUnresolvedErrors, getErrorsByType } = useError();
  
  const unresolvedErrors = getUnresolvedErrors();
  const errors = getErrorsByType('error');
  const warnings = getErrorsByType('warning');
  const infos = getErrorsByType('info');

  if (unresolvedErrors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">System Status</h3>
      
      <div className="space-y-2">
        {errors.length > 0 && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{errors.length} Error{errors.length !== 1 ? 's' : ''}</span>
          </div>
        )}
        
        {warnings.length > 0 && (
          <div className="flex items-center space-x-2 text-yellow-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{warnings.length} Warning{warnings.length !== 1 ? 's' : ''}</span>
          </div>
        )}
        
        {infos.length > 0 && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Info className="w-4 h-4" />
            <span className="text-sm">{infos.length} Info{infos.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
