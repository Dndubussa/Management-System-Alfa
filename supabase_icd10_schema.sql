-- ICD-10 Database Schema
-- International Classification of Diseases, 10th Revision

-- Create ICD-10 codes table
CREATE TABLE IF NOT EXISTS public.icd10_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    chapter VARCHAR(100),
    block VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_icd10_codes_code ON public.icd10_codes(code);
CREATE INDEX IF NOT EXISTS idx_icd10_codes_description ON public.icd10_codes USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_icd10_codes_category ON public.icd10_codes(category);
CREATE INDEX IF NOT EXISTS idx_icd10_codes_chapter ON public.icd10_codes(chapter);

-- Create ICD-10 chapters reference table
CREATE TABLE IF NOT EXISTS public.icd10_chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chapter_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ICD-10 blocks reference table
CREATE TABLE IF NOT EXISTS public.icd10_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    block_code VARCHAR(10) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    chapter_id UUID REFERENCES public.icd10_chapters(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update medical records to include ICD-10 codes
ALTER TABLE public.medical_records 
ADD COLUMN IF NOT EXISTS icd10_codes JSONB DEFAULT '[]';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_icd10_codes_updated_at 
    BEFORE UPDATE ON public.icd10_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.icd10_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd10_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd10_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow read access to all authenticated users)
CREATE POLICY "Allow read access to ICD-10 codes" ON public.icd10_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to ICD-10 chapters" ON public.icd10_chapters
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to ICD-10 blocks" ON public.icd10_blocks
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert ICD-10 chapters
INSERT INTO public.icd10_chapters (chapter_number, title, description) VALUES
(1, 'Certain infectious and parasitic diseases', 'Diseases caused by microorganisms'),
(2, 'Neoplasms', 'Tumors and cancers'),
(3, 'Diseases of the blood and blood-forming organs and certain disorders involving the immune mechanism', 'Blood disorders and immune system diseases'),
(4, 'Endocrine, nutritional and metabolic diseases', 'Hormone, nutrition and metabolism disorders'),
(5, 'Mental and behavioural disorders', 'Mental health conditions'),
(6, 'Diseases of the nervous system', 'Brain, spinal cord and nerve disorders'),
(7, 'Diseases of the eye and adnexa', 'Eye and related structure disorders'),
(8, 'Diseases of the ear and mastoid process', 'Ear and hearing disorders'),
(9, 'Diseases of the circulatory system', 'Heart and blood vessel diseases'),
(10, 'Diseases of the respiratory system', 'Lung and breathing disorders'),
(11, 'Diseases of the digestive system', 'Stomach, intestine and digestive disorders'),
(12, 'Diseases of the skin and subcutaneous tissue', 'Skin and tissue disorders'),
(13, 'Diseases of the musculoskeletal system and connective tissue', 'Bone, muscle and joint disorders'),
(14, 'Diseases of the genitourinary system', 'Reproductive and urinary system disorders'),
(15, 'Pregnancy, childbirth and the puerperium', 'Pregnancy and childbirth related conditions'),
(16, 'Certain conditions originating in the perinatal period', 'Newborn conditions'),
(17, 'Congenital malformations, deformations and chromosomal abnormalities', 'Birth defects'),
(18, 'Symptoms, signs and abnormal clinical and laboratory findings, not elsewhere classified', 'Symptoms without specific diagnosis'),
(19, 'Injury, poisoning and certain other consequences of external causes', 'Injuries and poisonings'),
(20, 'External causes of morbidity and mortality', 'Causes of injury and death'),
(21, 'Factors influencing health status and contact with health services', 'Health checkups and preventive care'),
(22, 'Codes for special purposes', 'Special use codes')
ON CONFLICT (chapter_number) DO NOTHING;
