import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Clock, User, AlertCircle, CheckCircle, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DoctorQueue() {
  const { patientQueue, getPatientQueue, updateQueueStatus } = useHospital();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Load patients ready for doctor consultation
  useEffect(() => {
    loadDoctorQueue();
  }, []);

  const loadDoctorQueue = async () => {
    setLoading(true);
    try {
      // Load all patients ready for doctor consultation
      const allQueueItems = await getPatientQueue({ 
        status: 'waiting', 
        workflowStage: 'doctor' 
      });
      
      // Filter to show only patients assigned to this doctor
      if (user?.id) {
        const assignedPatients = allQueueItems.filter((item: any) => 
          item.assignedDoctorId === user.id
        );
        console.log(`👨‍⚕️ Doctor ${user.name} - Found ${assignedPatients.length} assigned patients`);
      }
    } catch (error) {
      console.error('Error loading doctor queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async (queueItem: any) => {
    try {
      await updateQueueStatus(queueItem.id, 'in-progress', 'doctor');
      // Navigate to EMR form with patient ID
      navigate(`/emr/${queueItem.patient_id}`);
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

  // Filter patients ready for doctor consultation and assigned to this doctor
  // Only show patients who have completed triage (have vital signs recorded)
  const doctorPatients = patientQueue.filter(item => 
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Patient Queue</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Dr. {user?.name}
          </div>
          <button
            onClick={loadDoctorQueue}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {doctorPatients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Ready for Consultation</h3>
          <p className="text-gray-600">No patients have completed triage and are ready for consultation yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Patients Ready for Consultation ({doctorPatients.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Patients who have completed triage (vital signs recorded) and are ready for doctor consultation
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {doctorPatients.map((queueItem) => (
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
                          {queueItem.vital_signs && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(queueItem.vital_signs.urgency)}`}>
                              {queueItem.vital_signs.urgency}
                            </span>
                          )}
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
                        
                        {queueItem.vital_signs && (
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="font-medium">BP:</span>
                              <span className="ml-1">{queueItem.vital_signs.blood_pressure_systolic}/{queueItem.vital_signs.blood_pressure_diastolic}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Temp:</span>
                              <span className="ml-1">{queueItem.vital_signs.temperature}°C</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Pulse:</span>
                              <span className="ml-1">{queueItem.vital_signs.pulse} bpm</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Weight:</span>
                              <span className="ml-1">{queueItem.vital_signs.weight} kg</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Ready for {getWaitTime(queueItem.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleStartConsultation(queueItem)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Start Consultation
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

export default DoctorQueue;
