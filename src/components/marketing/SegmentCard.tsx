import Link from 'next/link'
import Image from 'next/image'
import type { Segment } from '@/types'

interface SegmentCardProps {
  segment: Segment
}

const SEGMENT_META: Record<string, { color: string; border: string; bg: string; emoji: string }> = {
  umum: {
    color: 'text-brand-600',
    border: 'border-brand-600',
    bg: 'bg-brand-50',
    emoji: '🏢',
  },
  pendidikan: {
    color: 'text-emerald-600',
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
    emoji: '🎓',
  },
  kesehatan: {
    color: 'text-rose-600',
    border: 'border-rose-500',
    bg: 'bg-rose-50',
    emoji: '⚕️',
  },
}

export function SegmentCard({ segment }: SegmentCardProps) {
  const meta = SEGMENT_META[segment.slug] ?? SEGMENT_META.umum

  return (
    <Link
      href={`/${segment.slug}`}
      className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Colored top accent bar */}
      <span
        className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl ${meta.border.replace('border-', 'bg-')}`}
        aria-hidden
      />

      {/* Icon */}
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${meta.bg} mb-5`}>
        {segment.icon ? (
          <Image
            src={segment.icon}
            alt={segment.name}
            width={28}
            height={28}
            className="object-contain"
          />
        ) : (
          <span className="text-2xl" role="img" aria-label={segment.name}>
            {meta.emoji}
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className={`font-display font-bold text-xl text-navy-900 mb-2`}>
        {segment.name}
      </h3>
      {segment.tagline && (
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
          {segment.tagline}
        </p>
      )}

      {/* Footer link */}
      <div className={`flex items-center gap-1.5 mt-5 text-sm font-semibold ${meta.color}`}>
        Lihat paket
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          className="transition-transform group-hover:translate-x-1"
          aria-hidden
        >
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  )
}
