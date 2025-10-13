import React, { useState } from 'react';
import { Save, X, Plus, Minus, Download } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { MedicalRecord, Prescription, LabOrder, Patient } from '../../types';
import { exportEMRToCSV, exportEMRToJSON, exportEMRToText, exportEMRToHTML, downloadFile } from '../../utils/emrExport';
import { ICD10Selector } from '../ICD10/ICD10Selector';

interface MedicalRecordFormProps {
  patientId: string;
  record?: MedicalRecord;
  onSave: () => void;
  onCancel: () => void;
}

export function MedicalRecordForm({ patientId, record, onSave, onCancel }: MedicalRecordFormProps) {
  const { addMedicalRecord, patients, addNotification } = useHospital();
  const { user } = useAuth();
  
  const patient = patients.find(p => p.id === patientId);
  
  const [formData, setFormData] = useState({
    visitDate: record?.visitDate || new Date().toISOString().split('T')[0],
    chiefComplaint: record?.chiefComplaint || '',
    diagnosis: record?.diagnosis || '',
    treatment: record?.treatment || '',
    notes: record?.notes || '',
    vitals: {
      bloodPressure: record?.vitals?.bloodPressure || '',
      heartRate: record?.vitals?.heartRate || '',
      temperature: record?.vitals?.temperature || '',
      weight: record?.vitals?.weight || '',
      height: record?.vitals?.height || ''
    },
    status: record?.status || 'active' as const
  });

  const [icd10Codes, setIcd10Codes] = useState(
    record?.diagnosisCodes?.map(dc => ({
      code: dc.code,
      description: dc.description,
      category: dc.type === 'ICD-10' ? 'ICD-10' : 'SNOMED CT'
    })) || []
  );

  const [prescriptions, setPrescriptions] = useState<Omit<Prescription, 'id' | 'recordId' | 'patientId' | 'doctorId' | 'status' | 'createdAt'>[]>(
    record?.prescriptions?.map(p => ({
      medication: p.medication,
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration,
      instructions: p.instructions
    })) || []
  );

  const [labOrders, setLabOrders] = useState<Omit<LabOrder, 'id' | 'recordId' | 'patientId' | 'doctorId' | 'status' | 'createdAt' | 'results' | 'completedAt'>[]>(
    record?.labOrders?.map(l => ({
      testName: l.testName,
      instructions: l.instructions
    })) || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    
    // Prepare prescriptions with full data
    const fullPrescriptions: Prescription[] = prescriptions.map((p, index) => ({
      id: `${Date.now()}-${index}`,
      recordId: record?.id || `${Date.now()}`,
      patientId,
      doctorId: user?.id || '',
      ...p,
      status: 'pending' as const,
      createdAt: now
    }));

    // Prepare lab orders with full data
    const fullLabOrders: LabOrder[] = labOrders.map((l, index) => ({
      id: `${Date.now()}-lab-${index}`,
      recordId: record?.id || `${Date.now()}`,
      patientId,
      doctorId: user?.id || '',
      ...l,
      status: 'ordered' as const,
      createdAt: now
    }));

    const medicalRecord: Omit<MedicalRecord, 'id'> = {
      patientId,
      doctorId: user?.id || '',
      visitDate: formData.visitDate,
      chiefComplaint: formData.chiefComplaint,
      diagnosis: formData.diagnosis,
      diagnosisCodes: icd10Codes.map(code => ({
        code: code.code,
        description: code.description,
        type: 'ICD-10' as const
      })),
      treatment: formData.treatment,
      notes: formData.notes,
      vitals: formData.vitals,
      prescriptions: fullPrescriptions,
      labOrders: fullLabOrders,
      status: formData.status
    };

    addMedicalRecord(medicalRecord);

    // Send notifications to pharmacy for prescriptions
    if (fullPrescriptions.length > 0) {
      addNotification({
        userIds: ['4'], // Pharmacy user ID
        type: 'prescription',
        title: 'New Prescription Order',
        message: `${fullPrescriptions.length} prescription(s) for ${patient?.firstName} ${patient?.lastName}`,
        isRead: false
      });
    }

    // Send notifications to lab for lab orders
    if (fullLabOrders.length > 0) {
      addNotification({
        userIds: ['3'], // Lab user ID
        type: 'lab-order',
        title: 'New Lab Order',
        message: `${fullLabOrders.length} lab order(s) for ${patient?.firstName} ${patient?.lastName}`,
        isRead: false
      });
    }

    onSave();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vitals.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addPrescription = () => {
    setPrescriptions(prev => [...prev, {
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: string, value: string) => {
    setPrescriptions(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const addLabOrder = () => {
    setLabOrders(prev => [...prev, {
      testName: '',
      instructions: ''
    }]);
  };

  const removeLabOrder = (index: number) => {
    setLabOrders(prev => prev.filter((_, i) => i !== index));
  };

  const updateLabOrder = (index: number, field: string, value: string) => {
    setLabOrders(prev => prev.map((l, i) => 
      i === index ? { ...l, [field]: value } : l
    ));
  };

  // Export current record
  const handleExportCSV = () => {
    if (!patient) return;
    
    // Create a temporary record object for export
    const tempRecord: MedicalRecord = {
      id: record?.id || 'new',
      patientId,
      doctorId: user?.id || '',
      visitDate: formData.visitDate,
      chiefComplaint: formData.chiefComplaint,
      diagnosis: formData.diagnosis,
      diagnosisCodes: icd10Codes.map(code => ({
        code: code.code,
        description: code.description,
        type: 'ICD-10' as const
      })),
      treatment: formData.treatment,
      notes: formData.notes,
      vitals: formData.vitals,
      prescriptions: prescriptions.map((p, index) => ({
        id: `${Date.now()}-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...p,
        status: 'pending',
        createdAt: new Date().toISOString()
      })),
      labOrders: labOrders.map((l, index) => ({
        id: `${Date.now()}-lab-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...l,
        status: 'ordered',
        createdAt: new Date().toISOString()
      })),
      status: formData.status
    };
    
    const csvContent = exportEMRToCSV(patient, [tempRecord]);
    downloadFile(csvContent, `emr-${patient.firstName}-${patient.lastName}-record.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    if (!patient) return;
    
    // Create a temporary record object for export
    const tempRecord: MedicalRecord = {
      id: record?.id || 'new',
      patientId,
      doctorId: user?.id || '',
      visitDate: formData.visitDate,
      chiefComplaint: formData.chiefComplaint,
      diagnosis: formData.diagnosis,
      diagnosisCodes: icd10Codes.map(code => ({
        code: code.code,
        description: code.description,
        type: 'ICD-10' as const
      })),
      treatment: formData.treatment,
      notes: formData.notes,
      vitals: formData.vitals,
      prescriptions: prescriptions.map((p, index) => ({
        id: `${Date.now()}-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...p,
        status: 'pending',
        createdAt: new Date().toISOString()
      })),
      labOrders: labOrders.map((l, index) => ({
        id: `${Date.now()}-lab-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...l,
        status: 'ordered',
        createdAt: new Date().toISOString()
      })),
      status: formData.status
    };
    
    const jsonContent = exportEMRToJSON(patient, [tempRecord]);
    downloadFile(jsonContent, `emr-${patient.firstName}-${patient.lastName}-record.json`, 'application/json');
  };

  const handleExportText = () => {
    if (!patient) return;
    
    // Create a temporary record object for export
    const tempRecord: MedicalRecord = {
      id: record?.id || 'new',
      patientId,
      doctorId: user?.id || '',
      visitDate: formData.visitDate,
      chiefComplaint: formData.chiefComplaint,
      diagnosis: formData.diagnosis,
      diagnosisCodes: icd10Codes.map(code => ({
        code: code.code,
        description: code.description,
        type: 'ICD-10' as const
      })),
      treatment: formData.treatment,
      notes: formData.notes,
      vitals: formData.vitals,
      prescriptions: prescriptions.map((p, index) => ({
        id: `${Date.now()}-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...p,
        status: 'pending',
        createdAt: new Date().toISOString()
      })),
      labOrders: labOrders.map((l, index) => ({
        id: `${Date.now()}-lab-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...l,
        status: 'ordered',
        createdAt: new Date().toISOString()
      })),
      status: formData.status
    };
    
    const textContent = exportEMRToText(patient, [tempRecord]);
    downloadFile(textContent, `emr-${patient.firstName}-${patient.lastName}-record.txt`, 'text/plain');
  };

  const handleExportHTML = () => {
    if (!patient) return;
    
    // Create a temporary record object for export
    const tempRecord: MedicalRecord = {
      id: record?.id || 'new',
      patientId,
      doctorId: user?.id || '',
      visitDate: formData.visitDate,
      chiefComplaint: formData.chiefComplaint,
      diagnosis: formData.diagnosis,
      diagnosisCodes: icd10Codes.map(code => ({
        code: code.code,
        description: code.description,
        type: 'ICD-10' as const
      })),
      treatment: formData.treatment,
      notes: formData.notes,
      vitals: formData.vitals,
      prescriptions: prescriptions.map((p, index) => ({
        id: `${Date.now()}-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...p,
        status: 'pending',
        createdAt: new Date().toISOString()
      })),
      labOrders: labOrders.map((l, index) => ({
        id: `${Date.now()}-lab-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...l,
        status: 'ordered',
        createdAt: new Date().toISOString()
      })),
      status: formData.status
    };
    
    const htmlContent = exportEMRToHTML(patient, [tempRecord]);
    downloadFile(htmlContent, `emr-${patient.firstName}-${patient.lastName}-record.html`, 'text/html');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {record ? 'Edit Medical Record' : 'New Medical Record'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Patient: {patient?.firstName} {patient?.lastName}
            </p>
          </div>
          <div className="relative group">
            <button className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
              <button
                onClick={handleExportCSV}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as JSON
              </button>
              <button
                onClick={handleExportText}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as Text
              </button>
              <button
                onClick={handleExportHTML}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as HTML
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Visit Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Visit Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Date *
              </label>
              <input
                type="date"
                name="visitDate"
                required
                value={formData.visitDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clinical Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Clinical Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chief Complaint *
              </label>
              <textarea
                name="chiefComplaint"
                required
                rows={2}
                value={formData.chiefComplaint}
                onChange={handleChange}
                placeholder="Patient's primary concern or reason for visit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis *
              </label>
              <textarea
                name="diagnosis"
                required
                rows={2}
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Medical diagnosis or assessment"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ICD-10 Diagnosis Codes
              </label>
              <ICD10Selector
                selectedCodes={icd10Codes}
                onCodesChange={setIcd10Codes}
                maxCodes={5}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Plan
              </label>
              <textarea
                name="treatment"
                rows={3}
                value={formData.treatment}
                onChange={handleChange}
                placeholder="Treatment plan and recommendations"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinical Notes
              </label>
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional clinical observations and notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vital Signs</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Pressure
              </label>
              <input
                type="text"
                name="vitals.bloodPressure"
                value={formData.vitals.bloodPressure}
                onChange={handleChange}
                placeholder="120/80"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heart Rate
              </label>
              <input
                type="text"
                name="vitals.heartRate"
                value={formData.vitals.heartRate}
                onChange={handleChange}
                placeholder="72 bpm"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <input
                type="text"
                name="vitals.temperature"
                value={formData.vitals.temperature}
                onChange={handleChange}
                placeholder="98.6°F"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <input
                type="text"
                name="vitals.weight"
                value={formData.vitals.weight}
                onChange={handleChange}
                placeholder="150 lbs"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height
              </label>
              <input
                type="text"
                name="vitals.height"
                value={formData.vitals.height}
                onChange={handleChange}
                placeholder="5'6&quot;"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Prescriptions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Prescriptions</h3>
            <button
              type="button"
              onClick={addPrescription}
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Prescription</span>
            </button>
          </div>
          
          {prescriptions.map((prescription, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md mb-4 relative">
              <button
                type="button"
                onClick={() => removePrescription(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medication *
                  </label>
                  <input
                    type="text"
                    value={prescription.medication}
                    onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                    placeholder="Medication name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={prescription.dosage}
                    onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                    placeholder="e.g., 500mg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    value={prescription.frequency}
                    onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                    placeholder="e.g., Twice daily"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={prescription.duration}
                    onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                    placeholder="e.g., 7 days"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  rows={2}
                  value={prescription.instructions}
                  onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                  placeholder="Special instructions for taking this medication"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          ))}
          
          {prescriptions.length === 0 && (
            <p className="text-gray-500 text-sm">No prescriptions added. Click "Add Prescription" to add medications.</p>
          )}
        </div>

        {/* Lab Orders */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Lab Orders</h3>
            <button
              type="button"
              onClick={addLabOrder}
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lab Order</span>
            </button>
          </div>
          
          {labOrders.map((labOrder, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md mb-4 relative">
              <button
                type="button"
                onClick={() => removeLabOrder(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    value={labOrder.testName}
                    onChange={(e) => updateLabOrder(index, 'testName', e.target.value)}
                    placeholder="e.g., Complete Blood Count"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={labOrder.instructions}
                    onChange={(e) => updateLabOrder(index, 'instructions', e.target.value)}
                    placeholder="Special instructions for the lab test"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {labOrders.length === 0 && (
            <p className="text-gray-500 text-sm">No lab orders added. Click "Add Lab Order" to request laboratory tests.</p>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{record ? 'Update Record' : 'Save Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}