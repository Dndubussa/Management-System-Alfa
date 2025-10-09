// Supabase models for hospital management system

export const patientModel = {
  table: 'patients',
  fields: [
    'id',
    'mrn',
    'first_name',
    'last_name',
    'date_of_birth',
    'gender',
    'phone',
    'address',
    'emergency_contact_name',
    'emergency_contact_phone',
    'emergency_contact_relationship',
    'insurance_provider',
    'insurance_membership_number',
    'created_at',
    'updated_at'
  ]
};

export const medicalRecordModel = {
  table: 'medical_records',
  fields: [
    'id',
    'patient_id',
    'doctor_id',
    'visit_date',
    'chief_complaint',
    'diagnosis',
    'treatment',
    'notes',
    'blood_pressure',
    'heart_rate',
    'temperature',
    'weight',
    'height',
    'status'
  ]
};

export const prescriptionModel = {
  table: 'prescriptions',
  fields: [
    'id',
    'record_id',
    'patient_id',
    'doctor_id',
    'medication',
    'dosage',
    'frequency',
    'duration',
    'instructions',
    'status',
    'created_at'
  ]
};

export const labOrderModel = {
  table: 'lab_orders',
  fields: [
    'id',
    'record_id',
    'patient_id',
    'doctor_id',
    'test_name',
    'instructions',
    'status',
    'results',
    'created_at',
    'completed_at'
  ]
};

export const appointmentModel = {
  table: 'appointments',
  fields: [
    'id',
    'patient_id',
    'doctor_id',
    'date_time',
    'duration',
    'type',
    'status',
    'notes'
  ]
};

export const userModel = {
  table: 'users',
  fields: [
    'id',
    'name',
    'email',
    'role',
    'department'
  ]
};

export const notificationModel = {
  table: 'notifications',
  fields: [
    'id',
    'user_ids',
    'type',
    'title',
    'message',
    'is_read',
    'department',
    'created_at'
  ]
};

export const servicePriceModel = {
  table: 'service_prices',
  fields: [
    'id',
    'category',
    'service_name',
    'price',
    'description'
  ]
};

export const billModel = {
  table: 'bills',
  fields: [
    'id',
    'patient_id',
    'subtotal',
    'tax',
    'discount',
    'total',
    'status',
    'payment_method',
    'created_at',
    'paid_at'
  ]
};

export const billItemModel = {
  table: 'bill_items',
  fields: [
    'id',
    'bill_id',
    'service_id',
    'service_name',
    'category',
    'unit_price',
    'quantity',
    'total_price'
  ]
};

export const departmentModel = {
  table: 'departments',
  fields: [
    'id',
    'name',
    'description',
    'doctors'
  ]
};

export const referralModel = {
  table: 'referrals',
  fields: [
    'id',
    'patient_id',
    'referring_doctor_id',
    'specialist',
    'reason',
    'status',
    'notes',
    'created_at',
    'updated_at'
  ]
};

export const insuranceClaimModel = {
  table: 'insurance_claims',
  fields: [
    'id',
    'bill_id',
    'patient_id',
    'insurance_provider',
    'membership_number',
    'claim_amount',
    'claimed_amount',
    'status',
    'submission_date',
    'approval_date',
    'rejection_reason',
    'nhif_claim_number',
    'notes'
  ]
};

export const surgeryRequestModel = {
  table: 'surgery_requests',
  fields: [
    'id',
    'patient_id',
    'requesting_doctor_id',
    'surgery_type',
    'urgency',
    'requested_date',
    'status',
    'diagnosis',
    'notes',
    'emr_summary',
    'lab_results',
    'radiology_results',
    'asa_classification',
    'anesthesia_plan',
    'fasting_status',
    'pre_op_medications',
    'ot_room_id',
    'consent_form_signed',
    'created_at',
    'updated_at'
  ]
};

export const otSlotModel = {
  table: 'ot_slots',
  fields: [
    'id',
    'date',
    'start_time',
    'end_time',
    'ot_room_id',
    'surgery_request_id',
    'status',
    'notes'
  ]
};

export const otResourceModel = {
  table: 'ot_resources',
  fields: [
    'id',
    'type',
    'name',
    'specialty',
    'availability',
    'notes'
  ]
};

export const otChecklistModel = {
  table: 'ot_checklists',
  fields: [
    'id',
    'surgery_request_id',
    'status',
    'created_at',
    'updated_at'
  ]
};

export const otChecklistItemModel = {
  table: 'ot_checklist_items',
  fields: [
    'id',
    'checklist_id',
    'category',
    'description',
    'checked',
    'checked_by',
    'checked_at'
  ]
};

export const surgeryProgressModel = {
  table: 'surgery_progress',
  fields: [
    'id',
    'surgery_request_id',
    'status',
    'timestamp',
    'notes',
    'updated_by'
  ]
};

export const otReportModel = {
  table: 'ot_reports',
  fields: [
    'id',
    'date',
    'type',
    'total_surgeries',
    'emergency_surgeries',
    'elective_surgeries',
    'cancelled_surgeries',
    'postponed_surgeries',
    'complications',
    'mortality',
    'created_at'
  ]
};

export const otReportSurgeryModel = {
  table: 'ot_report_surgeries',
  fields: [
    'id',
    'report_id',
    'surgery_request_id',
    'surgery_type',
    'status',
    'complications',
    'notes'
  ]
};