-- Audit Trail Functions Setup
-- This script creates all the audit trail functions AFTER the tables exist

-- ==============================================
-- AUDIT TRIGGER FUNCTIONS
-- ==============================================

-- Function to create audit log entry
create or replace function create_audit_log(
  p_table_name text,
  p_record_id uuid,
  p_operation text,
  p_old_values jsonb default null,
  p_new_values jsonb default null,
  p_user_id uuid default null,
  p_reason text default null,
  p_notes text default null,
  p_severity text default 'LOW',
  p_department text default null,
  p_patient_id uuid default null
)
returns void as $$
begin
  insert into audit_logs (
    table_name,
    record_id,
    operation,
    old_values,
    new_values,
    user_id,
    user_name,
    user_role,
    reason,
    notes,
    severity,
    department,
    patient_id
  ) values (
    p_table_name,
    p_record_id,
    p_operation,
    p_old_values,
    p_new_values,
    p_user_id,
    (select name from users where id = p_user_id),
    (select role from users where id = p_user_id),
    p_reason,
    p_notes,
    p_severity,
    p_department,
    p_patient_id
  );
end;
$$ language plpgsql;

-- Function to log prescription activities
create or replace function log_prescription_activity(
  p_prescription_id uuid,
  p_action text,
  p_old_status text default null,
  p_new_status text default null,
  p_notes text default null,
  p_reason text default null
)
returns void as $$
declare
  v_patient_id uuid;
  v_doctor_id uuid;
  v_medication_name text;
  v_dosage text;
  v_quantity integer;
  v_performed_by uuid;
begin
  -- Get prescription details
  select patient_id, doctor_id, medication, dosage, quantity
  into v_patient_id, v_doctor_id, v_medication_name, v_dosage, v_quantity
  from prescriptions
  where id = p_prescription_id;
  
  -- Get current user (you'll need to implement this based on your auth system)
  v_performed_by := auth.uid();
  
  insert into prescription_audit_logs (
    prescription_id,
    patient_id,
    doctor_id,
    action,
    old_status,
    new_status,
    medication_name,
    dosage,
    quantity,
    notes,
    performed_by,
    performed_by_name,
    performed_by_role,
    reason
  ) values (
    p_prescription_id,
    v_patient_id,
    v_doctor_id,
    p_action,
    p_old_status,
    p_new_status,
    v_medication_name,
    v_dosage,
    v_quantity,
    p_notes,
    v_performed_by,
    (select name from users where id = v_performed_by),
    (select role from users where id = v_performed_by),
    p_reason
  );
end;
$$ language plpgsql;

-- Function to log patient data access
create or replace function log_patient_access(
  p_patient_id uuid,
  p_access_type text,
  p_data_accessed text[],
  p_purpose text default null,
  p_notes text default null
)
returns void as $$
declare
  v_patient_name text;
  v_accessed_by uuid;
begin
  -- Get patient name
  select concat(first_name, ' ', last_name) into v_patient_name
  from patients where id = p_patient_id;
  
  -- Get current user
  v_accessed_by := auth.uid();
  
  insert into patient_access_logs (
    patient_id,
    patient_name,
    accessed_by,
    accessed_by_name,
    accessed_by_role,
    access_type,
    data_accessed,
    purpose,
    notes
  ) values (
    p_patient_id,
    v_patient_name,
    v_accessed_by,
    (select name from users where id = v_accessed_by),
    (select role from users where id = v_accessed_by),
    p_access_type,
    p_data_accessed,
    p_purpose,
    p_notes
  );
end;
$$ language plpgsql;

-- ==============================================
-- COMPLIANCE REPORTING FUNCTIONS
-- ==============================================

-- Function to get audit trail for a specific patient
create or replace function get_patient_audit_trail(p_patient_id uuid, p_days integer default 30)
returns table (
  audit_timestamp timestamp with time zone,
  table_name text,
  operation text,
  user_name text,
  user_role text,
  details text
) as $$
begin
  return query
  select 
    al.timestamp as audit_timestamp,
    al.table_name,
    al.operation,
    al.user_name,
    al.user_role,
    case 
      when al.operation = 'INSERT' then 'Record created'
      when al.operation = 'UPDATE' then 'Record modified'
      when al.operation = 'DELETE' then 'Record deleted'
      when al.operation = 'VIEW' then 'Record viewed'
      else al.operation
    end as details
  from audit_logs al
  where al.patient_id = p_patient_id
    and al.timestamp >= now() - interval '1 day' * p_days
  order by al.timestamp desc;
end;
$$ language plpgsql;

-- Function to get prescription audit trail
create or replace function get_prescription_audit_trail(p_prescription_id uuid)
returns table (
  audit_timestamp timestamp with time zone,
  action text,
  performed_by_name text,
  performed_by_role text,
  old_status text,
  new_status text,
  notes text
) as $$
begin
  return query
  select 
    pal.timestamp as audit_timestamp,
    pal.action,
    pal.performed_by_name,
    pal.performed_by_role,
    pal.old_status,
    pal.new_status,
    pal.notes
  from prescription_audit_logs pal
  where pal.prescription_id = p_prescription_id
  order by pal.timestamp desc;
end;
$$ language plpgsql;

-- Function to get user activity report
create or replace function get_user_activity_report(p_user_id uuid, p_days integer default 30)
returns table (
  audit_timestamp timestamp with time zone,
  activity_type text,
  table_name text,
  operation text,
  patient_name text,
  details text
) as $$
begin
  return query
  select 
    al.timestamp as audit_timestamp,
    'Data Access' as activity_type,
    al.table_name,
    al.operation,
    concat(p.first_name, ' ', p.last_name) as patient_name,
    case 
      when al.operation = 'INSERT' then 'Created new record'
      when al.operation = 'UPDATE' then 'Modified existing record'
      when al.operation = 'DELETE' then 'Deleted record'
      when al.operation = 'VIEW' then 'Viewed record'
      else al.operation
    end as details
  from audit_logs al
  left join patients p on al.patient_id = p.id
  where al.user_id = p_user_id
    and al.timestamp >= now() - interval '1 day' * p_days
  order by al.timestamp desc;
end;
$$ language plpgsql;

-- Function to get comprehensive audit trail for a patient
create or replace function get_patient_complete_audit_trail(
  p_patient_id uuid,
  p_start_date date default null,
  p_end_date date default null
)
returns table (
  log_type text,
  audit_timestamp timestamp with time zone,
  action text,
  user_name text,
  user_role text,
  details jsonb,
  table_name text,
  record_id uuid
) as $$
begin
  return query
  -- General audit logs
  select 
    'General'::text as log_type,
    al.timestamp as audit_timestamp,
    al.operation as action,
    al.user_name,
    al.user_role,
    jsonb_build_object(
      'old_values', al.old_values,
      'new_values', al.new_values,
      'reason', al.reason,
      'notes', al.notes
    ) as details,
    al.table_name,
    al.record_id
  from audit_logs al
  where al.patient_id = p_patient_id
    and (p_start_date is null or al.timestamp::date >= p_start_date)
    and (p_end_date is null or al.timestamp::date <= p_end_date)
  
  union all
  
  -- Prescription audit logs
  select 
    'Prescription'::text as log_type,
    pal.timestamp as audit_timestamp,
    pal.action,
    pal.performed_by_name as user_name,
    pal.performed_by_role as user_role,
    jsonb_build_object(
      'medication_name', pal.medication_name,
      'dosage', pal.dosage,
      'quantity', pal.quantity,
      'old_status', pal.old_status,
      'new_status', pal.new_status,
      'notes', pal.notes,
      'reason', pal.reason
    ) as details,
    'prescriptions'::text as table_name,
    pal.prescription_id as record_id
  from prescription_audit_logs pal
  where pal.patient_id = p_patient_id
    and (p_start_date is null or pal.timestamp::date >= p_start_date)
    and (p_end_date is null or pal.timestamp::date <= p_end_date)
  
  union all
  
  -- Medical record audit logs
  select 
    'Medical Record'::text as log_type,
    mral.timestamp as audit_timestamp,
    mral.action,
    mral.performed_by_name as user_name,
    mral.performed_by_role as user_role,
    jsonb_build_object(
      'record_type', mral.record_type,
      'diagnosis', mral.diagnosis,
      'treatment', mral.treatment,
      'notes', mral.notes,
      'reason', mral.reason
    ) as details,
    'medical_records'::text as table_name,
    mral.medical_record_id as record_id
  from medical_record_audit_logs mral
  where mral.patient_id = p_patient_id
    and (p_start_date is null or mral.timestamp::date >= p_start_date)
    and (p_end_date is null or mral.timestamp::date <= p_end_date)
  
  union all
  
  -- Patient access logs
  select 
    'Access'::text as log_type,
    pal.timestamp as audit_timestamp,
    pal.access_type as action,
    pal.accessed_by_name as user_name,
    pal.accessed_by_role as user_role,
    jsonb_build_object(
      'data_accessed', pal.data_accessed,
      'purpose', pal.purpose,
      'notes', pal.notes,
      'duration_seconds', pal.duration_seconds
    ) as details,
    'patients'::text as table_name,
    pal.patient_id as record_id
  from patient_access_logs pal
  where pal.patient_id = p_patient_id
    and (p_start_date is null or pal.timestamp::date >= p_start_date)
    and (p_end_date is null or pal.timestamp::date <= p_end_date)
  
  order by audit_timestamp desc;
end;
$$ language plpgsql;

-- Function to get user activity summary
create or replace function get_user_activity_summary(
  p_user_id uuid,
  p_days integer default 30
)
returns table (
  activity_type text,
  count bigint,
  last_activity timestamp with time zone
) as $$
begin
  return query
  select 
    'Data Access'::text as activity_type,
    count(*) as count,
    max(al.timestamp) as last_activity
  from audit_logs al
  where al.user_id = p_user_id
    and al.timestamp >= now() - interval '1 day' * p_days
  
  union all
  
  select 
    'Prescription Activities'::text as activity_type,
    count(*) as count,
    max(pal.timestamp) as last_activity
  from prescription_audit_logs pal
  where pal.performed_by = p_user_id
    and pal.timestamp >= now() - interval '1 day' * p_days
  
  union all
  
  select 
    'Patient Access'::text as activity_type,
    count(*) as count,
    max(pal.timestamp) as last_activity
  from patient_access_logs pal
  where pal.accessed_by = p_user_id
    and pal.timestamp >= now() - interval '1 day' * p_days
  
  union all
  
  select 
    'Authentication'::text as activity_type,
    count(*) as count,
    max(aal.timestamp) as last_activity
  from auth_audit_logs aal
  where aal.user_id = p_user_id
    and aal.timestamp >= now() - interval '1 day' * p_days;
end;
$$ language plpgsql;

-- Function to get compliance violations
create or replace function get_compliance_violations(
  p_start_date date default null,
  p_end_date date default null
)
returns table (
  violation_type text,
  severity text,
  user_name text,
  user_role text,
  audit_timestamp timestamp with time zone,
  details text,
  patient_name text
) as $$
begin
  return query
  -- Failed login attempts
  select 
    'Failed Login Attempt'::text as violation_type,
    'HIGH'::text as severity,
    aal.username as user_name,
    (select role from users where name = aal.username) as user_role,
    aal.timestamp as audit_timestamp,
    'Failed login attempt: ' || aal.failure_reason as details,
    null::text as patient_name
  from auth_audit_logs aal
  where aal.success = false
    and (p_start_date is null or aal.timestamp::date >= p_start_date)
    and (p_end_date is null or aal.timestamp::date <= p_end_date)
  
  union all
  
  -- Unauthorized patient access
  select 
    'Unauthorized Patient Access'::text as violation_type,
    'CRITICAL'::text as severity,
    pal.accessed_by_name as user_name,
    pal.accessed_by_role as user_role,
    pal.timestamp as audit_timestamp,
    'Accessed patient data without proper authorization' as details,
    pal.patient_name
  from patient_access_logs pal
  where pal.purpose not in ('Treatment', 'Billing', 'Administrative')
    and (p_start_date is null or pal.timestamp::date >= p_start_date)
    and (p_end_date is null or pal.timestamp::date <= p_end_date)
  
  union all
  
  -- Controlled substance violations
  select 
    'Controlled Substance Violation'::text as violation_type,
    'CRITICAL'::text as severity,
    ial.performed_by_name as user_name,
    ial.performed_by_role as user_role,
    ial.timestamp as audit_timestamp,
    'Controlled substance transaction without proper authorization' as details,
    p.first_name || ' ' || p.last_name as patient_name
  from inventory_audit_logs ial
  left join patients p on ial.patient_id = p.id
  where ial.controlled_substance = true
    and ial.performed_by_role not in ('pharmacy', 'admin', 'doctor')
    and (p_start_date is null or ial.timestamp::date >= p_start_date)
    and (p_end_date is null or ial.timestamp::date <= p_end_date)
  
  order by audit_timestamp desc;
end;
$$ language plpgsql;

-- Function to get audit trail statistics
create or replace function get_audit_trail_statistics(
  p_days integer default 30
)
returns table (
  metric_name text,
  metric_value bigint,
  description text
) as $$
begin
  return query
  select 
    'Total Audit Entries'::text as metric_name,
    count(*) as metric_value,
    'Total number of audit log entries' as description
  from audit_logs
  where audit_logs.timestamp >= now() - interval '1 day' * p_days
  
  union all
  
  select 
    'Patient Data Accesses'::text as metric_name,
    count(*) as metric_value,
    'Number of patient data access events' as description
  from patient_access_logs
  where patient_access_logs.timestamp >= now() - interval '1 day' * p_days
  
  union all
  
  select 
    'Prescription Activities'::text as metric_name,
    count(*) as metric_value,
    'Number of prescription-related activities' as description
  from prescription_audit_logs
  where prescription_audit_logs.timestamp >= now() - interval '1 day' * p_days
  
  union all
  
  select 
    'Failed Login Attempts'::text as metric_name,
    count(*) as metric_value,
    'Number of failed login attempts' as description
  from auth_audit_logs
  where success = false
    and auth_audit_logs.timestamp >= now() - interval '1 day' * p_days
  
  union all
  
  select 
    'Controlled Substance Transactions'::text as metric_name,
    count(*) as metric_value,
    'Number of controlled substance transactions' as description
  from inventory_audit_logs
  where controlled_substance = true
    and inventory_audit_logs.timestamp >= now() - interval '1 day' * p_days;
end;
$$ language plpgsql;

-- Function to export audit trail for compliance
create or replace function export_audit_trail_for_compliance(
  p_start_date date,
  p_end_date date,
  p_audit_type text default 'ALL'
)
returns table (
  export_data jsonb
) as $$
begin
  return query
  select jsonb_build_object(
    'export_info', jsonb_build_object(
      'start_date', p_start_date,
      'end_date', p_end_date,
      'audit_type', p_audit_type,
      'exported_at', now(),
      'exported_by', (select name from users where id = auth.uid())
    ),
    'audit_logs', (
      select jsonb_agg(
        jsonb_build_object(
          'id', al.id,
          'table_name', al.table_name,
          'record_id', al.record_id,
          'operation', al.operation,
          'user_name', al.user_name,
          'user_role', al.user_role,
          'timestamp', al.timestamp,
          'old_values', al.old_values,
          'new_values', al.new_values,
          'reason', al.reason,
          'notes', al.notes
        )
      )
      from audit_logs al
      where al.timestamp::date >= p_start_date
        and al.timestamp::date <= p_end_date
        and (p_audit_type = 'ALL' or al.table_name = p_audit_type)
    ),
    'patient_access_logs', (
      select jsonb_agg(
        jsonb_build_object(
          'id', pal.id,
          'patient_id', pal.patient_id,
          'patient_name', pal.patient_name,
          'accessed_by_name', pal.accessed_by_name,
          'accessed_by_role', pal.accessed_by_role,
          'access_type', pal.access_type,
          'data_accessed', pal.data_accessed,
          'purpose', pal.purpose,
          'timestamp', pal.timestamp,
          'ip_address', pal.ip_address
        )
      )
      from patient_access_logs pal
      where pal.timestamp::date >= p_start_date
        and pal.timestamp::date <= p_end_date
    ),
    'prescription_audit_logs', (
      select jsonb_agg(
        jsonb_build_object(
          'id', pal.id,
          'prescription_id', pal.prescription_id,
          'patient_id', pal.patient_id,
          'action', pal.action,
          'medication_name', pal.medication_name,
          'performed_by_name', pal.performed_by_name,
          'performed_by_role', pal.performed_by_role,
          'old_status', pal.old_status,
          'new_status', pal.new_status,
          'timestamp', pal.timestamp,
          'reason', pal.reason
        )
      )
      from prescription_audit_logs pal
      where pal.timestamp::date >= p_start_date
        and pal.timestamp::date <= p_end_date
    )
  ) as export_data;
end;
$$ language plpgsql;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- ✅ STEP 2 COMPLETE: AUDIT TRAIL FUNCTIONS CREATED
-- 
-- Your audit trail functions are now created:
-- 
-- **Core Functions:**
-- ✅ create_audit_log() - Manual audit log creation
-- ✅ log_prescription_activity() - Prescription activity tracking
-- ✅ log_patient_access() - Patient data access logging
-- 
-- **Reporting Functions:**
-- ✅ get_patient_audit_trail() - Patient audit history
-- ✅ get_prescription_audit_trail() - Prescription audit trail
-- ✅ get_user_activity_report() - User activity analysis
-- ✅ get_patient_complete_audit_trail() - Complete patient audit
-- ✅ get_user_activity_summary() - User activity summary
-- ✅ get_compliance_violations() - Compliance violation detection
-- ✅ get_audit_trail_statistics() - System audit statistics
-- ✅ export_audit_trail_for_compliance() - Regulatory export
-- 
-- **Next Steps:**
-- 1. Run setup-audit-trail-triggers.sql to add automatic triggers
-- 2. Test the complete system
-- 
-- **Ready for Triggers!** 🏥📋✅
