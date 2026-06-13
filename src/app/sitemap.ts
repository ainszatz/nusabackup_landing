import type { MetadataRoute } from 'next'
import { getActiveSegments } from '@/lib/queries/segments'
import { getAllActivePackages } from '@/lib/queries/packages'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nusabackup.id'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [segments, packages] = await Promise.all([
    getActiveSegments(),
    getAllActivePackages(),
  ])

  const now = new Date().toISOString()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/kontak`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const segmentRoutes: MetadataRoute.Sitemap = segments.map((seg) => ({
    url: `${SITE_URL}/${seg.slug}`,
    lastModified: seg.updated_at,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const packageRoutes: MetadataRoute.Sitemap = packages
    .filter((p) => p.segment != null)
    .map((p) => ({
      url: `${SITE_URL}/${p.segment!.slug}/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  return [...staticRoutes, ...segmentRoutes, ...packageRoutes]
}
