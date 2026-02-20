-- Garante a existência da coluna image_url na tabela swag_campaigns para atualizações seguras
ALTER TABLE public.swag_campaigns ADD COLUMN IF NOT EXISTS image_url TEXT;
