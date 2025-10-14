import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface ConsultationCostDisplayProps {
  appointmentType: 'consultation' | 'follow-up' | 'emergency';
  doctorId?: string;
  department?: string;
  onCostCalculated?: (cost: number, serviceName: string) => void;
  showBreakdown?: boolean;
  className?: string;
}

export function ConsultationCostDisplay({ 
  appointmentType, 
  doctorId, 
  department, 
  onCostCalculated,
  showBreakdown = true,
  className = ''
}: ConsultationCostDisplayProps) {
  const { servicePrices, users } = useHospital();
  const [consultationCost, setConsultationCost] = useState<number>(0);
  const [consultationService, setConsultationService] = useState<string>('');
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  // Calculate consultation cost based on appointment type and doctor from hospital price list
  const calculateConsultationCost = () => {
    if (!appointmentType) return { cost: 0, serviceName: '' };
    
    // Get the selected doctor to determine their specialty
    const selectedDoctor = doctorId ? users.find(user => user.id === doctorId) : null;
    const doctorSpecialty = selectedDoctor?.department?.toLowerCase() || department?.toLowerCase() || '';
    
    // Define consultation services based on appointment type
    // These are for seeing a doctor in their department before any tests or prescriptions
    let consultationServices = [];
    
    if (appointmentType === 'consultation') {
      // Look for actual doctor consultation services (not procedures or medications)
      consultationServices = servicePrices.filter(service => {
        const serviceName = service.serviceName.toLowerCase();
        
        // Exclude medications, procedures, and tests - only consultation fees
        if (serviceName.includes('injection') || 
            serviceName.includes('tablet') || 
            serviceName.includes('capsule') ||
            serviceName.includes('syrup') ||
            serviceName.includes('ointment') ||
            serviceName.includes('drops') ||
            serviceName.includes('surgery') ||
            serviceName.includes('operation') ||
            serviceName.includes('test') ||
            serviceName.includes('x-ray') ||
            serviceName.includes('ultrasound') ||
            serviceName.includes('blood') ||
            serviceName.includes('urine') ||
            serviceName.includes('biopsy') ||
            serviceName.includes('scan')) {
          return false;
        }
        
        // Look for actual consultation services
        if (serviceName.includes('specialist') && 
            (serviceName.includes('2/wk') || serviceName.includes('weekly'))) {
          return true;
        }
        if (serviceName.includes('super specialist')) {
          return true;
        }
        if (serviceName.includes('consultation')) {
          return true;
        }
        if (serviceName.includes('doctor') && !serviceName.includes('visit')) {
          return true;
        }
        if (serviceName.includes('physician')) {
          return true;
        }
        
        return false;
      });
    } else if (appointmentType === 'follow-up') {
      // Look for follow-up consultation services
      consultationServices = servicePrices.filter(service => {
        const serviceName = service.serviceName.toLowerCase();
        return serviceName.includes('follow') && 
               serviceName.includes('assessment');
      });
    } else if (appointmentType === 'emergency') {
      // Look for emergency consultation services
      consultationServices = servicePrices.filter(service => {
        const serviceName = service.serviceName.toLowerCase();
        return serviceName.includes('emergency') && 
               !serviceName.includes('pulpotomy') && // Exclude dental procedures
               !serviceName.includes('surgery');
      });
    }
    
    // Return the first matching consultation service
    if (consultationServices.length > 0) {
      return { 
        cost: consultationServices[0].price, 
        serviceName: consultationServices[0].serviceName 
      };
    }
    
    // Fallback: Use the most appropriate general consultation service
    const generalConsultation = servicePrices.find(service => {
      const serviceName = service.serviceName.toLowerCase();
      return serviceName.includes('specialist') && 
             serviceName.includes('2/wk');
    });
    
    if (generalConsultation) {
      return { 
        cost: generalConsultation.price, 
        serviceName: generalConsultation.serviceName 
      };
    }
    
    // Last resort: return 0 if no consultation services found
    return { cost: 0, serviceName: '' };
  };

  // Update consultation cost when props change
  useEffect(() => {
    const result = calculateConsultationCost();
    setConsultationCost(result.cost);
    setConsultationService(result.serviceName);
    
    // Notify parent component of the calculated cost
    if (onCostCalculated) {
      onCostCalculated(result.cost, result.serviceName);
    }
  }, [appointmentType, doctorId, department, servicePrices]);

  // Don't render if no cost calculated
  if (consultationCost === 0) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-medium text-blue-800">Consultation Cost</h3>
        </div>
        {showBreakdown && (
          <button
            type="button"
            onClick={() => setShowCostBreakdown(!showCostBreakdown)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showCostBreakdown ? 'Hide Details' : 'Show Details'}
          </button>
        )}
      </div>
      
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {consultationService || `${appointmentType.charAt(0).toUpperCase() + appointmentType.slice(1)} Consultation`}
          </span>
          <span className="text-lg font-semibold text-blue-900">
            {consultationCost.toLocaleString()} TZS
          </span>
        </div>
        
        {showBreakdown && showCostBreakdown && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="text-xs text-blue-600 space-y-1">
              <p>• This is the consultation fee for seeing the doctor in their department</p>
              <p>• Additional costs for tests, medications, or procedures will be billed separately</p>
              <p>• This cost will be automatically billed when the appointment is scheduled</p>
              <p>• Payment can be made at the cashier's desk</p>
              <p>• Insurance claims can be processed separately</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
