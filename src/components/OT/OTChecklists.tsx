import { useState } from 'react';
import { Search, Filter, Plus, CheckSquare, Square, Printer, Download } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export function OTChecklists() {
  const { otChecklists, surgeryRequests, patients, users } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);

  // Filter checklists
  const filteredChecklists = otChecklists.filter(checklist => {
    const surgeryRequest = surgeryRequests.find(req => req.id === checklist.surgeryRequestId);
    const patient = surgeryRequest ? patients.find(p => p.id === surgeryRequest.patientId) : null;
    
    const matchesSearch = 
      (surgeryRequest?.surgeryType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = statusFilter === 'all' || checklist.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewChecklist = (checklist: any) => {
    setSelectedChecklist(checklist);
  };

  const handleToggleItem = (itemIndex: number) => {
    if (!selectedChecklist) return;
    
    const updatedChecklist = {
      ...selectedChecklist,
      items: selectedChecklist.items.map((item: any, index: number) => 
        index === itemIndex 
          ? { 
              ...item, 
              checked: !item.checked,
              checkedBy: !item.checked ? user?.id : item.checkedBy,
              checkedAt: !item.checked ? new Date().toISOString() : item.checkedAt
            }
          : item
      ),
      status: selectedChecklist.items.every((item: any, index: number) => 
        index === itemIndex ? !item.checked : item.checked
      ) ? 'completed' : selectedChecklist.items.some((item: any) => item.checked) ? 'in-progress' : 'pending'
    };
    
    setSelectedChecklist(updatedChecklist);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">OT Checklists</h1>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Checklist
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search checklists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Checklists Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surgery Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChecklists.length > 0 ? (
                filteredChecklists.map(checklist => {
                  const surgeryRequest = surgeryRequests.find(req => req.id === checklist.surgeryRequestId);
                  const patient = surgeryRequest ? patients.find(p => p.id === surgeryRequest.patientId) : null;
                  
                  // Calculate progress
                  const totalItems = checklist.items.length;
                  const completedItems = checklist.items.filter((item: any) => item.checked).length;
                  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                  
                  return (
                    <tr key={checklist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {surgeryRequest?.surgeryType || 'Unknown Surgery'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(checklist.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {completedItems}/{totalItems}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(checklist.status)}`}>
                          {checklist.status.charAt(0).toUpperCase() + checklist.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewChecklist(checklist)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No checklists found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checklist Detail Modal */}
      {selectedChecklist && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">OT Checklist</h3>
                <button
                  onClick={() => setSelectedChecklist(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Patient and Surgery Info */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Patient</p>
                      <p className="font-medium">
                        {(() => {
                          const surgeryRequest = surgeryRequests.find(req => req.id === selectedChecklist.surgeryRequestId);
                          const patient = surgeryRequest ? patients.find(p => p.id === surgeryRequest.patientId) : null;
                          return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Surgery Type</p>
                      <p className="font-medium">
                        {(() => {
                          const surgeryRequest = surgeryRequests.find(req => req.id === selectedChecklist.surgeryRequestId);
                          return surgeryRequest?.surgeryType || 'Unknown Surgery';
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedChecklist.status)}`}>
                        {selectedChecklist.status.charAt(0).toUpperCase() + selectedChecklist.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Checklist Items */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Checklist Items</h4>
                  <div className="space-y-3">
                    {selectedChecklist.items.map((item: any, index: number) => (
                      <div 
                        key={index} 
                        className={`flex items-start p-3 rounded-md border ${
                          item.checked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleItem(index)}
                          className="mt-0.5 mr-3"
                        >
                          {item.checked ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.description}
                          </p>
                          {item.checked && item.checkedBy && (
                            <p className="text-xs text-gray-500 mt-1">
                              Checked by {users.find(u => u.id === item.checkedBy)?.name || 'Unknown User'} at{' '}
                              {new Date(item.checkedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Progress Summary */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Checklist Progress</p>
                      <p className="font-medium">
                        {(() => {
                          const totalItems = selectedChecklist.items.length;
                          const completedItems = selectedChecklist.items.filter((item: any) => item.checked).length;
                          return `${completedItems} of ${totalItems} items completed`;
                        })()}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedChecklist(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Close
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}