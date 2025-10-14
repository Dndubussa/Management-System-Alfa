import { useHospital } from '../context/HospitalContext';
import { Bill, BillItem } from '../types';

interface ServiceBillingItem {
  serviceName: string;
  category: string;
  price: number;
  quantity: number;
}

export function useServiceBilling() {
  const { addBill, patients, servicePrices } = useHospital();

  // Find service price from the hospital price list
  const findServicePrice = (serviceName: string, category?: string): number => {
    const normalizedName = serviceName.toLowerCase().trim();
    
    // First try exact match
    let service = servicePrices.find(s => 
      s.serviceName.toLowerCase().trim() === normalizedName
    );
    
    // If no exact match, try partial match
    if (!service) {
      service = servicePrices.find(s => 
        s.serviceName.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(s.serviceName.toLowerCase())
      );
    }
    
    // If still no match and category is provided, try category-based matching
    if (!service && category) {
      const categoryServices = servicePrices.filter(s => s.category === category);
      service = categoryServices.find(s => 
        s.serviceName.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(s.serviceName.toLowerCase())
      );
    }
    
    return service ? service.price : 0;
  };

  // Create bill for multiple services
  const createServiceBill = async (
    patientId: string,
    services: ServiceBillingItem[],
    appointmentId?: string,
    additionalNotes?: string
  ) => {
    try {
      const patient = patients.find(p => p.id === patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Calculate total cost
      const totalCost = services.reduce((sum, service) => 
        sum + (service.price * service.quantity), 0
      );

      if (totalCost === 0) {
        console.log('No services to bill or all services have zero cost');
        return null;
      }

      // Create bill items
      const billItems: BillItem[] = services.map((service, index) => ({
        id: `service-${Date.now()}-${index}`,
        serviceId: `service-${Date.now()}-${index}`,
        serviceName: service.serviceName,
        category: service.category,
        unitPrice: service.price,
        quantity: service.quantity,
        totalPrice: service.price * service.quantity
      }));

      // Create bill
      const serviceBill: Omit<Bill, 'id' | 'createdAt'> = {
        patientId,
        items: billItems,
        subtotal: totalCost,
        tax: 0,
        discount: 0,
        total: totalCost,
        status: 'pending',
        paymentMethod: 'cash'
      };

      await addBill(serviceBill);
      console.log('Service billing created:', serviceBill);
      return serviceBill;
    } catch (error) {
      console.error('Failed to create service billing:', error);
      throw error;
    }
  };

  // Create bill for lab tests
  const createLabTestBill = async (
    patientId: string,
    labTests: { testName: string; instructions?: string }[],
    appointmentId?: string
  ) => {
    const services: ServiceBillingItem[] = labTests.map(test => ({
      serviceName: test.testName,
      category: 'lab-test',
      price: findServicePrice(test.testName, 'lab-test'),
      quantity: 1
    }));

    return createServiceBill(
      patientId, 
      services, 
      appointmentId, 
      `Lab tests: ${labTests.map(t => t.testName).join(', ')}`
    );
  };

  // Create bill for medications
  const createMedicationBill = async (
    patientId: string,
    medications: { medication: string; dosage: string; quantity?: number }[],
    appointmentId?: string
  ) => {
    const services: ServiceBillingItem[] = medications.map(med => ({
      serviceName: med.medication,
      category: 'medication',
      price: findServicePrice(med.medication, 'medication'),
      quantity: med.quantity || 1
    }));

    return createServiceBill(
      patientId, 
      services, 
      appointmentId, 
      `Medications: ${medications.map(m => m.medication).join(', ')}`
    );
  };

  // Create bill for procedures/surgeries
  const createProcedureBill = async (
    patientId: string,
    procedures: { procedureName: string; notes?: string }[],
    appointmentId?: string
  ) => {
    const services: ServiceBillingItem[] = procedures.map(proc => ({
      serviceName: proc.procedureName,
      category: 'procedure',
      price: findServicePrice(proc.procedureName, 'procedure'),
      quantity: 1
    }));

    return createServiceBill(
      patientId, 
      services, 
      appointmentId, 
      `Procedures: ${procedures.map(p => p.procedureName).join(', ')}`
    );
  };

  // Create bill for radiology services
  const createRadiologyBill = async (
    patientId: string,
    radiologyServices: { serviceName: string; instructions?: string }[],
    appointmentId?: string
  ) => {
    const services: ServiceBillingItem[] = radiologyServices.map(service => ({
      serviceName: service.serviceName,
      category: 'radiology',
      price: findServicePrice(service.serviceName, 'radiology'),
      quantity: 1
    }));

    return createServiceBill(
      patientId, 
      services, 
      appointmentId, 
      `Radiology: ${radiologyServices.map(s => s.serviceName).join(', ')}`
    );
  };

  return {
    findServicePrice,
    createServiceBill,
    createLabTestBill,
    createMedicationBill,
    createProcedureBill,
    createRadiologyBill
  };
}
