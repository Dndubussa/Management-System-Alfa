import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Eye, 
  Camera, 
  TestTube, 
  Pill, 
  FileText, 
  AlertCircle,
  Save,
  X,
  Upload
} from 'lucide-react';
import { OphthalmologyRecord, VisualAcuity, Refraction, IntraocularPressure, OphthalmologyFinding } from '../../types';
import { ICD10Selector } from '../ICD10/ICD10Selector';

export function OphthalmologyEMRForm() {
  const { patientId } = useParams();
  const { patients, medicalRecords, addMedicalRecord, updateLabOrderStatus } = useHospital();
  const { user } = useAuth();
  const navigate = useNavigate();

  const patient = patients.find(p => p.id === patientId);
  
  // Debug logging
  console.log('👁️ OphthalmologyEMRForm - Patient ID:', patientId);
  console.log('👁️ OphthalmologyEMRForm - Total patients:', patients.length);
  console.log('👁️ OphthalmologyEMRForm - Patient found:', patient ? `${patient.firstName} ${patient.lastName}` : 'Not found');
  
  // Form state
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [visualAcuity, setVisualAcuity] = useState<VisualAcuity>({
    rightEye: { near: '', distance: '' },
    leftEye: { near: '', distance: '' }
  });
  const [refraction, setRefraction] = useState<Refraction>({
    rightEye: { sphere: '', cylinder: '', axis: '', add: '' },
    leftEye: { sphere: '', cylinder: '', axis: '', add: '' }
  });
  const [intraocularPressure, setIntraocularPressure] = useState<IntraocularPressure>({
    rightEye: '',
    leftEye: '',
    method: 'tonometry'
  });
  const [externalExam, setExternalExam] = useState('');
  const [slitLampFindings, setSlitLampFindings] = useState('');
  const [fundoscopyFindings, setFundoscopyFindings] = useState('');
  const [intraocularPressureFindings, setIntraocularPressureFindings] = useState('');
  const [systemicHistory, setSystemicHistory] = useState({
    diabetes: false,
    hypertension: false,
    other: ''
  });
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [icd10Codes, setIcd10Codes] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [octOrder, setOctOrder] = useState('');
  const [visualFieldOrder, setVisualFieldOrder] = useState('');
  const [fundusPhotoOrder, setFundusPhotoOrder] = useState('');
  const [surgeryRequest, setSurgeryRequest] = useState({
    type: '',
    eye: 'right' as 'right' | 'left' | 'both',
    urgency: 'routine' as 'routine' | 'urgent' | 'emergency',
    notes: ''
  });
  const [findings, setFindings] = useState<OphthalmologyFinding[]>([]);

  // Initialize form with existing record data if editing
  useEffect(() => {
    // In a real implementation, you would load existing record data here
  }, [patientId]);

  const handleSave = () => {
    if (!patientId || !user?.id) return;

    const newRecord: OphthalmologyRecord = {
      id: Date.now().toString(),
      patientId,
      doctorId: user.id,
      visitDate: new Date().toISOString(),
      chiefComplaint,
      diagnosis,
      diagnosisCodes: icd10Codes.map(code => ({
        code: code.code,
        description: code.description,
        type: 'ICD-10' as const
      })),
      treatment,
      notes,
      vitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: ''
      },
      prescriptions,
      labOrders,
      status: 'completed',
      visualAcuity,
      refraction,
      intraocularPressure,
      findings,
      systemicHistory,
      octOrders: octOrder ? [{
        id: Date.now().toString() + '-oct',
        recordId: Date.now().toString(),
        patientId,
        doctorId: user.id,
        testName: 'OCT Scan',
        instructions: octOrder,
        status: 'ordered',
        createdAt: new Date().toISOString()
      }] : undefined,
      visualFieldOrders: visualFieldOrder ? [{
        id: Date.now().toString() + '-vf',
        recordId: Date.now().toString(),
        patientId,
        doctorId: user.id,
        testName: 'Visual Field Test',
        instructions: visualFieldOrder,
        status: 'ordered',
        createdAt: new Date().toISOString()
      }] : undefined,
      fundusPhotoOrders: fundusPhotoOrder ? [{
        id: Date.now().toString() + '-fp',
        recordId: Date.now().toString(),
        patientId,
        doctorId: user.id,
        testName: 'Fundus Photography',
        instructions: fundusPhotoOrder,
        status: 'ordered',
        createdAt: new Date().toISOString()
      }] : undefined,
      surgeryRequest: surgeryRequest.type ? surgeryRequest : undefined
    };

    addMedicalRecord(newRecord);
    navigate('/emr');
  };

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, {
      id: Date.now().toString(),
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
  };

  const handleUpdatePrescription = (index: number, field: string, value: string) => {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptions(updated);
  };

  const handleRemovePrescription = (index: number) => {
    const updated = [...prescriptions];
    updated.splice(index, 1);
    setPrescriptions(updated);
  };

  const handleAddFinding = (type: OphthalmologyFinding['type']) => {
    setFindings([...findings, {
      type,
      description: '',
      imageUrl: ''
    }]);
  };

  const handleUpdateFinding = (index: number, field: keyof OphthalmologyFinding, value: string) => {
    const updated = [...findings];
    updated[index] = { ...updated[index], [field]: value };
    setFindings(updated);
  };

  const handleRemoveFinding = (index: number) => {
    const updated = [...findings];
    updated.splice(index, 1);
    setFindings(updated);
  };

  if (!patient) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient not found</h2>
        <button
          onClick={() => navigate('/emr')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Back to EMR
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Eye className="w-6 h-6 text-blue-500 mr-2" />
            Ophthalmology EMR
          </h1>
          <p className="text-gray-600">
            Patient: {patient.firstName} {patient.lastName} • ID: {patient.id}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/emr')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Record
          </button>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chief Complaint</h2>
        <textarea
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Describe the patient's main complaint..."
        />
      </div>

      {/* Visual Acuity Test */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Visual Acuity Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Right Eye</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Near Vision</label>
                <input
                  type="text"
                  value={visualAcuity.rightEye.near}
                  onChange={(e) => setVisualAcuity({
                    ...visualAcuity,
                    rightEye: { ...visualAcuity.rightEye, near: e.target.value }
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 20/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Distance Vision</label>
                <input
                  type="text"
                  value={visualAcuity.rightEye.distance}
                  onChange={(e) => setVisualAcuity({
                    ...visualAcuity,
                    rightEye: { ...visualAcuity.rightEye, distance: e.target.value }
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 20/40"
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Left Eye</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Near Vision</label>
                <input
                  type="text"
                  value={visualAcuity.leftEye.near}
                  onChange={(e) => setVisualAcuity({
                    ...visualAcuity,
                    leftEye: { ...visualAcuity.leftEye, near: e.target.value }
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 20/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Distance Vision</label>
                <input
                  type="text"
                  value={visualAcuity.leftEye.distance}
                  onChange={(e) => setVisualAcuity({
                    ...visualAcuity,
                    leftEye: { ...visualAcuity.leftEye, distance: e.target.value }
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 20/30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refraction Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Refraction Results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eye</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sphere</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cylinder</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Axis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Add</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Right Eye</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text"
                    value={refraction.rightEye.sphere}
                    onChange={(e) => setRefraction({
                      ...refraction,
                      rightEye: { ...refraction.rightEye, sphere: e.target.value }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="e.g., -2.00"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text"
                    value={refraction.rightEye.cylinder}
                    onChange={(e) => setRefraction({
                      ...refraction,
                      rightEye: { ...refraction.rightEye, cylinder: e.target.value }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="e.g., -0.50"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text"
                    value={refraction.rightEye.axis}
                    onChange={(e) => setRefraction({
                      ...refraction,
                      rightEye: { ...refraction.rightEye, axis: e.target.value }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="e.g., 90"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text"
                    value={refraction.rightEye.add}
                    onChange={(e) => setRefraction({
                      ...refraction,
                      rightEye: { ...refraction.rightEye, add: e.target.value }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="e.g., +2.00"
                  />
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Left Eye</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text"
                    value={refraction.leftEye.sphere}
                    onChange={(e) => setRefraction({
                      ...refraction,
                      leftEye: { ...refraction.leftEye, sphere: e.target.value }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="e.g., -1.75"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text"
                    value={refraction.leftEye.cylinder}
                    onChange={(e) => setRefraction({
                      ...refraction,
                      leftEye: { ...refraction.leftEye, cylinder: e.target.value }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="e.g., -0.75"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text"
                    value={refraction.leftEye.axis}
                    onChange={(e) => setRefraction({
                      ...refraction,
                      leftEye: { ...refraction.leftEye, axis: e.target.value }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="e.g., 85"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text"
                    value={refraction.leftEye.add}
                    onChange={(e) => setRefraction({
                      ...refraction,
                      leftEye: { ...refraction.leftEye, add: e.target.value }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="e.g., +2.00"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Examination */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Examination</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">External Eye Exam</h3>
            <textarea
              value={externalExam}
              onChange={(e) => setExternalExam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Describe external eye findings..."
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Slit Lamp Findings</h3>
            <textarea
              value={slitLampFindings}
              onChange={(e) => setSlitLampFindings(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Describe slit lamp examination findings..."
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Fundoscopy / Retinal Exam</h3>
            <textarea
              value={fundoscopyFindings}
              onChange={(e) => setFundoscopyFindings(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Describe fundoscopy findings..."
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Intraocular Pressure</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Right Eye (mmHg)</label>
                  <input
                    type="text"
                    value={intraocularPressure.rightEye}
                    onChange={(e) => setIntraocularPressure({
                      ...intraocularPressure,
                      rightEye: e.target.value
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 16"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Left Eye (mmHg)</label>
                  <input
                    type="text"
                    value={intraocularPressure.leftEye}
                    onChange={(e) => setIntraocularPressure({
                      ...intraocularPressure,
                      leftEye: e.target.value
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 15"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Method</label>
                <select
                  value={intraocularPressure.method}
                  onChange={(e) => setIntraocularPressure({
                    ...intraocularPressure,
                    method: e.target.value as 'tonometry' | 'palpation'
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="tonometry">Tonometry</option>
                  <option value="palpation">Palpation</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Systemic History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Systemic History</h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="diabetes"
              checked={systemicHistory.diabetes}
              onChange={(e) => setSystemicHistory({
                ...systemicHistory,
                diabetes: e.target.checked
              })}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="diabetes" className="ml-2 block text-sm text-gray-900">
              Diabetes
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hypertension"
              checked={systemicHistory.hypertension}
              onChange={(e) => setSystemicHistory({
                ...systemicHistory,
                hypertension: e.target.checked
              })}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="hypertension" className="ml-2 block text-sm text-gray-900">
              Hypertension
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Other Conditions</label>
            <input
              type="text"
              value={systemicHistory.other}
              onChange={(e) => setSystemicHistory({
                ...systemicHistory,
                other: e.target.value
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="List other relevant conditions..."
            />
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis</h2>
        <textarea
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Enter primary diagnosis..."
        />
        
        <div className="mt-4">
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
      </div>

      {/* Treatment Plan */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Treatment Plan</h2>
        <textarea
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Describe treatment plan..."
        />
      </div>

      {/* Prescriptions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Prescriptions</h2>
          <button
            onClick={handleAddPrescription}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            Add Prescription
          </button>
        </div>
        {prescriptions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No prescriptions added yet.</p>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900">Prescription #{index + 1}</h3>
                  <button
                    onClick={() => handleRemovePrescription(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medication</label>
                    <input
                      type="text"
                      value={prescription.medication}
                      onChange={(e) => handleUpdatePrescription(index, 'medication', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Timolol Eye Drops"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dosage</label>
                    <input
                      type="text"
                      value={prescription.dosage}
                      onChange={(e) => handleUpdatePrescription(index, 'dosage', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 1 drop"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frequency</label>
                    <input
                      type="text"
                      value={prescription.frequency}
                      onChange={(e) => handleUpdatePrescription(index, 'frequency', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Twice daily"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <input
                      type="text"
                      value={prescription.duration}
                      onChange={(e) => handleUpdatePrescription(index, 'duration', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 2 weeks"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Instructions</label>
                    <textarea
                      value={prescription.instructions}
                      onChange={(e) => handleUpdatePrescription(index, 'instructions', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={2}
                      placeholder="e.g., Instill one drop in affected eye twice daily"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Orders</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Lab Orders</h3>
            <textarea
              value={octOrder}
              onChange={(e) => setOctOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="e.g., OCT Scan for macular edema assessment"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Visual Field Test</h3>
            <textarea
              value={visualFieldOrder}
              onChange={(e) => setVisualFieldOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="e.g., Visual field test for glaucoma screening"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Fundus Photography</h3>
            <textarea
              value={fundusPhotoOrder}
              onChange={(e) => setFundusPhotoOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="e.g., Fundus photography for diabetic retinopathy monitoring"
            />
          </div>
        </div>
      </div>

      {/* Surgery Request */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Surgery Request</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Surgery Type</label>
            <input
              type="text"
              value={surgeryRequest.type}
              onChange={(e) => setSurgeryRequest({
                ...surgeryRequest,
                type: e.target.value
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Cataract Extraction"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Eye</label>
            <select
              value={surgeryRequest.eye}
              onChange={(e) => setSurgeryRequest({
                ...surgeryRequest,
                eye: e.target.value as 'right' | 'left' | 'both'
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="right">Right Eye</option>
              <option value="left">Left Eye</option>
              <option value="both">Both Eyes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Urgency</label>
            <select
              value={surgeryRequest.urgency}
              onChange={(e) => setSurgeryRequest({
                ...surgeryRequest,
                urgency: e.target.value as 'routine' | 'urgent' | 'emergency'
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={surgeryRequest.notes}
              onChange={(e) => setSurgeryRequest({
                ...surgeryRequest,
                notes: e.target.value
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="Additional notes for the surgery request"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={4}
          placeholder="Any additional notes or observations..."
        />
      </div>
    </div>
  );
}