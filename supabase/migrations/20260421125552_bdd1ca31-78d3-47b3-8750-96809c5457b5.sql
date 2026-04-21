DROP POLICY IF EXISTS "Service role can write handoff packs" ON storage.objects;

CREATE POLICY "Users can write to their own handoff folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'handoff-packs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);