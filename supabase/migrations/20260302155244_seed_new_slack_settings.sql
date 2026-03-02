-- Update existing slack_settings with newly provided pre-configured values
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
