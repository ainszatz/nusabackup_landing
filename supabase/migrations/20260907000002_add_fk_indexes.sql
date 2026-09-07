-- Add covering indexes for foreign keys flagged by the Supabase performance advisor.
create index if not exists idx_packages_segment_id on packages(segment_id);
create index if not exists idx_package_features_package_id on package_features(package_id);
create index if not exists idx_leads_segment_id on leads(segment_id);
create index if not exists idx_leads_package_id on leads(package_id);
create index if not exists idx_lead_activities_lead_id on lead_activities(lead_id);
