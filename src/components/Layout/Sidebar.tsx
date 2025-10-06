import { useState } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  TestTube, 
  Pill, 
  Activity,
  BarChart3,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Eye,
  Camera,
  Shield,
  Scissors,
  Clock,
  CheckSquare,
  FileBarChart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ onTabChange }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    // Also call onTabChange for any additional logic in the parent component
    onTabChange(path);
  };

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/' },
    ];

    switch (user?.role) {
      case 'receptionist':
        return [
          ...baseItems,
          { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
          { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
          // Remove queue management
          { id: 'receptionist', label: 'Insurance Claims', icon: FileText, path: '/receptionist' },
          { id: 'billing', label: 'Billing', icon: CreditCard, path: '/billing' },
        ];
      
      case 'doctor':
        return [
          ...baseItems,
          { id: 'patients', label: 'My Patients', icon: Users, path: '/patients' },
          { id: 'doctor-appointments', label: 'Today\'s Appointments', icon: Calendar, path: '/doctor-appointments' },
          { id: 'appointments', label: 'All Appointments', icon: Calendar, path: '/appointments' },
          // Remove patient queue
          { id: 'emr', label: 'Medical Records', icon: FileText, path: '/emr' },
          { id: 'clinical-orders', label: 'Clinical Orders', icon: TestTube, path: '/lab-orders' },
          { id: 'prescriptions', label: 'Prescriptions', icon: Pill, path: '/prescriptions' },
          { id: 'referrals', label: 'Referrals', icon: Users, path: '/referrals' },
          { id: 'chronic-disease', label: 'Chronic Disease Mgmt', icon: Activity, path: '/chronic-disease' },
          { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
          { id: 'billing', label: 'Patient Bills', icon: CreditCard, path: '/billing' },
        ];
      
      case 'ophthalmologist':
        return [
          ...baseItems,
          { id: 'patients', label: 'My Patients', icon: Users, path: '/patients' },
          { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
          // Remove patient queue
          { id: 'emr', label: 'Ophthalmology EMR', icon: Eye, path: '/emr' },
          { id: 'imaging', label: 'Ophthalmology Imaging', icon: Camera, path: '/imaging' },
          { id: 'clinical-orders', label: 'Clinical Orders', icon: TestTube, path: '/lab-orders' },
          { id: 'prescriptions', label: 'Prescriptions', icon: Pill, path: '/prescriptions' },
          { id: 'referrals', label: 'Referrals', icon: Users, path: '/referrals' },
          { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
          { id: 'billing', label: 'Patient Bills', icon: CreditCard, path: '/billing' },
        ];
      
      case 'lab':
        return [
          ...baseItems,
          { id: 'lab-orders', label: 'Lab Orders', icon: TestTube, path: '/lab-orders' },
          { id: 'results', label: 'Test Results', icon: Activity, path: '/results' },
        ];
      
      case 'radiologist':
        return [
          ...baseItems,
          { id: 'radiology-orders', label: 'Radiology Orders', icon: Activity, path: '/lab-orders' },
          { id: 'radiology-results', label: 'Radiology Results', icon: Activity, path: '/results' },
        ];
      
      case 'pharmacy':
        return [
          ...baseItems,
          { id: 'prescriptions', label: 'Prescriptions', icon: Pill, path: '/prescriptions' },
          { id: 'inventory', label: 'Inventory', icon: Settings, path: '/inventory' },
          { id: 'billing', label: 'Medication Bills', icon: CreditCard, path: '/billing' },
        ];
      
      case 'ot-coordinator':
        return [
          ...baseItems,
          { id: 'ot-schedule', label: 'OT Schedule', icon: Calendar, path: '/ot-schedule' },
          { id: 'surgery-requests', label: 'Surgery Requests', icon: Scissors, path: '/surgery-requests' },
          { id: 'patient-queue', label: 'Patient Queue', icon: Users, path: '/ot-patient-queue' },
          { id: 'resources', label: 'Resources & Availability', icon: Settings, path: '/ot-resources' },
          { id: 'checklists', label: 'OT Checklists', icon: CheckSquare, path: '/ot-checklists' },
          { id: 'ot-reports', label: 'Reports / Logs', icon: FileBarChart, path: '/ot-reports' },
        ];
      
      case 'admin':
        return [
          ...baseItems,
          { id: 'admin', label: 'Admin Dashboard', icon: Shield, path: '/admin' },
          { id: 'patients', label: 'All Patients', icon: Users, path: '/patients' },
          { id: 'appointments', label: 'All Appointments', icon: Calendar, path: '/appointments' },
          { id: 'emr', label: 'All Medical Records', icon: FileText, path: '/emr' },
          { id: 'prescriptions', label: 'All Prescriptions', icon: Pill, path: '/prescriptions' },
          { id: 'lab-orders', label: 'All Lab Orders', icon: TestTube, path: '/lab-orders' },
          { id: 'billing', label: 'All Bills', icon: CreditCard, path: '/billing' },
          { id: 'reports', label: 'System Reports', icon: BarChart3, path: '/reports' },
        ];
      
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();
  const activePath = location.pathname;

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300`}>
      {/* Pure navigation - no branding elements */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex justify-center">
          <h2 className="text-sm font-semibold text-gray-500">
            {isCollapsed ? 'Menu' : 'Navigation'}
          </h2>
        </div>
        {/* Collapse/Expand Button - Moved to the top */}
        <button
          onClick={toggleSidebar}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors rounded"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 mt-2 px-3 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.path || (activePath === '/' && item.path === '/');
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {!isCollapsed && item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
