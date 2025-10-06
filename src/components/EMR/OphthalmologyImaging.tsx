import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Camera, Upload, Eye, X } from 'lucide-react';

export function OphthalmologyImaging() {
  const { patients, labOrders } = useHospital();
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [imageType, setImageType] = useState<'fundus' | 'oct' | 'visualField' | 'slitLamp'>('fundus');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  // Filter lab orders for the current ophthalmologist
  const doctorLabOrders = labOrders.filter(order => order.doctorId === user?.id);
  
  // Filter imaging orders
  const imagingOrders = doctorLabOrders.filter(order => 
    order.testName.toLowerCase().includes('oct') || 
    order.testName.toLowerCase().includes('visual field') || 
    order.testName.toLowerCase().includes('fundus') ||
    order.testName.toLowerCase().includes('slit lamp')
  );

  // Filter patients who have imaging orders
  const patientsWithImaging = patients.filter(patient => 
    imagingOrders.some(order => order.patientId === patient.id)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!imageFile || !selectedPatientId) return;
    
    setUploadStatus('uploading');
    
    // Simulate upload process
    setTimeout(() => {
      setUploadStatus('success');
      setUploadedImages([
        ...uploadedImages,
        {
          id: Date.now().toString(),
          patientId: selectedPatientId,
          type: imageType,
          fileName: imageFile.name,
          uploadDate: new Date().toISOString(),
          url: imagePreview
        }
      ]);
      
      // Reset form
      setImageFile(null);
      setImagePreview(null);
      
      // Reset upload status after delay
      setTimeout(() => setUploadStatus('idle'), 2000);
    }, 1500);
  };

  const removeImage = (id: string) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== id));
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getImageTypeName = (type: string) => {
    switch (type) {
      case 'fundus': return 'Fundus Photography';
      case 'oct': return 'OCT Scan';
      case 'visualField': return 'Visual Field Test';
      case 'slitLamp': return 'Slit Lamp Photography';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Camera className="w-6 h-6 text-blue-500 mr-2" />
          Ophthalmology Imaging
        </h1>
        <p className="text-gray-600">
          Upload and manage ophthalmology imaging studies
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Image</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Patient
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Choose a patient</option>
              {patientsWithImaging.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName} (ID: {patient.id})
                </option>
              ))}
            </select>
          </div>
          
          {/* Image Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Type
            </label>
            <select
              value={imageType}
              onChange={(e) => setImageType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="fundus">Fundus Photography</option>
              <option value="oct">OCT Scan</option>
              <option value="visualField">Visual Field Test</option>
              <option value="slitLamp">Slit Lamp Photography</option>
            </select>
          </div>
          
          {/* File Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image File
            </label>
            <div className="flex items-center">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4 relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-48 rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {/* Upload Button */}
          <div className="md:col-span-2">
            <button
              onClick={handleUpload}
              disabled={!selectedPatientId || !imageFile || uploadStatus === 'uploading'}
              className={`w-full px-4 py-2 rounded-md text-white ${
                !selectedPatientId || !imageFile || uploadStatus === 'uploading'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Image'}
            </button>
            
            {uploadStatus === 'success' && (
              <div className="mt-2 text-green-600 text-center">
                Image uploaded successfully!
              </div>
            )}
            
            {uploadStatus === 'error' && (
              <div className="mt-2 text-red-600 text-center">
                Upload failed. Please try again.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Imaging Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Imaging Orders</h2>
        
        {imagingOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No pending imaging orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordered Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {imagingOrders.map(order => {
                  const patient = patients.find(p => p.id === order.patientId);
                  return (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {order.patientId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.testName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Uploaded Images */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Images</h2>
        
        {uploadedImages.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map(image => (
              <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative">
                  {image.url && (
                    <img 
                      src={image.url} 
                      alt={getImageTypeName(image.type)} 
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3">
                  <div className="flex items-center mb-1">
                    <Eye className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      {getImageTypeName(image.type)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {getPatientName(image.patientId)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(image.uploadDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}