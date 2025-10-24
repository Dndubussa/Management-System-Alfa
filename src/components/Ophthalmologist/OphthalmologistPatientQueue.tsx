import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Clock, User, AlertCircle, CheckCircle, Eye, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function OphthalmologistPatientQueue() {
  const { patientQueue, getPatientQueue, updateQueueStatus } = useHospital();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Load patients ready for ophthalmologist consultation
  useEffect(() => {
    loadOphthalmologistQueue();
  }, []);

  const loadOphthalmologistQueue = async () => {
    setLoading(true);
    try {
      // Load all patients ready for doctor consultation
      const allQueueItems = await getPatientQueue({ 
        status: 'waiting', 
        workflowStage: 'doctor' 
      });
      
      // Filter to show only patients assigned to this ophthalmologist
      if (user?.id) {
        const assignedPatients = allQueueItems.filter((item: any) => 
          item.assignedDoctorId === user.id
        );
        console.log(`👁️ Ophthalmologist ${user.name} - Found ${assignedPatients.length} assigned patients`);
      }
    } catch (error) {
      console.error('Error loading ophthalmologist queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async (queueItem: any) => {
    try {
      await updateQueueStatus(queueItem.id, 'in-progress', 'doctor');
      // Navigate to ophthalmology EMR form with patient ID
      navigate(`/ophthalmology-emr/${queueItem.patient_id}`);
    } catch (error) {
      console.error('Error starting consultation:', error);
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

  // Filter patients ready for ophthalmologist consultation and assigned to this ophthalmologist
  // Only show patients who have completed triage (have vital signs recorded)
  const ophthalmologistPatients = patientQueue.filter(item => 
    item && 
    item.status === 'waiting' && 
    item.workflowStage === 'doctor' &&
    item.assignedDoctorId === user?.id &&
    item.vital_signs // Only show patients who have completed triage (have vital signs)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Eye className="w-6 h-6 mr-3 text-blue-600" />
                Ophthalmology Patient Queue
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Patients assigned to you for eye consultation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {ophthalmologistPatients.length} patient(s) waiting
              </div>
              <button
                onClick={loadOphthalmologistQueue}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Clock className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {ophthalmologistPatients.length === 0 ? (
          <div className="p-8 text-center">
            <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients in Queue</h3>
            <p className="text-gray-500">
              No patients are currently assigned to you for ophthalmology consultation.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {ophthalmologistPatients.map((queueItem) => (
              <div key={queueItem.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedPatient(queueItem)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {queueItem.patient_name || 'Unknown Patient'}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(queueItem.priority)}`}>
                            {queueItem.priority}
                          </span>
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Wait time: {getWaitTime(queueItem.created_at)}
                          </span>
                          <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                            Triage completed
                          </span>
                          {queueItem.assignment_reason && (
                            <span className="text-blue-600">
                              Assigned: {queueItem.assignment_reason}
                            </span>
                          )}
                        </div>

                        {queueItem.vital_signs && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Vital Signs:</span>
                            <span className="ml-2">
                              BP: {queueItem.vital_signs.bloodPressure || 'N/A'} | 
                              HR: {queueItem.vital_signs.heartRate || 'N/A'} | 
                              Temp: {queueItem.vital_signs.temperature || 'N/A'}°C
                            </span>
                          </div>
                        )}

                        {queueItem.chief_complaint && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Chief Complaint:</span>
                            <span className="ml-2">{queueItem.chief_complaint}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartConsultation(queueItem);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Start Eye Consultation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Patient Details
                </h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Patient:</span>
                  <span className="ml-2 text-gray-900">{selectedPatient.patient_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedPatient.priority)}`}>
                    {selectedPatient.priority}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Wait Time:</span>
                  <span className="ml-2 text-gray-900">{getWaitTime(selectedPatient.created_at)}</span>
                </div>
                {selectedPatient.assignment_reason && (
                  <div>
                    <span className="font-medium text-gray-700">Assignment Reason:</span>
                    <span className="ml-2 text-gray-900">{selectedPatient.assignment_reason}</span>
                  </div>
                )}
                {selectedPatient.chief_complaint && (
                  <div>
                    <span className="font-medium text-gray-700">Chief Complaint:</span>
                    <span className="ml-2 text-gray-900">{selectedPatient.chief_complaint}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleStartConsultation(selectedPatient);
                    setSelectedPatient(null);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OphthalmologistPatientQueue;
