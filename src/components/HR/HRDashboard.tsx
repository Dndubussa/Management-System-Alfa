import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Calendar, 
  GraduationCap, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface HRStats {
  totalStaff: number;
  activeStaff: number;
  onLeave: number;
  pendingRecruitment: number;
  expiringLicenses: number;
  pendingLeaveRequests: number;
  upcomingTraining: number;
  pendingAppraisals: number;
}

const HRDashboard: React.FC = () => {
  const [stats, setStats] = useState<HRStats>({
    totalStaff: 0,
    activeStaff: 0,
    onLeave: 0,
    pendingRecruitment: 0,
    expiringLicenses: 0,
    pendingLeaveRequests: 0,
    upcomingTraining: 0,
    pendingAppraisals: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Simulate data loading - replace with actual API calls
    setStats({
      totalStaff: 156,
      activeStaff: 142,
      onLeave: 8,
      pendingRecruitment: 12,
      expiringLicenses: 5,
      pendingLeaveRequests: 23,
      upcomingTraining: 7,
      pendingAppraisals: 18
    });

    setRecentActivities([
      {
        id: 1,
        type: 'new_staff',
        message: 'Dr. Sarah Johnson joined as Cardiologist',
        timestamp: '2 hours ago',
        icon: UserPlus
      },
      {
        id: 2,
        type: 'leave_approved',
        message: 'Annual leave approved for Nurse Mary',
        timestamp: '4 hours ago',
        icon: CheckCircle
      },
      {
        id: 3,
        type: 'license_expiring',
        message: 'Dr. Ahmed license expires in 15 days',
        timestamp: '6 hours ago',
        icon: AlertTriangle
      },
      {
        id: 4,
        type: 'training_completed',
        message: 'CPR Training completed by 12 staff',
        timestamp: '1 day ago',
        icon: GraduationCap
      }
    ]);

    setAlerts([
      {
        id: 1,
        type: 'urgent',
        message: '3 staff licenses expire within 7 days',
        count: 3
      },
      {
        id: 2,
        type: 'warning',
        message: '15 leave requests pending approval',
        count: 15
      },
      {
        id: 3,
        type: 'info',
        message: 'Performance appraisals due for 8 staff',
        count: 8
      }
    ]);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  const ActivityItem = ({ activity }: any) => {
    const Icon = activity.icon;
    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">{activity.message}</p>
          <p className="text-xs text-gray-500">{activity.timestamp}</p>
        </div>
      </div>
    );
  };

  const AlertItem = ({ alert }: any) => (
    <div className={`p-4 rounded-lg border-l-4 ${
      alert.type === 'urgent' ? 'bg-red-50 border-red-400' :
      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
      'bg-blue-50 border-blue-400'
    }`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          alert.type === 'urgent' ? 'bg-red-100 text-red-800' :
          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {alert.count}
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Human Resources Dashboard</h1>
            <p className="text-blue-100">Manage staff lifecycle and HR operations</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Last updated</p>
            <p className="text-lg font-semibold">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Staff"
          value={stats.totalStaff}
          icon={Users}
          color="text-blue-600"
          change={5.2}
        />
        <StatCard
          title="Active Staff"
          value={stats.activeStaff}
          icon={CheckCircle}
          color="text-green-600"
          change={2.1}
        />
        <StatCard
          title="On Leave"
          value={stats.onLeave}
          icon={Clock}
          color="text-yellow-600"
          change={-1.3}
        />
        <StatCard
          title="Pending Recruitment"
          value={stats.pendingRecruitment}
          icon={UserPlus}
          color="text-purple-600"
          change={8.7}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Expiring Licenses"
          value={stats.expiringLicenses}
          icon={AlertTriangle}
          color="text-red-600"
        />
        <StatCard
          title="Pending Leave Requests"
          value={stats.pendingLeaveRequests}
          icon={FileText}
          color="text-orange-600"
        />
        <StatCard
          title="Upcoming Training"
          value={stats.upcomingTraining}
          icon={GraduationCap}
          color="text-indigo-600"
        />
        <StatCard
          title="Pending Appraisals"
          value={stats.pendingAppraisals}
          icon={TrendingUp}
          color="text-pink-600"
        />
      </div>

      {/* Alerts and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            HR Alerts
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            Recent Activities
          </h2>
          <div className="space-y-1">
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <UserPlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Add New Staff</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Post Job Opening</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <GraduationCap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Schedule Training</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Performance Review</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
