import { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';

export function Header() {
  const { user, logout } = useAuth();
  const { getUserNotifications, isNotificationRead, markNotificationRead } = useHospital();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Get notifications for the current user
  const userNotifications = user ? getUserNotifications(user.id, user.department) : [];
  const unreadCount = userNotifications.filter(n => !isNotificationRead(n, user?.id || '')).length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor':
      case 'ophthalmologist':
        return 'text-blue-600';
      case 'receptionist':
        return 'text-green-600';
      case 'lab':
      case 'radiologist':
        return 'text-purple-600';
      case 'pharmacy':
        return 'text-orange-600';
      case 'admin':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    if (user) {
      markNotificationRead(notificationId, user.id);
    }
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Top Left - Hospital Logo and Name */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="https://i.postimg.cc/SnTLcyRY/hospital-logo.png" 
                alt="Alfa Specialized Hospital Logo" 
                className="w-10 h-10 rounded-lg object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Alfa Specialized Hospital</h1>
                <p className="text-sm text-gray-500">Dar es Salaam, Tanzania</p>
              </div>
            </div>
          </div>

          {/* Top Right - Notifications, User Profile, and Logout */}
          <div className="flex items-center space-x-6">
            {/* Notifications - Only show when there are notifications */}
            {userNotifications.length > 0 && (
              <div className="relative" ref={notificationRef}>
                <button 
                  className="p-2 text-gray-400 hover:text-gray-500 transition-colors relative"
                  title={`${unreadCount} unread notifications`}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                        <span className="text-xs text-gray-500">{unreadCount} unread</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {userNotifications.slice(0, 5).map(notification => (
                          <div 
                            key={notification.id} 
                            className={`mb-2 p-3 rounded text-sm cursor-pointer hover:bg-gray-50 ${
                              isNotificationRead(notification, user?.id || '') ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'
                            }`}
                            onClick={() => handleNotificationClick(notification.id)}
                          >
                            <div className="font-medium text-gray-900">{notification.title}</div>
                            <div className="text-gray-600 mt-1">{notification.message}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className={`text-xs font-medium capitalize ${getRoleColor(user?.role || '')}`}>
                  {user?.role} • {user?.department}
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}