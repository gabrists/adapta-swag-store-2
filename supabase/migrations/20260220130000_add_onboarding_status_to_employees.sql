-- Migration to add onboarding_kit_status to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS onboarding_kit_status TEXT DEFAULT 'Pendente';

-- Update existing records to have 'Pendente' if null (though DEFAULT handles new inserts)
UPDATE public.employees 
SET onboarding_kit_status = 'Pendente' 
WHERE onboarding_kit_status IS NULL;
