import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { supabase } from '../config/supabase.js';

async function cleanup() {
	console.log('=== Cleanup Test Data ===');

	try {
		// Find test patient and user
		const { data: patient, error: patientFindError } = await supabase
			.from('patients')
			.select('id')
			.eq('mrn', 'TEST-001')
			.single();

		if (patientFindError && patientFindError.code !== 'PGRST116') {
			console.log('Patient lookup error:', patientFindError.message);
		}

		const { data: user, error: userFindError } = await supabase
			.from('users')
			.select('id')
			.eq('email', 'test@example.com')
			.single();

		if (userFindError && userFindError.code !== 'PGRST116') {
			console.log('User lookup error:', userFindError.message);
		}

		// Delete appointments referencing the test entities or tagged by notes
		if (patient?.id) {
			await supabase.from('appointments').delete().eq('patient_id', patient.id);
		}
		if (user?.id) {
			await supabase.from('appointments').delete().eq('doctor_id', user.id);
		}
		await supabase.from('appointments').delete().eq('notes', 'Test appointment');

		// Delete user and patient
		if (user?.id) {
			await supabase.from('users').delete().eq('id', user.id);
		}
		if (patient?.id) {
			await supabase.from('patients').delete().eq('id', patient.id);
		}

		console.log('✅ Cleanup completed');
		process.exit(0);
	} catch (err) {
		console.error('❌ Cleanup failed:', err.message);
		process.exit(1);
	}
}

cleanup();


