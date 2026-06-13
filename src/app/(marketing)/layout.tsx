import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'
import { getPublicSettings } from '@/lib/queries/settings'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getPublicSettings()

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </div>
    </>
  )
}
