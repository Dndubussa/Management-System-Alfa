import { useHospital } from '../context/HospitalContext';
import { Bill, BillItem } from '../types';

export function useConsultationBilling() {
  const { addBill, patients } = useHospital();

  const createConsultationBill = async (
    patientId: string,
    appointmentId: string | undefined,
    serviceName: string,
    price: number,
    appointmentType: string,
    additionalNotes?: string
  ) => {
    try {
      const patient = patients.find(p => p.id === patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Create bill item for consultation
      const consultationItem: BillItem = {
        id: `consultation-${Date.now()}`,
        serviceId: `service-${Date.now()}`,
        serviceName,
        category: 'consultation',
        unitPrice: price,
        quantity: 1,
        totalPrice: price
      };

      // Create bill for consultation
      const consultationBill: Omit<Bill, 'id' | 'createdAt'> = {
        patientId,
        items: [consultationItem],
        subtotal: price,
        tax: 0,
        discount: 0,
        total: price,
        status: 'pending',
        paymentMethod: 'cash'
      };

      await addBill(consultationBill);
      console.log('Automatic billing created for consultation:', consultationBill);
      return consultationBill;
    } catch (error) {
      console.error('Failed to create automatic billing:', error);
      throw error;
    }
  };

  return {
    createConsultationBill
  };
}
