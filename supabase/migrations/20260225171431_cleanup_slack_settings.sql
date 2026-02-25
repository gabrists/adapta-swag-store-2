-- Delete redundant rows from slack_settings, keeping only the most recently updated one
WITH RankedSettings AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST) as rn
  FROM public.slack_settings
)
DELETE FROM public.slack_settings
WHERE id IN (
  SELECT id FROM RankedSettings WHERE rn > 1
);
