CREATE TABLE public.slack_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_url TEXT NOT NULL DEFAULT '',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert a default row to ensure there is always one configuration record
INSERT INTO public.slack_settings (webhook_url, is_enabled)
SELECT '', false
WHERE NOT EXISTS (SELECT 1 FROM public.slack_settings);
