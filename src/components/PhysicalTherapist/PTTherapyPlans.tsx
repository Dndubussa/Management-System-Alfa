import React, { useState } from 'react';
import { FileText, Calendar, Clock, User, Search, Plus, Edit, Eye, Save, BarChart3 } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Patient } from '../../types';

export function PTTherapyPlans() {
  const { patients, medicalRecords } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [therapyPlans, setTherapyPlans] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);

  const therapyTypes = [
    'Physiotherapy',
    'Hydrotherapy',
    'Electrotherapy',
    'Manual Therapy',
    'Exercise Therapy',
    'Traction Therapy',
    'Heat/Cold Therapy'
  ];

  const filteredPatients = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    
    // Load existing therapy plans for this patient
    const patientPlans = medicalRecords.filter(record => 
      record.patientId === patient.id && record.notes.includes('therapy')
    );
    
    setTherapyPlans(patientPlans);
  };

  const handleCreatePlan = () => {
    setActivePlan({
      id: null,
      therapyType: '',
      frequency: '',
      duration: '',
      goals: '',
      notes: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setShowPlanForm(true);
  };

  const handleEditPlan = (plan: any) => {
    setActivePlan(plan);
    setShowPlanForm(true);
  };

  const handleSavePlan = () => {
    // In a real app, this would save to the database
    alert('Therapy plan saved successfully!');
    setShowPlanForm(false);
    setActivePlan(null);
  };

  const handleAddProgressNote = (planId: string) => {
    // In a real app, this would open a progress note form
    alert('Progress note form would open here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Therapy Plans & Progress Notes</h1>
        <p className="text-gray-600 mt-1">
          Create therapy plans and track patient progress
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Therapy Plans
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'No patients found matching your criteria.' : 'No patients available.'}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const patientPlans = medicalRecords.filter(record => 
                      record.patientId === patient.id && record.notes.includes('therapy')
                    );
                    
                    return (
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {patientPlans.length}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handlePatientSelect(patient)}
                            className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Manage</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : showPlanForm ? (
        /* Therapy Plan Form */
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
                onClick={() => setShowPlanForm(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to Plans
              </button>
            </div>
          </div>

          {/* Therapy Plan Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {activePlan?.id ? 'Edit Therapy Plan' : 'Create New Therapy Plan'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Therapy Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Therapy Type
                </label>
                <select
                  value={activePlan?.therapyType || ''}
                  onChange={(e) => setActivePlan({...activePlan, therapyType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select therapy type</option>
                  {therapyTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={activePlan?.frequency || ''}
                      onChange={(e) => setActivePlan({...activePlan, frequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Sessions per week"
                    />
                  </div>
                  <div>
                    <select
                      value={activePlan?.frequencyUnit || 'week'}
                      onChange={(e) => setActivePlan({...activePlan, frequencyUnit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="day">Per Day</option>
                      <option value="week">Per Week</option>
                      <option value="month">Per Month</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={activePlan?.duration || ''}
                      onChange={(e) => setActivePlan({...activePlan, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Number of weeks"
                    />
                  </div>
                  <div>
                    <select
                      value={activePlan?.durationUnit || 'weeks'}
                      onChange={(e) => setActivePlan({...activePlan, durationUnit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={activePlan?.startDate || ''}
                  onChange={(e) => setActivePlan({...activePlan, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Therapy Goals
                </label>
                <textarea
                  value={activePlan?.goals || ''}
                  onChange={(e) => setActivePlan({...activePlan, goals: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe the therapy goals..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={activePlan?.notes || ''}
                  onChange={(e) => setActivePlan({...activePlan, notes: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPlanForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Therapy Plans List */
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
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Back to Patient List
                </button>
                <button
                  onClick={handleCreatePlan}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Plan
                </button>
              </div>
            </div>
          </div>

          {/* Therapy Plans */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Therapy Plans</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Therapy Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {therapyPlans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No therapy plans found for this patient.
                      </td>
                    </tr>
                  ) : (
                    therapyPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Physiotherapy
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(plan.visitDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            3 sessions/week
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            4 weeks
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleAddProgressNote(plan.id)}
                              className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1"
                              title="Add Progress Note"
                            >
                              <BarChart3 className="w-4 h-4" />
                              <span>Progress</span>
                            </button>
                            <button
                              onClick={() => handleEditPlan(plan)}
                              className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                              title="Edit Plan"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => alert(`Viewing details for plan #${plan.id}`)}
                              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}