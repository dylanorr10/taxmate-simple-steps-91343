-- Update all user profiles to replace 'records' with 'tax' in nav_items
UPDATE profiles
SET nav_items = (
  SELECT jsonb_agg(
    CASE 
      WHEN elem::text = '"records"' THEN '"tax"'::jsonb
      ELSE elem
    END
  )
  FROM jsonb_array_elements(nav_items) elem
)
WHERE nav_items @> '["records"]'::jsonb;