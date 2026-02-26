DO $$
DECLARE
  kept_email TEXT := 'gabriel.santos@adapta.org';
BEGIN
  -- 1. Delete orders associated with employees to be deleted (no cascade exists)
  DELETE FROM public.orders 
  WHERE employee_id IN (
    SELECT id FROM public.employees WHERE email != kept_email OR email IS NULL
  );

  -- 2. Delete inventory movements associated with employees to be deleted (no cascade exists)
  DELETE FROM public.inventory_movements 
  WHERE employee_id IN (
    SELECT id FROM public.employees WHERE email != kept_email OR email IS NULL
  );

  -- 3. Delete campaign responses (even though it has ON DELETE CASCADE, explicit deletion ensures cleanliness based on AC)
  DELETE FROM public.campaign_responses 
  WHERE employee_id IN (
    SELECT id FROM public.employees WHERE email != kept_email OR email IS NULL
  );

  -- 4. Delete the employees themselves, keeping only the targeted email
  DELETE FROM public.employees 
  WHERE email != kept_email OR email IS NULL;

  -- 5. Delete from auth.users, keeping only the targeted email
  -- Supabase GoTrue handles cascading deletes for identities, sessions, etc. natively
  DELETE FROM auth.users 
  WHERE email != kept_email OR email IS NULL;

END $$;
