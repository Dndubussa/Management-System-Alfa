import { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, User, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { NotificationSound } from '../../utils/notificationSound';

export function Header() {
  const { user, logout } = useAuth();
  const { getUserNotifications, isNotificationRead, markNotificationRead } = useHospital();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(NotificationSound.getEnabled());
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Get notifications for the current user
  const userNotifications = user ? getUserNotifications(user.id, user.department) : [];
  const unreadCount = userNotifications.filter(n => !isNotificationRead(n, user?.id || '')).length;

  // Play notification sound when new notifications arrive
  useEffect(() => {
    if (unreadCount > previousNotificationCount && previousNotificationCount > 0) {
      // New notification arrived
      const newNotifications = userNotifications.filter(n => !isNotificationRead(n, user?.id || ''));
      const latestNotification = newNotifications[0];
      
      if (latestNotification && soundEnabled) {
        console.log('🔔 Playing notification sound for:', latestNotification.title);
        NotificationSound.playNotificationSound(latestNotification.type || 'default');
      }
    }
    setPreviousNotificationCount(unreadCount);
  }, [unreadCount, userNotifications, user?.id, soundEnabled, previousNotificationCount]);

  // Toggle notification sound
  const toggleNotificationSound = () => {
    const newEnabled = !soundEnabled;
    setSoundEnabled(newEnabled);
    NotificationSound.setEnabled(newEnabled);
  };

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

  const handleNotificationClick = async (notificationId: string) => {
    if (user) {
      try {
        await markNotificationRead(notificationId, user.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
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
            {/* Notifications - Always show bell, badge only when unread */}
            <div className="relative" ref={notificationRef}>
              <button 
                className="p-2 text-gray-400 hover:text-gray-500 transition-colors relative"
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : "No unread notifications"}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

                {/* Sound Toggle Button */}
                <button
                  className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                  title={soundEnabled ? "Disable notification sound" : "Enable notification sound"}
                  onClick={toggleNotificationSound}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
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
                        {userNotifications.length > 0 ? (
                          <>
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
                            {userNotifications.length > 5 && (
                              <div className="text-center py-2">
                                <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
                                  View all {userNotifications.length} notifications
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No notifications yet</p>
                            <p className="text-xs mt-1">You'll see notifications here when they arrive</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Sound Settings */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {soundEnabled ? (
                              <Volume2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <VolumeX className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-xs text-gray-600">
                              {soundEnabled ? 'Sound enabled' : 'Sound disabled'}
                            </span>
                          </div>
                          <button
                            onClick={() => NotificationSound.playSimpleBell()}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            disabled={!soundEnabled}
                          >
                            Test sound
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-sm">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  {/* Real-time status indicator */}
                  <div className="flex items-center space-x-1">
                    {isRealtimeConnected ? (
                      <Wifi className="w-3 h-3 text-green-500" title="Real-time updates active" />
                    ) : (
                      <WifiOff className="w-3 h-3 text-red-500" title="Real-time updates disconnected" />
                    )}
                  </div>
                </div>
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