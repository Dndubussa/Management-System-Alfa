import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeComplianceScript() {
  try {
    console.log('🚀 Executing Ministry Compliance Script...');
    
    // Step 1: Add ICD-10 sample data
    console.log('📝 Adding ICD-10 sample data...');
    const icd10Data = [
      { code: 'A00', description: 'Cholera', category: 'Infectious and parasitic diseases', subcategory: 'Intestinal infectious diseases' },
      { code: 'A01', description: 'Typhoid and paratyphoid fevers', category: 'Infectious and parasitic diseases', subcategory: 'Intestinal infectious diseases' },
      { code: 'A02', description: 'Other salmonella infections', category: 'Infectious and parasitic diseases', subcategory: 'Intestinal infectious diseases' },
      { code: 'A03', description: 'Shigellosis', category: 'Infectious and parasitic diseases', subcategory: 'Intestinal infectious diseases' },
      { code: 'A04', description: 'Other bacterial intestinal infections', category: 'Infectious and parasitic diseases', subcategory: 'Intestinal infectious diseases' },
      { code: 'A05', description: 'Other bacterial foodborne intoxications', category: 'Infectious and parasitic diseases', subcategory: 'Intestinal infectious diseases' },
      { code: 'A06', description: 'Amebiasis', category: 'Infectious and parasitic diseases', subcategory: 'Intestinal infectious diseases' },
      { code: 'A07', description: 'Other protozoal intestinal diseases', category: 'Infectious and parasitic diseases', subcategory: 'Intestinal infectious diseases' },
      { code: 'A08', description: 'Viral and other specified intestinal infections', category: 'Infectious and parasitic diseases', subcategory: 'Intestinal infectious diseases' },
      { code: 'A09', description: 'Diarrhea and gastroenteritis of presumed infectious origin', category: 'Infectious and parasitic diseases', subcategory: 'Intestinal infectious diseases' },
      { code: 'B50', description: 'Plasmodium falciparum malaria', category: 'Infectious and parasitic diseases', subcategory: 'Protozoal diseases' },
      { code: 'B51', description: 'Plasmodium vivax malaria', category: 'Infectious and parasitic diseases', subcategory: 'Protozoal diseases' },
      { code: 'B52', description: 'Plasmodium malariae malaria', category: 'Infectious and parasitic diseases', subcategory: 'Protozoal diseases' },
      { code: 'B53', description: 'Other specified malaria', category: 'Infectious and parasitic diseases', subcategory: 'Protozoal diseases' },
      { code: 'B54', description: 'Unspecified malaria', category: 'Infectious and parasitic diseases', subcategory: 'Protozoal diseases' },
      { code: 'B20', description: 'Human immunodeficiency virus [HIV] disease', category: 'Infectious and parasitic diseases', subcategory: 'Viral diseases' },
      { code: 'A15', description: 'Respiratory tuberculosis', category: 'Infectious and parasitic diseases', subcategory: 'Tuberculosis' },
      { code: 'A16', description: 'Respiratory tuberculosis, not confirmed bacteriologically or histologically', category: 'Infectious and parasitic diseases', subcategory: 'Tuberculosis' },
      { code: 'A17', description: 'Tuberculosis of nervous system', category: 'Infectious and parasitic diseases', subcategory: 'Tuberculosis' },
      { code: 'A18', description: 'Tuberculosis of other organs', category: 'Infectious and parasitic diseases', subcategory: 'Tuberculosis' },
      { code: 'A19', description: 'Miliary tuberculosis', category: 'Infectious and parasitic diseases', subcategory: 'Tuberculosis' },
      { code: 'E10', description: 'Type 1 diabetes mellitus', category: 'Endocrine, nutritional and metabolic diseases', subcategory: 'Diabetes mellitus' },
      { code: 'E11', description: 'Type 2 diabetes mellitus', category: 'Endocrine, nutritional and metabolic diseases', subcategory: 'Diabetes mellitus' },
      { code: 'E12', description: 'Malnutrition-related diabetes mellitus', category: 'Endocrine, nutritional and metabolic diseases', subcategory: 'Diabetes mellitus' },
      { code: 'E13', description: 'Other specified diabetes mellitus', category: 'Endocrine, nutritional and metabolic diseases', subcategory: 'Diabetes mellitus' },
      { code: 'E14', description: 'Unspecified diabetes mellitus', category: 'Endocrine, nutritional and metabolic diseases', subcategory: 'Diabetes mellitus' },
      { code: 'I10', description: 'Essential hypertension', category: 'Diseases of the circulatory system', subcategory: 'Diseases of arteries, arterioles and capillaries' },
      { code: 'I11', description: 'Hypertensive heart disease', category: 'Diseases of the circulatory system', subcategory: 'Diseases of arteries, arterioles and capillaries' },
      { code: 'I12', description: 'Hypertensive chronic kidney disease', category: 'Diseases of the circulatory system', subcategory: 'Diseases of arteries, arterioles and capillaries' },
      { code: 'I13', description: 'Hypertensive heart and chronic kidney disease', category: 'Diseases of the circulatory system', subcategory: 'Diseases of arteries, arterioles and capillaries' },
      { code: 'I15', description: 'Secondary hypertension', category: 'Diseases of the circulatory system', subcategory: 'Diseases of arteries, arterioles and capillaries' },
      { code: 'J12', description: 'Viral pneumonia', category: 'Diseases of the respiratory system', subcategory: 'Influenza and pneumonia' },
      { code: 'J13', description: 'Pneumonia due to Streptococcus pneumoniae', category: 'Diseases of the respiratory system', subcategory: 'Influenza and pneumonia' },
      { code: 'J14', description: 'Pneumonia due to Hemophilus influenzae', category: 'Diseases of the respiratory system', subcategory: 'Influenza and pneumonia' },
      { code: 'J15', description: 'Bacterial pneumonia, not elsewhere classified', category: 'Diseases of the respiratory system', subcategory: 'Influenza and pneumonia' },
      { code: 'J16', description: 'Pneumonia due to other infectious organisms, not elsewhere classified', category: 'Diseases of the respiratory system', subcategory: 'Influenza and pneumonia' },
      { code: 'J18', description: 'Pneumonia, organism unspecified', category: 'Diseases of the respiratory system', subcategory: 'Influenza and pneumonia' },
      { code: 'K25', description: 'Gastric ulcer', category: 'Diseases of the digestive system', subcategory: 'Diseases of oesophagus, stomach and duodenum' },
      { code: 'K26', description: 'Duodenal ulcer', category: 'Diseases of the digestive system', subcategory: 'Diseases of oesophagus, stomach and duodenum' },
      { code: 'K27', description: 'Peptic ulcer, site unspecified', category: 'Diseases of the digestive system', subcategory: 'Diseases of oesophagus, stomach and duodenum' },
      { code: 'K28', description: 'Gastrojejunal ulcer', category: 'Diseases of the digestive system', subcategory: 'Diseases of oesophagus, stomach and duodenum' },
      { code: 'K29', description: 'Gastritis and duodenitis', category: 'Diseases of the digestive system', subcategory: 'Diseases of oesophagus, stomach and duodenum' },
      { code: 'C50', description: 'Malignant neoplasm of breast', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C78', description: 'Secondary malignant neoplasm of respiratory and digestive organs', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C79', description: 'Secondary malignant neoplasm of other and unspecified sites', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C80', description: 'Malignant neoplasm without specification of site', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C81', description: 'Hodgkin lymphoma', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C82', description: 'Follicular lymphoma', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C83', description: 'Non-follicular lymphoma', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C84', description: 'Mature T/NK-cell lymphomas', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C85', description: 'Other and unspecified types of non-Hodgkin lymphoma', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C88', description: 'Malignant immunoproliferative diseases and certain other B-cell lymphomas', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C90', description: 'Multiple myeloma and malignant plasma cell neoplasms', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C91', description: 'Lymphoid leukemia', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C92', description: 'Myeloid leukemia', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C93', description: 'Monocytic leukemia', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C94', description: 'Other leukemias of specified cell type', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C95', description: 'Leukemia of unspecified cell type', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C96', description: 'Other and unspecified malignant neoplasms of lymphoid, hematopoietic and related tissue', category: 'Neoplasms', subcategory: 'Malignant neoplasms' },
      { code: 'C97', description: 'Malignant neoplasms of independent (primary) multiple sites', category: 'Neoplasms', subcategory: 'Malignant neoplasms' }
    ];
    
    const { error: icd10Error } = await supabase
      .from('icd10_codes')
      .upsert(icd10Data, { onConflict: 'code' });
    
    if (icd10Error) {
      console.error('❌ Error adding ICD-10 data:', icd10Error);
    } else {
      console.log('✅ ICD-10 data added successfully');
    }
    
    // Step 2: Get service prices for mappings
    console.log('🔍 Fetching service prices...');
    const { data: services, error: servicesError } = await supabase
      .from('service_prices')
      .select('id, service_name')
      .limit(10);
    
    if (servicesError) {
      console.error('❌ Error fetching services:', servicesError);
      return false;
    }
    
    console.log(`📊 Found ${services?.length || 0} services`);
    
    // Step 3: Add service code mappings
    if (services && services.length > 0) {
      console.log('🔗 Adding service code mappings...');
      
      const mappings = [
        {
          service_price_id: services[0].id,
          icd10_code: 'A00',
          icd11_code: '1A00',
          cpt4_code: '99201',
          sha_code: 'SHA001',
          mapping_type: 'service',
          is_primary: true
        },
        {
          service_price_id: services[1]?.id || services[0].id,
          icd10_code: 'B50',
          icd11_code: '1A0G',
          cpt4_code: '99211',
          sha_code: 'SHA002',
          mapping_type: 'diagnosis',
          is_primary: true
        },
        {
          service_price_id: services[2]?.id || services[0].id,
          icd10_code: 'B20',
          icd11_code: '1A0P',
          cpt4_code: '99213',
          sha_code: 'SHA006',
          mapping_type: 'procedure',
          is_primary: true
        },
        {
          service_price_id: services[3]?.id || services[0].id,
          icd10_code: 'A15',
          icd11_code: '1A0M',
          cpt4_code: '71020',
          sha_code: 'SHA016',
          mapping_type: 'diagnosis',
          is_primary: true
        },
        {
          service_price_id: services[4]?.id || services[0].id,
          icd10_code: 'E10',
          icd11_code: '5A10',
          cpt4_code: '99213',
          sha_code: 'SHA002',
          mapping_type: 'diagnosis',
          is_primary: true
        }
      ];
      
      const { error: mappingError } = await supabase
        .from('service_code_mappings')
        .upsert(mappings);
      
      if (mappingError) {
        console.error('❌ Error adding service mappings:', mappingError);
      } else {
        console.log('✅ Service code mappings added');
      }
    }
    
    // Step 4: Verify the setup
    console.log('🔍 Verifying setup...');
    
    const { data: icd10Count } = await supabase
      .from('icd10_codes')
      .select('*', { count: 'exact', head: true });
    
    const { data: icd11Count } = await supabase
      .from('icd11_codes')
      .select('*', { count: 'exact', head: true });
    
    const { data: cpt4Count } = await supabase
      .from('cpt4_codes')
      .select('*', { count: 'exact', head: true });
    
    const { data: tanzaniaCount } = await supabase
      .from('tanzania_service_codes')
      .select('*', { count: 'exact', head: true });
    
    const { data: mappingCount } = await supabase
      .from('service_code_mappings')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Final Counts:');
    console.log(`   ICD-10 codes: ${icd10Count?.length || 0} records`);
    console.log(`   ICD-11 codes: ${icd11Count?.length || 0} records`);
    console.log(`   CPT-4 codes: ${cpt4Count?.length || 0} records`);
    console.log(`   Tanzania Service codes: ${tanzaniaCount?.length || 0} records`);
    console.log(`   Service mappings: ${mappingCount?.length || 0} records`);
    
    console.log('✅ Ministry compliance setup complete!');
    return true;
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

executeComplianceScript().then(success => {
  if (success) {
    console.log('🎉 Ready to test compliance!');
  } else {
    console.log('⚠️ Setup incomplete. Please check the errors above.');
  }
  process.exit(success ? 0 : 1);
});
