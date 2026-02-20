-- Resolve potential unique constraint violation and update admin email

DO $$
BEGIN
  -- 1. Ensure the new email is not already in use by another record to respect the unique constraint
  IF EXISTS (
    SELECT 1 FROM public.employees 
    WHERE email = 'gabriel.santos@adapta.org' 
    AND email != 'admin@adapta.org'
  ) THEN
    UPDATE public.employees
    SET email = 'gabriel.santos.seed@adapta.org'
    WHERE email = 'gabriel.santos@adapta.org';
  END IF;

  -- 2. Update the target employee record
  UPDATE public.employees
  SET email = 'gabriel.santos@adapta.org'
  WHERE email = 'admin@adapta.org' AND name = 'Gabriel Santos';

  -- 3. Maintain consistency in auth tables to allow the user to log in with the new email
  UPDATE auth.users
  SET email = 'gabriel.santos@adapta.org'
  WHERE email = 'admin@adapta.org';

  UPDATE auth.identities
  SET identity_data = jsonb_set(identity_data, '{email}', '"gabriel.santos@adapta.org"')
  WHERE identity_data->>'email' = 'admin@adapta.org';
END $$;
