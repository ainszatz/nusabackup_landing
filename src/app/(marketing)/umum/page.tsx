import type { Metadata } from 'next'
import {
  SegmentPageContent,
  buildSegmentMetadata,
} from '@/components/marketing/SegmentPageContent'

export async function generateMetadata(): Promise<Metadata> {
  return buildSegmentMetadata('umum')
}

export default function UmumPage() {
  return <SegmentPageContent slug="umum" />
}
