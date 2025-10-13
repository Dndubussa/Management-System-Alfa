import React, { useState } from 'react';
import { User, FileText, Heart, Activity, Search, Save, Plus } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Patient } from '../../types';

export function PTAssessment() {
  const { patients, medicalRecords } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [assessmentData, setAssessmentData] = useState({
    painLevel: '',
    mobility: '',
    functionalLimitations: '',
    medicalHistory: '',
    referralNotes: '',
    bodyPartsAffected: [] as string[],
    notes: ''
  });

  const bodyParts = [
    'Neck', 'Shoulders', 'Arms', 'Elbows', 'Wrists', 'Hands',
    'Back', 'Hips', 'Knees', 'Ankles', 'Feet'
  ];

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const filteredPatients = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    // Load existing assessment data if available
    const existingRecord = medicalRecords.find(record => 
      record.patientId === patient.id && record.notes.includes('physiotherapy')
    );
    
    if (existingRecord) {
      setAssessmentData({
        painLevel: existingRecord.notes.includes('pain') ? '5' : '',
        mobility: existingRecord.notes.includes('mobility') ? 'moderate' : '',
        functionalLimitations: existingRecord.notes.includes('limitations') ? 'walking' : '',
        medicalHistory: existingRecord.notes,
        referralNotes: existingRecord.notes.includes('referral') ? 'From Dr. Smith' : '',
        bodyPartsAffected: [],
        notes: existingRecord.notes
      });
    } else {
      setAssessmentData({
        painLevel: '',
        mobility: '',
        functionalLimitations: '',
        medicalHistory: '',
        referralNotes: '',
        bodyPartsAffected: [],
        notes: ''
      });
    }
  };

  const handleBodyPartToggle = (part: string) => {
    setAssessmentData(prev => {
      const newParts = prev.bodyPartsAffected.includes(part)
        ? prev.bodyPartsAffected.filter(p => p !== part)
        : [...prev.bodyPartsAffected, part];
      
      return { ...prev, bodyPartsAffected: newParts };
    });
  };

  const handleSaveAssessment = () => {
    // In a real app, this would save to the database
    alert('Assessment saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Assessment</h1>
        <p className="text-gray-600 mt-1">
          Conduct clinical evaluation and record patient assessment
        </p>
      </div>

      {!selectedPatient ? (
        /* Patient Selection */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Select Patient</h3>
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by patient name or MRN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MRN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'No patients found matching your criteria.' : 'No patients available.'}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {`${patient.firstName} ${patient.lastName}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patient.mrn}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {calculateAge(patient.dateOfBirth)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {patient.gender}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handlePatientSelect(patient)}
                          className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Assess</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Assessment Form */
        <div className="space-y-6">
          {/* Patient Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                  </h3>
                  <p className="text-gray-600">MRN: {selectedPatient.mrn}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to Patient List
              </button>
            </div>
          </div>

          {/* Assessment Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Clinical Assessment</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Pain Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pain Level (0-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={assessmentData.painLevel}
                    onChange={(e) => setAssessmentData({...assessmentData, painLevel: e.target.value})}
                    className="w-full"
                  />
                  <span className="text-lg font-medium w-8">
                    {assessmentData.painLevel || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>No Pain</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              {/* Mobility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobility Status
                </label>
                <select
                  value={assessmentData.mobility}
                  onChange={(e) => setAssessmentData({...assessmentData, mobility: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select mobility status</option>
                  <option value="normal">Normal</option>
                  <option value="limited">Limited</option>
                  <option value="moderate">Moderate</option>
                  <option value="severely-limited">Severely Limited</option>
                  <option value="non-weight-bearing">Non-Weight Bearing</option>
                </select>
              </div>

              {/* Functional Limitations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Functional Limitations
                </label>
                <textarea
                  value={assessmentData.functionalLimitations}
                  onChange={(e) => setAssessmentData({...assessmentData, functionalLimitations: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe patient's functional limitations..."
                />
              </div>

              {/* Body Parts Affected */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Parts Affected
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {bodyParts.map((part) => (
                    <button
                      key={part}
                      type="button"
                      onClick={() => handleBodyPartToggle(part)}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        assessmentData.bodyPartsAffected.includes(part)
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medical History */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical History (from EMR)
                </label>
                <textarea
                  value={assessmentData.medicalHistory}
                  onChange={(e) => setAssessmentData({...assessmentData, medicalHistory: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Patient's medical history..."
                />
              </div>

              {/* Referral Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor's Referral Notes
                </label>
                <textarea
                  value={assessmentData.referralNotes}
                  onChange={(e) => setAssessmentData({...assessmentData, referralNotes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Notes from referring doctor..."
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={assessmentData.notes}
                  onChange={(e) => setAssessmentData({...assessmentData, notes: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Any additional observations..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssessment}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}