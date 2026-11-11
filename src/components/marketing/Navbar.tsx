'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const segments = [
  { href: '/umum', label: 'Umum' },
  { href: '/pendidikan', label: 'Pendidikan' },
  { href: '/kesehatan', label: 'Kesehatan' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape and outside-click close the mobile menu (WCAG 2.1.2).
  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (
        !menuRef.current?.contains(target) &&
        !toggleRef.current?.contains(target)
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-white/95 backdrop-blur-sm shadow-[0_1px_0_0_rgba(0,0,0,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <nav
        aria-label="Navigasi utama"
        className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between gap-8"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group min-h-11">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 group-hover:bg-brand-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="white"/>
            </svg>
          </span>
          <span
            className={`font-display font-bold text-lg tracking-tight transition-colors ${
              scrolled || menuOpen ? 'text-navy-900' : 'text-white'
            }`}
          >
            NusaBackup
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {segments.map((s) => {
            const active = isActive(s.href)
            return (
              <Link
                key={s.href}
                href={s.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center min-h-11 px-4 rounded-lg text-sm transition-colors ${
                  active
                    ? scrolled
                      ? 'font-semibold text-brand-700 bg-brand-50'
                      : 'font-semibold text-white bg-white/15'
                    : scrolled
                    ? 'font-medium text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                    : 'font-medium text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {s.label}
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/kontak"
            aria-current={isActive('/kontak') ? 'page' : undefined}
            className="inline-flex items-center gap-2 min-h-11 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Hubungi Kami
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={toggleRef}
          type="button"
          className={`md:hidden inline-flex items-center justify-center min-w-11 min-h-11 rounded-lg ${
            scrolled || menuOpen ? 'text-navy-900' : 'text-white'
          }`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            aria-hidden
          >
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu — kept mounted so aria-controls always resolves. */}
      <div
        id="mobile-nav"
        ref={menuRef}
        hidden={!menuOpen}
        className="md:hidden bg-white border-t border-slate-100 px-6 py-4"
      >
        {menuOpen && (
          <div className="flex flex-col gap-1">
            {segments.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(s.href) ? 'page' : undefined}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive(s.href)
                    ? 'text-brand-700 bg-brand-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </Link>
            ))}
            <Link
              href="/kontak"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-600 text-white font-semibold transition-colors hover:bg-brand-700"
            >
              Hubungi Kami
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
