-- Package features are public content, but anonymous readers should not see
-- features belonging to inactive packages. Staff keep full access through the
-- existing "staff manage features" policy.
drop policy if exists "read package features" on public.package_features;

create policy "read active package features"
  on public.package_features for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.packages p
      where p.id = package_features.package_id
        and p.is_active
    )
  );
