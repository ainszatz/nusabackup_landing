import type { Tables } from './database'

export type Segment = Tables<'segments'>
export type Package = Tables<'packages'>
export type PackageFeature = Tables<'package_features'>
export type Lead = Tables<'leads'>
export type LeadActivity = Tables<'lead_activities'>
export type SiteSettings = Tables<'site_settings'>

export type PackageWithDetails = Package & {
  segment: Pick<Segment, 'id' | 'slug' | 'name'> | null
  features: PackageFeature[]
}

export type SegmentWithPackages = Segment & {
  packages: PackageWithDetails[]
}

export type PublicSettings = Record<string, string>
