import type { Metadata } from 'next'
import {
  SegmentPageContent,
  buildSegmentMetadata,
} from '@/components/marketing/SegmentPageContent'

export async function generateMetadata(): Promise<Metadata> {
  return buildSegmentMetadata('pendidikan')
}

export default function PendidikanPage() {
  return <SegmentPageContent slug="pendidikan" />
}
