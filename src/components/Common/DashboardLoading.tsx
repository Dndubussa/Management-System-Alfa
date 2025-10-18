import React from 'react';
import { Heart, Eye, TestTube, User, FileText, DollarSign, Shield, Activity, Stethoscope, Building, CreditCard, ClipboardList } from 'lucide-react';

interface DashboardLoadingProps {
  role?: string;
  department?: string;
  title?: string;
}

export function DashboardLoading({ role, department, title }: DashboardLoadingProps) {
  // Get appropriate icon and color based on role
  const getRoleIcon = () => {
    switch (role) {
      case 'doctor':
        return { icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50' };
      case 'ophthalmologist':
        return { icon: Eye, color: 'text-blue-500', bgColor: 'bg-blue-50' };
      case 'lab':
      case 'radiologist':
        return { icon: TestTube, color: 'text-purple-500', bgColor: 'bg-purple-50' };
      case 'receptionist':
        return { icon: User, color: 'text-green-500', bgColor: 'bg-green-50' };
      case 'nurse':
        return { icon: Stethoscope, color: 'text-pink-500', bgColor: 'bg-pink-50' };
      case 'admin':
        return { icon: Shield, color: 'text-gray-500', bgColor: 'bg-gray-50' };
      case 'cashier':
        return { icon: DollarSign, color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
      case 'insurance-officer':
        return { icon: CreditCard, color: 'text-indigo-500', bgColor: 'bg-indigo-50' };
      case 'physical-therapist':
        return { icon: Activity, color: 'text-orange-500', bgColor: 'bg-orange-50' };
      case 'ot-coordinator':
        return { icon: Building, color: 'text-teal-500', bgColor: 'bg-teal-50' };
      case 'hr':
        return { icon: FileText, color: 'text-cyan-500', bgColor: 'bg-cyan-50' };
      default:
        return { icon: ClipboardList, color: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  const { icon: Icon, color, bgColor } = getRoleIcon();

  return (
    <div className="space-y-6">
      {/* Header with loading state */}
      <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
        <div className="flex items-center space-x-4">
          <div className="animate-pulse">
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Loading spinner */}
      <div className="text-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-300 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={`w-6 h-6 ${color} animate-pulse`} />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <p className="text-lg font-medium text-gray-900">
            Loading {title || `${role || 'Dashboard'} Dashboard`}...
          </p>
          <p className="text-sm text-gray-600">
            Fetching your data and preparing the interface
          </p>
          {department && (
            <p className="text-xs text-gray-500">
              {department} Department
            </p>
          )}
        </div>
      </div>

      {/* Loading skeleton for stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading skeleton for content sections */}
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                    </div>
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading progress indicator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Loading dashboard components...
        </div>
      </div>
    </div>
  );
}
