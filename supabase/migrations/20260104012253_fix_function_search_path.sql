
-- Fix security issue: Set immutable search_path on helper function
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json ->> 'sub'),
    (auth.uid())::text
  )
$$;
