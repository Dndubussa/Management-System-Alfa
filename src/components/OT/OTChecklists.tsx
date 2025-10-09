import { useState } from 'react';
import { Search, Filter, Plus, CheckSquare, Square, Printer, Download, X } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export function OTChecklists() {
  const { otChecklists, surgeryRequests, patients, users, updateOTChecklist, addOTChecklist } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [showNewChecklistModal, setShowNewChecklistModal] = useState(false);
  const [newChecklistData, setNewChecklistData] = useState({
    surgeryRequestId: '',
    items: [
      { category: 'Pre-operative', description: 'Patient identity verified', checked: false },
      { category: 'Pre-operative', description: 'Consent form signed', checked: false },
      { category: 'Pre-operative', description: 'Pre-operative checklist completed', checked: false },
      { category: 'Surgical Team', description: 'Surgeon present', checked: false },
      { category: 'Surgical Team', description: 'Anesthesiologist present', checked: false },
      { category: 'Surgical Team', description: 'Nursing staff present', checked: false },
      { category: 'Equipment', description: 'Surgical instruments sterilized', checked: false },
      { category: 'Equipment', description: 'Anesthesia machine checked', checked: false },
      { category: 'Equipment', description: 'Monitoring equipment functional', checked: false },
      { category: 'Post-operative', description: 'Patient stable for transfer', checked: false },
      { category: 'Post-operative', description: 'Specimens labeled and sent to lab', checked: false },
      { category: 'Post-operative', description: 'Post-operative instructions given', checked: false }
    ]
  });

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

  const handleSaveChecklist = () => {
    if (selectedChecklist) {
      // Update the checklist in the context
      updateOTChecklist(selectedChecklist.id, {
        items: selectedChecklist.items,
        status: selectedChecklist.status,
        updatedAt: new Date().toISOString()
      });
      
      // Close the modal after saving
      setSelectedChecklist(null);
    }
  };

  const handlePrintChecklist = (checklist: any = null) => {
    console.log('handlePrintChecklist called with:', { checklist, selectedChecklist, user });
    
    const printData = checklist || selectedChecklist;
    if (!printData) {
      console.error('No checklist data to print');
      alert('Please select a checklist to print');
      return;
    }
    
    // Log the data we're working with
    console.log('Print data:', printData);
    
    try {
      const surgeryRequest = surgeryRequests.find(req => req.id === printData.surgeryRequestId);
      const patient = surgeryRequest ? patients.find(p => p.id === surgeryRequest.patientId) : null;
      
      console.log('Found surgery request and patient:', { surgeryRequest, patient });
      
      // Format dates safely
      const formatDate = (dateString: string) => {
        try {
          return dateString ? new Date(dateString).toLocaleString() : 'Unknown Time';
        } catch (e) {
          return 'Invalid Date';
        }
      };
      
      // Create a hidden print area in the current document
      let printArea = document.getElementById('print-area');
      if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'print-area';
        printArea.style.position = 'absolute';
        printArea.style.top = '-1000px';
        printArea.style.left = '-1000px';
        document.body.appendChild(printArea);
      }
      
      // Generate the print content
      const printContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 20px; line-height: 1.5; color: #333;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px;">
            <h1 style="margin: 0; font-size: 24px; color: #333;">OT Checklist</h1>
            <p style="margin: 5px 0; color: #666;">Surgical Procedure Verification</p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px; font-weight: bold;">Patient</div>
              <div style="font-weight: normal;">${patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</div>
            </div>
            <div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px; font-weight: bold;">Surgery Type</div>
              <div style="font-weight: normal;">${surgeryRequest?.surgeryType || 'Unknown Surgery'}</div>
            </div>
            <div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px; font-weight: bold;">Date</div>
              <div style="font-weight: normal;">${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Checklist Items</h2>
            ${printData.items.map((item: any, index: number) => `
              <div style="display: flex; align-items: flex-start; margin-bottom: 10px; padding: 8px 0;">
                <div style="margin-right: 10px; margin-top: 2px; font-size: 16px;">${item.checked ? '☑' : '☐'}</div>
                <div style="flex: 1;">
                  <div style="${item.checked ? 'text-decoration: line-through; color: #666;' : ''}">${item.description}</div>
                  ${item.checked && item.checkedBy ? `
                    <div style="font-size: 12px; color: #666; margin-top: 3px;">
                      Checked by ${users.find(u => u.id === item.checkedBy)?.name || 'Unknown User'} at ${formatDate(item.checkedAt)}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px;">
            <div>
              <div style="font-size: 12px; color: #666;">Surgeon Signature</div>
              <div style="border-top: 1px solid #000; padding-top: 5px; margin-top: 30px;"></div>
            </div>
            <div>
              <div style="font-size: 12px; color: #666;">Nurse Signature</div>
              <div style="border-top: 1px solid #000; padding-top: 5px; margin-top: 30px;"></div>
            </div>
          </div>
        </div>
      `;
      
      // Set the content of the print area
      printArea.innerHTML = printContent;
      
      // Print the content
      window.print();
      
      console.log('Print initiated successfully');
    } catch (error) {
      console.error('Error generating print content:', error);
      alert('Failed to generate print preview. Please try again.');
    }
  };

  const handleExportChecklist = () => {
    // In a real implementation, this would export to PDF or Excel
    // For now, we'll just download as JSON
    const dataStr = JSON.stringify(selectedChecklist || filteredChecklists, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = selectedChecklist 
      ? `checklist-${selectedChecklist.id}.json` 
      : 'checklists.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCreateChecklist = () => {
    setShowNewChecklistModal(true);
  };

  const handleSaveNewChecklist = () => {
    if (newChecklistData.surgeryRequestId) {
      // Add the new checklist
      addOTChecklist({
        surgeryRequestId: newChecklistData.surgeryRequestId,
        items: newChecklistData.items,
        status: 'pending'
      });
      
      // Reset form and close modal
      setNewChecklistData({
        surgeryRequestId: '',
        items: [
          { category: 'Pre-operative', description: 'Patient identity verified', checked: false },
          { category: 'Pre-operative', description: 'Consent form signed', checked: false },
          { category: 'Pre-operative', description: 'Pre-operative checklist completed', checked: false },
          { category: 'Surgical Team', description: 'Surgeon present', checked: false },
          { category: 'Surgical Team', description: 'Anesthesiologist present', checked: false },
          { category: 'Surgical Team', description: 'Nursing staff present', checked: false },
          { category: 'Equipment', description: 'Surgical instruments sterilized', checked: false },
          { category: 'Equipment', description: 'Anesthesia machine checked', checked: false },
          { category: 'Equipment', description: 'Monitoring equipment functional', checked: false },
          { category: 'Post-operative', description: 'Patient stable for transfer', checked: false },
          { category: 'Post-operative', description: 'Specimens labeled and sent to lab', checked: false },
          { category: 'Post-operative', description: 'Post-operative instructions given', checked: false }
        ]
      });
      setShowNewChecklistModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">OT Checklists</h1>
        <div className="flex space-x-3">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            onClick={() => {
              console.log('Main print button clicked, selectedChecklist:', selectedChecklist);
              handlePrintChecklist();
            }}
            disabled={!selectedChecklist}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            onClick={handleExportChecklist}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            onClick={handleCreateChecklist}
          >
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
                        <button
                          onClick={() => {
                            console.log('Print button clicked for checklist:', checklist);
                            handlePrintChecklist(checklist);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Printer className="w-4 h-4" />
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

      {/* New Checklist Modal */}
      {showNewChecklistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Checklist</h3>
                <button
                  onClick={() => setShowNewChecklistModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surgery Request
                  </label>
                  <select
                    value={newChecklistData.surgeryRequestId}
                    onChange={(e) => setNewChecklistData({...newChecklistData, surgeryRequestId: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select a surgery request</option>
                    {surgeryRequests
                      .filter(req => req.status === 'scheduled' || req.status === 'in-progress')
                      .map(request => {
                        const patient = patients.find(p => p.id === request.patientId);
                        return (
                          <option key={request.id} value={request.id}>
                            {request.surgeryType} - {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                          </option>
                        );
                      })}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Checklist Items
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {newChecklistData.items.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <Square className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm">{item.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewChecklistModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewChecklist}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  disabled={!newChecklistData.surgeryRequestId}
                >
                  Create Checklist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <X className="h-6 w-6" />
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
                      <button 
                        onClick={() => {
                          console.log('Print button clicked in modal for selectedChecklist:', selectedChecklist);
                          handlePrintChecklist();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Print
                      </button>
                      <button 
                        onClick={handleSaveChecklist}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
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