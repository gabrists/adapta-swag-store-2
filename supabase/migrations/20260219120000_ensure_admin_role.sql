-- Ensure admin user exists in employees table
INSERT INTO public.employees (name, email, department_id, role, avatar_url)
SELECT 
  'Administrador', 
  'admin@adapta.org', 
  (SELECT id FROM public.departments WHERE name = 'RH' LIMIT 1), 
  'admin', 
  'https://img.usecurling.com/ppl/medium?gender=male&seed=admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.employees WHERE email = 'admin@adapta.org'
);

-- Update existing user to admin if needed to ensure the role is correct
UPDATE public.employees SET role = 'admin' WHERE email = 'admin@adapta.org';
