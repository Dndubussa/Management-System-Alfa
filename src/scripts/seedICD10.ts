import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Common ICD-10 codes for hospital use
const commonICD10Codes = [
  // Chapter 1: Infectious and parasitic diseases
  { code: 'A09', description: 'Diarrhoea and gastroenteritis of presumed infectious origin', category: 'Infectious diseases', chapter: 'Certain infectious and parasitic diseases' },
  { code: 'B34.9', description: 'Viral infection, unspecified', category: 'Viral infections', chapter: 'Certain infectious and parasitic diseases' },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory infections', chapter: 'Certain infectious and parasitic diseases' },
  
  // Chapter 2: Neoplasms
  { code: 'C78.00', description: 'Secondary malignant neoplasm of unspecified lung', category: 'Malignant neoplasms', chapter: 'Neoplasms' },
  { code: 'D50.9', description: 'Iron deficiency anaemia, unspecified', category: 'Anaemia', chapter: 'Neoplasms' },
  
  // Chapter 4: Endocrine, nutritional and metabolic diseases
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Diabetes', chapter: 'Endocrine, nutritional and metabolic diseases' },
  { code: 'E78.5', description: 'Hyperlipidaemia, unspecified', category: 'Metabolic disorders', chapter: 'Endocrine, nutritional and metabolic diseases' },
  { code: 'E66.9', description: 'Obesity, unspecified', category: 'Metabolic disorders', chapter: 'Endocrine, nutritional and metabolic diseases' },
  
  // Chapter 5: Mental and behavioural disorders
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', category: 'Mood disorders', chapter: 'Mental and behavioural disorders' },
  { code: 'F41.9', description: 'Anxiety disorder, unspecified', category: 'Anxiety disorders', chapter: 'Mental and behavioural disorders' },
  
  // Chapter 6: Diseases of the nervous system
  { code: 'G43.909', description: 'Migraine, unspecified, not intractable, without status migrainosus', category: 'Headache disorders', chapter: 'Diseases of the nervous system' },
  { code: 'G93.1', description: 'Anoxic brain damage, not elsewhere classified', category: 'Brain disorders', chapter: 'Diseases of the nervous system' },
  
  // Chapter 7: Diseases of the eye and adnexa
  { code: 'H25.9', description: 'Age-related cataract, unspecified', category: 'Cataract', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H40.9', description: 'Glaucoma, unspecified', category: 'Glaucoma', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H52.1', description: 'Astigmatism', category: 'Refractive errors', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H52.2', description: 'Astigmatism', category: 'Refractive errors', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H52.3', description: 'Anisometropia and aniseikonia', category: 'Refractive errors', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H52.4', description: 'Presbyopia', category: 'Refractive errors', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H52.5', description: 'Disorders of accommodation', category: 'Refractive errors', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H52.6', description: 'Other disorders of refraction', category: 'Refractive errors', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H52.7', description: 'Refractive error, unspecified', category: 'Refractive errors', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H53.0', description: 'Amblyopia', category: 'Visual disturbances', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H53.1', description: 'Subjective visual disturbances', category: 'Visual disturbances', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H53.2', description: 'Diplopia', category: 'Visual disturbances', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H53.3', description: 'Other disorders of binocular vision', category: 'Visual disturbances', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H53.4', description: 'Visual field defects', category: 'Visual disturbances', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H53.5', description: 'Colour vision deficiencies', category: 'Visual disturbances', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H53.6', description: 'Night blindness', category: 'Visual disturbances', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H53.8', description: 'Other visual disturbances', category: 'Visual disturbances', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H53.9', description: 'Visual disturbance, unspecified', category: 'Visual disturbances', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H54.0', description: 'Blindness, both eyes', category: 'Blindness and low vision', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H54.1', description: 'Blindness, one eye, low vision other eye', category: 'Blindness and low vision', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H54.2', description: 'Low vision, both eyes', category: 'Blindness and low vision', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H54.3', description: 'Unqualified visual loss, both eyes', category: 'Blindness and low vision', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H54.4', description: 'Blindness, one eye', category: 'Blindness and low vision', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H54.5', description: 'Low vision, one eye', category: 'Blindness and low vision', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H54.6', description: 'Unqualified visual loss, one eye', category: 'Blindness and low vision', chapter: 'Diseases of the eye and adnexa' },
  { code: 'H54.7', description: 'Unspecified visual loss', category: 'Blindness and low vision', chapter: 'Diseases of the eye and adnexa' },
  
  // Chapter 9: Diseases of the circulatory system
  { code: 'I10', description: 'Essential hypertension', category: 'Hypertension', chapter: 'Diseases of the circulatory system' },
  { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris', category: 'Coronary artery disease', chapter: 'Diseases of the circulatory system' },
  { code: 'I48.91', description: 'Unspecified atrial fibrillation', category: 'Cardiac arrhythmias', chapter: 'Diseases of the circulatory system' },
  
  // Chapter 10: Diseases of the respiratory system
  { code: 'J44.1', description: 'Chronic obstructive pulmonary disease with acute exacerbation', category: 'COPD', chapter: 'Diseases of the respiratory system' },
  { code: 'J45.9', description: 'Asthma, unspecified', category: 'Asthma', chapter: 'Diseases of the respiratory system' },
  { code: 'J18.9', description: 'Pneumonia, unspecified organism', category: 'Pneumonia', chapter: 'Diseases of the respiratory system' },
  
  // Chapter 11: Diseases of the digestive system
  { code: 'K21.9', description: 'Gastro-oesophageal reflux disease without oesophagitis', category: 'GERD', chapter: 'Diseases of the digestive system' },
  { code: 'K59.00', description: 'Constipation, unspecified', category: 'Bowel disorders', chapter: 'Diseases of the digestive system' },
  { code: 'K80.20', description: 'Calculus of gallbladder without obstruction', category: 'Gallbladder disease', chapter: 'Diseases of the digestive system' },
  
  // Chapter 13: Diseases of the musculoskeletal system and connective tissue
  { code: 'M25.561', description: 'Pain in right knee', category: 'Joint pain', chapter: 'Diseases of the musculoskeletal system and connective tissue' },
  { code: 'M79.3', description: 'Panniculitis, unspecified', category: 'Soft tissue disorders', chapter: 'Diseases of the musculoskeletal system and connective tissue' },
  { code: 'M54.5', description: 'Low back pain', category: 'Back pain', chapter: 'Diseases of the musculoskeletal system and connective tissue' },
  
  // Chapter 19: Injury, poisoning and certain other consequences of external causes
  { code: 'S72.001A', description: 'Fracture of unspecified part of neck of right femur, initial encounter for closed fracture', category: 'Fractures', chapter: 'Injury, poisoning and certain other consequences of external causes' },
  { code: 'T78.40XA', description: 'Allergy, unspecified, initial encounter', category: 'Allergic reactions', chapter: 'Injury, poisoning and certain other consequences of external causes' },
  
  // Chapter 21: Factors influencing health status and contact with health services
  { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings', category: 'Health examinations', chapter: 'Factors influencing health status and contact with health services' },
  { code: 'Z51.11', description: 'Encounter for antineoplastic chemotherapy', category: 'Cancer treatment', chapter: 'Factors influencing health status and contact with health services' },
  { code: 'Z87.891', description: 'Personal history of nicotine dependence', category: 'Personal history', chapter: 'Factors influencing health status and contact with health services' }
];

async function seedICD10Codes() {
  console.log('=== Seeding ICD-10 Codes ===');
  
  try {
    // Check if codes already exist
    const { data: existingCodes, error: checkError } = await supabase
      .from('icd10_codes')
      .select('code')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking existing codes:', checkError.message);
      return;
    }
    
    if (existingCodes && existingCodes.length > 0) {
      console.log('✅ ICD-10 codes already exist in database');
      return;
    }
    
    // Insert ICD-10 codes
    const { data, error } = await supabase
      .from('icd10_codes')
      .insert(commonICD10Codes);
    
    if (error) {
      console.error('❌ Error inserting ICD-10 codes:', error.message);
      return;
    }
    
    console.log(`✅ Successfully inserted ${commonICD10Codes.length} ICD-10 codes`);
    console.log('📋 Categories included:');
    
    const categories = [...new Set(commonICD10Codes.map(code => code.category))];
    categories.forEach(category => {
      console.log(`   - ${category}`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the seeding function
seedICD10Codes().catch(console.error);
