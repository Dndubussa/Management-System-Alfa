import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';

export function UserVerification() {
  const { user } = useAuth();
  const { users } = useHospital();

  // Get all unique roles from users
  const uniqueRoles = [...new Set(users.map(u => u.role))];
  
  // Group users by role
  const usersByRole = users.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {} as Record<string, typeof users>);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">User Verification Report</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Current Logged In User</h3>
        {user ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Department:</strong> {user.department}</p>
          </div>
        ) : (
          <p className="text-gray-500">No user currently logged in</p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">System Roles</h3>
        <div className="flex flex-wrap gap-2">
          {uniqueRoles.map(role => (
            <span key={role} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {role}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">All System Users</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(usersByRole).map(([role, roleUsers]) => (
            <div key={role} className="border border-gray-200 rounded-md p-4">
              <h4 className="font-medium text-gray-900 capitalize mb-2">{role} ({roleUsers.length})</h4>
              <ul className="space-y-2">
                {roleUsers.map((user) => (
                  <li key={user.id} className="text-sm text-gray-600 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.department}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}