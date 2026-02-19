CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  item_id UUID REFERENCES public.items(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  status TEXT CHECK (status IN ('Pendente', 'Entregue', 'Rejeitado')) NOT NULL DEFAULT 'Pendente',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
