import type { Metadata } from 'next'
import {
  SegmentPageContent,
  buildSegmentMetadata,
} from '@/components/marketing/SegmentPageContent'

export async function generateMetadata(): Promise<Metadata> {
  return buildSegmentMetadata('kesehatan')
}

export default function KesehatanPage() {
  return <SegmentPageContent slug="kesehatan" />
}
