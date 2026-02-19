-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create items table (swag items)
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Geral',
  price NUMERIC DEFAULT 0,
  has_grid BOOLEAN DEFAULT false,
  grid JSONB,
  current_stock INTEGER NOT NULL DEFAULT 0,
  critical_level INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  role TEXT DEFAULT 'Colaborador',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inventory_movements table
CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL, -- To group items in a single transaction
  item_id UUID REFERENCES public.items(id) NOT NULL,
  employee_id UUID REFERENCES public.employees(id), -- Nullable for IN (restock)
  type TEXT CHECK (type IN ('IN', 'OUT')) NOT NULL,
  quantity INTEGER NOT NULL,
  size TEXT,
  destination TEXT, -- To store "Client" or "Event" name if applicable
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trigger to update stock automatically
CREATE OR REPLACE FUNCTION update_stock_after_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'IN' THEN
    UPDATE public.items
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.item_id;
  ELSIF NEW.type = 'OUT' THEN
    UPDATE public.items
    SET current_stock = GREATEST(0, current_stock - NEW.quantity)
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_trigger
AFTER INSERT ON public.inventory_movements
FOR EACH ROW
EXECUTE FUNCTION update_stock_after_movement();

-- Seed Data: Departments
INSERT INTO public.departments (name) VALUES 
('Engenharia'), 
('RH'), 
('Vendas'), 
('Marketing'), 
('Produto'), 
('Financeiro');

-- Seed Data: Employees
DO $$
DECLARE
  dept_eng UUID;
  dept_rh UUID;
  dept_mkt UUID;
BEGIN
  SELECT id INTO dept_eng FROM public.departments WHERE name = 'Engenharia';
  SELECT id INTO dept_rh FROM public.departments WHERE name = 'RH';
  SELECT id INTO dept_mkt FROM public.departments WHERE name = 'Marketing';

  INSERT INTO public.employees (name, email, department_id, role, avatar_url) VALUES
  ('João Silva', 'joao.silva@adapta.org', dept_eng, 'Senior Developer', 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=joao'),
  ('Maria Oliveira', 'maria.oliveira@adapta.org', dept_rh, 'HR Manager', 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=maria'),
  ('Pedro Santos', 'pedro.santos@adapta.org', dept_mkt, 'Marketing Specialist', 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=pedro');
END $$;

-- Seed Data: Items
INSERT INTO public.items (name, description, category, image_url, price, current_stock, has_grid, grid) VALUES
('Camiseta Adapta Tech (Preta)', 'Camiseta de algodão egípcio com estampa minimalista.', 'Vestuário', 't-shirt black', 45.0, 22, true, '{"PP": 0, "P": 2, "M": 15, "G": 0, "GG": 5}'::jsonb),
('Moletom "Vibe Coding" (Cinza)', 'Moletom confortável para os dias de código intenso.', 'Vestuário', 'hoodie grey', 120.0, 20, true, '{"PP": 0, "P": 5, "M": 5, "G": 5, "GG": 5}'::jsonb),
('Garrafa Térmica 500ml', 'Mantém sua bebida na temperatura ideal por horas.', 'Utensílios', 'thermos bottle black', 65.0, 30, false, null),
('Kit Onboarding Deluxe', 'O kit completo para receber novos talentos com estilo.', 'Kits', 'welcome kit gift box', 250.0, 8, false, null),
('Mochila Executiva', 'Mochila resistente à água com compartimento para laptop.', 'Utensílios', 'black backpack', 180.0, 15, false, null);

