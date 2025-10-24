// Test script to check data fetching in browser environment
// Run this in the browser console

async function testBrowserDataFetch() {
  try {
    console.log('🔍 Testing browser data fetching...');
    
    // Get current origin
    const origin = window.location.origin;
    console.log('📍 Current origin:', origin);
    
    // Test fetching patients through the API
    console.log('👥 Testing patients API endpoint...');
    const patientsResponse = await fetch(`${origin}/api/patients`);
    console.log('📋 Patients response status:', patientsResponse.status);
    
    if (patientsResponse.ok) {
      const patients = await patientsResponse.json();
      console.log(`✅ Successfully fetched ${patients.length} patients`);
      console.log('📋 Sample patient:', patients[0]);
    } else {
      const errorText = await patientsResponse.text();
      console.error('❌ Error fetching patients:', errorText);
    }
    
    // Test fetching appointments
    console.log('📅 Testing appointments API endpoint...');
    const appointmentsResponse = await fetch(`${origin}/api/appointments`);
    console.log('📋 Appointments response status:', appointmentsResponse.status);
    
    if (appointmentsResponse.ok) {
      const appointments = await appointmentsResponse.json();
      console.log(`✅ Successfully fetched ${appointments.length} appointments`);
    } else {
      const errorText = await appointmentsResponse.text();
      console.error('❌ Error fetching appointments:', errorText);
    }
    
    // Test fetching service prices
    console.log('💰 Testing service prices API endpoint...');
    const pricesResponse = await fetch(`${origin}/api/service-prices`);
    console.log('📋 Service prices response status:', pricesResponse.status);
    
    if (pricesResponse.ok) {
      const prices = await pricesResponse.json();
      console.log(`✅ Successfully fetched ${prices.length} service prices`);
    } else {
      const errorText = await pricesResponse.text();
      console.error('❌ Error fetching service prices:', errorText);
    }
    
    // Test the vital signs endpoint specifically
    console.log('💓 Testing vital signs endpoint...');
    const vitalSignsResponse = await fetch(`${origin}/api/vital-signs/1/latest`);
    console.log('📋 Vital signs response status:', vitalSignsResponse.status);
    
    if (vitalSignsResponse.ok) {
      const vitalSigns = await vitalSignsResponse.json();
      console.log('✅ Successfully fetched latest vital signs:', vitalSigns);
    } else {
      const errorText = await vitalSignsResponse.text();
      console.error('❌ Error fetching vital signs:', errorText);
    }
    
    console.log('🎉 Browser data fetch test completed!');
    
  } catch (error) {
    console.error('💥 Error during browser data fetch test:', error);
  }
}

// Run the test
testBrowserDataFetch();