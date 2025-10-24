import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Clock, User, AlertCircle, CheckCircle } from 'lucide-react';

export function TriageQueue() {
  const { patientQueue, getPatientQueue, updateQueueStatus } = useHospital();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Load patients waiting for triage
  useEffect(() => {
    loadTriageQueue();
  }, []);

  const loadTriageQueue = async () => {
    setLoading(true);
    try {
      const queueData = await getPatientQueue({ 
        status: 'waiting', 
        workflowStage: 'reception' 
      });
      console.log('🔍 TriageQueue - Loaded queue data:', queueData);
    } catch (error) {
      console.error('Error loading triage queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTriage = async (queueItem: any) => {
    try {
      await updateQueueStatus(queueItem.id, 'in-progress', 'triage');
      setSelectedPatient(queueItem);
      // Navigate to triage form with patient ID using React Router
      navigate(`/nurse-triage/${queueItem.patient_id}`);
    } catch (error) {
      console.error('Error starting triage:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getWaitTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  // Filter patients waiting for triage
  const triagePatients = patientQueue.filter(item => 
    item && item.status === 'waiting' && item.workflowStage === 'reception'
  );

  // Debug logging
  console.log('🔍 TriageQueue - patientQueue from context:', patientQueue);
  console.log('🔍 TriageQueue - triagePatients filtered:', triagePatients);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading triage queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Triage Queue</h1>
        <button
          onClick={loadTriageQueue}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {triagePatients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Waiting</h3>
          <p className="text-gray-600">All patients have been triaged or no new patients in queue.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Patients Waiting for Triage ({triagePatients.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {triagePatients.map((queueItem) => (
              <div key={queueItem.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {queueItem.patients?.first_name} {queueItem.patients?.last_name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(queueItem.priority)}`}>
                            {queueItem.priority}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium">MRN:</span>
                            <span className="ml-1 font-mono">{queueItem.patients?.mrn}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Phone:</span>
                            <span className="ml-1">{queueItem.patients?.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Insurance:</span>
                            <span className="ml-1">{queueItem.patients?.insurance_provider}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Waiting for {getWaitTime(queueItem.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleStartTriage(queueItem)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Start Triage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TriageQueue;
