-- Update existing slack_settings with pre-configured values
UPDATE public.slack_settings
SET 
  webhook_url = 'https://hooks.slack.com/services/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',
  bot_token = 'xoxb-5128910387377-10550174811941-VPDuQQbKClTLZTecEFedviYd',
  is_enabled = true,
  updated_at = now();

-- Ensure at least one record exists if the table was empty
INSERT INTO public.slack_settings (webhook_url, bot_token, is_enabled)
SELECT 
  'https://hooks.slack.com/services/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',
  'xoxb-5128910387377-10550174811941-VPDuQQbKClTLZTecEFedviYd',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.slack_settings);
