export default function MarketingLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <span className="sr-only">Memuat...</span>
      <div
        className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"
        aria-hidden
      />
    </div>
  )
}
