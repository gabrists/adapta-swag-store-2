DO $$
DECLARE
  user_info RECORD;
  new_user_id uuid;
  users_to_insert JSON := '[
    {"name": "Eduardo Coelho", "email": "eduardo@copyexperts.com.br"},
    {"name": "Erica Ayumi", "email": "erica@adapta.org"}
  ]';
BEGIN
  FOR user_info IN SELECT * FROM json_to_recordset(users_to_insert) AS x(name text, email text)
  LOOP
    -- 1. Create the user in auth.users if they don't exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_info.email) THEN
      new_user_id := gen_random_uuid();
      
      INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, role, aud,
        confirmation_token, recovery_token, email_change_token_new,
        email_change, email_change_token_current,
        phone, phone_change, phone_change_token, reauthentication_token
      ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        user_info.email,
        crypt('123', gen_salt('bf')),
        NOW(), NOW(), NOW(),
        '{"provider": "email", "providers": ["email"]}',
        json_build_object('name', user_info.name)::jsonb,
        false, 'authenticated', 'authenticated',
        '',    -- confirmation_token: MUST be '' not NULL
        '',    -- recovery_token: MUST be '' not NULL
        '',    -- email_change_token_new: MUST be '' not NULL
        '',    -- email_change: MUST be '' not NULL
        '',    -- email_change_token_current: MUST be '' not NULL
        NULL,  -- phone: MUST be NULL (not '') due to UNIQUE constraint
        '',    -- phone_change: MUST be '' not NULL
        '',    -- phone_change_token: MUST be '' not NULL
        ''     -- reauthentication_token: MUST be '' not NULL
      );

      -- 2. Synchronize the user in public.employees using the generated ID
      IF NOT EXISTS (SELECT 1 FROM public.employees WHERE email = user_info.email) THEN
        INSERT INTO public.employees (id, name, email, role, onboarding_kit_status) 
        VALUES (new_user_id, user_info.name, user_info.email, 'Colaborador', 'Pendente');
      END IF;
    END IF;
  END LOOP;
END $$;
