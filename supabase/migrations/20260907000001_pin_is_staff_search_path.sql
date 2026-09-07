-- Pin search_path on is_staff() to close the mutable-search_path privilege-escalation
-- vector for this SECURITY DEFINER function. Does not change grants or SECURITY DEFINER:
-- anon/authenticated must retain EXECUTE so public RLS policies like
-- `using (is_active OR is_staff())` on segments/packages/site_settings can still be
-- evaluated for anon (it just returns false for them).
ALTER FUNCTION public.is_staff() SET search_path = public, pg_temp;
