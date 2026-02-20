-- Migration to seed employees list and reset roles

DO $$
DECLARE
  dept_id UUID;
  default_role TEXT := 'Colaborador';
BEGIN
  -- 1. Get a default department (Engenharia) for the new employees
  SELECT id INTO dept_id FROM public.departments WHERE name = 'Engenharia' LIMIT 1;
  
  -- Fallback if Engenharia doesn't exist
  IF dept_id IS NULL THEN
    SELECT id INTO dept_id FROM public.departments LIMIT 1;
  END IF;

  -- 2. Reset roles: Demote everyone to 'Colaborador' EXCEPT the main admin
  -- This ensures only the current admin (assumed to be admin@adapta.org) retains privileges
  UPDATE public.employees 
  SET role = 'Colaborador' 
  WHERE email != 'admin@adapta.org';

  -- 3. Insert new employees
  -- We use a temporary table to handle the data transformation and uniqueness
  CREATE TEMP TABLE employee_seeds (
    name TEXT,
    email TEXT,
    gender TEXT
  );

  -- Insert raw data (Emails are generated from names: lowercase, unaccent, dots)
  INSERT INTO employee_seeds (name, email, gender) VALUES
  ('Allan Baptista', 'allan.baptista@adapta.org', 'male'),
  ('Angelo Nuncio Pinheiro', 'angelo.nuncio.pinheiro@adapta.org', 'male'),
  ('Arthur da Fonte Guerra', 'arthur.da.fonte.guerra@adapta.org', 'male'),
  ('Axel Ríos', 'axel.rios@adapta.org', 'male'),
  ('Ben Schulze', 'ben.schulze@adapta.org', 'male'),
  ('Bia', 'bia@adapta.org', 'female'),
  ('Braga', 'braga@adapta.org', 'male'),
  ('Caio Filip Juliaci', 'caio.filip.juliaci@adapta.org', 'male'),
  ('Davi Cunha', 'davi.cunha@adapta.org', 'male'),
  ('Davy Pedrosa', 'davy.pedrosa@adapta.org', 'male'),
  ('Edson Muniz', 'edson.muniz@adapta.org', 'male'),
  ('Eduarda Almeida', 'eduarda.almeida@adapta.org', 'female'),
  ('Eduardo Coelho', 'eduardo.coelho@adapta.org', 'male'),
  ('Erica Ayumi', 'erica.ayumi@adapta.org', 'female'),
  ('Ezequiel', 'ezequiel@adapta.org', 'male'),
  ('Felipe Batista', 'felipe.batista@adapta.org', 'male'),
  ('Felipe Mamede', 'felipe.mamede@adapta.org', 'male'),
  ('Felipe Navaar', 'felipe.navaar@adapta.org', 'male'),
  ('Felipe Oliveira Garcia', 'felipe.oliveira.garcia@adapta.org', 'male'),
  ('Felipe Peixoto', 'felipe.peixoto@adapta.org', 'male'),
  ('Fellipe Carvalho', 'fellipe.carvalho@adapta.org', 'male'),
  ('Fernando Mascarenhas', 'fernando.mascarenhas@adapta.org', 'male'),
  ('Fernando Sousa', 'fernando.sousa@adapta.org', 'male'),
  ('Gabriel Carvalho', 'gabriel.carvalho@adapta.org', 'male'),
  ('Gabriel Henrique', 'gabriel.henrique@adapta.org', 'male'),
  ('Gabriel Jesus', 'gabriel.jesus@adapta.org', 'male'),
  ('Gabriel Pavão', 'gabriel.pavao@adapta.org', 'male'),
  ('Gabriel Santos', 'gabriel.santos@adapta.org', 'male'),
  ('Giampaolo Lepore', 'giampaolo.lepore@adapta.org', 'male'),
  ('Guilherme Lago', 'guilherme.lago@adapta.org', 'male'),
  ('Guilherme Teofilo', 'guilherme.teofilo@adapta.org', 'male'),
  ('Gustavo Fonseca', 'gustavo.fonseca@adapta.org', 'male'),
  ('Hamú', 'hamu@adapta.org', 'male'),
  ('Ian Ede', 'ian.ede@adapta.org', 'male'),
  ('Ingrid Costa', 'ingrid.costa@adapta.org', 'female'),
  ('Isadora Magri', 'isadora.magri@adapta.org', 'female'),
  ('Izabel Villyn', 'izabel.villyn@adapta.org', 'female'),
  ('Jadson Consolini', 'jadson.consolini@adapta.org', 'male'),
  ('Jamilson Scarcella', 'jamilson.scarcella@adapta.org', 'male'),
  ('Jessica Ferreira', 'jessica.ferreira@adapta.org', 'female'),
  ('João Augusto', 'joao.augusto@adapta.org', 'male'),
  ('João Ferrari', 'joao.ferrari@adapta.org', 'male'),
  ('João Locatelli', 'joao.locatelli@adapta.org', 'male'),
  ('João Vitor Andrade Estrela', 'joao.vitor.andrade.estrela@adapta.org', 'male'),
  ('Joao Vitor Ferrari', 'joao.vitor.ferrari@adapta.org', 'male'),
  ('Juan Bonfim', 'juan.bonfim@adapta.org', 'male'),
  ('Julia Pereira Cruz', 'julia.pereira.cruz@adapta.org', 'female'),
  ('Kaike Mota', 'kaike.mota@adapta.org', 'male'),
  ('Kelvi Maycon', 'kelvi.maycon@adapta.org', 'male'),
  ('Kelvin Dutra', 'kelvin.dutra@adapta.org', 'male'),
  ('Kelvyn Holovecki', 'kelvyn.holovecki@adapta.org', 'male'),
  ('Kimberly Prestes', 'kimberly.prestes@adapta.org', 'female'),
  ('Léo Camargo', 'leo.camargo@adapta.org', 'male'),
  ('Léo Marinho', 'leo.marinho@adapta.org', 'male'),
  ('Lucas Andrade', 'lucas.andrade@adapta.org', 'male'),
  ('Lucas Bueno', 'lucas.bueno@adapta.org', 'male'),
  ('Lucas Dias', 'lucas.dias@adapta.org', 'male'),
  ('Lucas Machado', 'lucas.machado@adapta.org', 'male'),
  ('Lucas Paiva', 'lucas.paiva@adapta.org', 'male'), -- Capitalized manually
  ('Lucas Pereira', 'lucas.pereira@adapta.org', 'male'),
  ('Lucas Richard', 'lucas.richard@adapta.org', 'male'),
  ('Lucas Romcy', 'lucas.romcy@adapta.org', 'male'),
  ('Lucas Vin', 'lucas.vin@adapta.org', 'male'),
  ('Lucas Yuri', 'lucas.yuri@adapta.org', 'male'),
  ('Luis Fernando', 'luis.fernando@adapta.org', 'male'),
  ('Luis Miguel', 'luis.miguel@adapta.org', 'male'),
  ('Lydia', 'lydia@adapta.org', 'female'),
  ('Márcia Ertel', 'marcia.ertel@adapta.org', 'female'),
  ('Marcos Cury', 'marcos.cury@adapta.org', 'male'),
  ('Mateus Tápias', 'mateus.tapias@adapta.org', 'male'),
  ('Matheus Kubo', 'matheus.kubo@adapta.org', 'male'),
  ('Matheus Prado', 'matheus.prado@adapta.org', 'male'),
  ('Matheus Sotto', 'matheus.sotto@adapta.org', 'male'),
  ('Max', 'max@adapta.org', 'male'),
  ('Miguel', 'miguel@adapta.org', 'male'), -- Capitalized manually
  ('Miguel Souza Dias', 'miguel.souza.dias@adapta.org', 'male'),
  ('Monike Leal', 'monike.leal@adapta.org', 'female'),
  ('Patrick Peters', 'patrick.peters@adapta.org', 'male'),
  ('Paulo Zanquetta', 'paulo.zanquetta@adapta.org', 'male'),
  ('Priscilla Petry', 'priscilla.petry@adapta.org', 'female'),
  ('Rafael Cabral', 'rafael.cabral@adapta.org', 'male'),
  ('Raphael Araujo', 'raphael.araujo@adapta.org', 'male'),
  ('Raphaela Castro', 'raphaela.castro@adapta.org', 'female'),
  ('Rodrigo A. Santos', 'rodrigo.a.santos@adapta.org', 'male'),
  ('Romario', 'romario@adapta.org', 'male'),
  ('Ruan Azevedo', 'ruan.azevedo@adapta.org', 'male'),
  ('Samyla Vidal', 'samyla.vidal@adapta.org', 'female'),
  ('Tainara Oliveira', 'tainara.oliveira@adapta.org', 'female'),
  ('Themila Andrade', 'themila.andrade@adapta.org', 'female'),
  ('Thiago Machado', 'thiago.machado@adapta.org', 'male'),
  ('Vinicius Galetti', 'vinicius.galetti@adapta.org', 'male'),
  ('Yuri', 'yuri@adapta.org', 'male');

  -- Perform Insert or Update (Upsert)
  -- ON CONFLICT (email) DO NOTHING ensures we don't break on duplicates in the list or existing users
  -- but we want to make sure the role is correct (already reset above, but for new ones it is set below)
  INSERT INTO public.employees (name, email, department_id, role, avatar_url)
  SELECT 
    t.name, 
    t.email, 
    dept_id, 
    default_role, 
    'https://img.usecurling.com/ppl/thumbnail?gender=' || t.gender || '&seed=' || split_part(t.email, '@', 1)
  FROM employee_seeds t
  ON CONFLICT (email) DO UPDATE
  SET 
    role = 'Colaborador', -- Force reset if it was something else and not admin@adapta.org (which is excluded by conflict usually if names don't match, but here we match by email)
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url
  WHERE employees.email != 'admin@adapta.org';

  -- Cleanup
  DROP TABLE employee_seeds;
END $$;
