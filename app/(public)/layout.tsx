'use client'

import { useI18n } from '@/lib/i18n'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/WhatsAppButton'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { language } = useI18n()

  return (
    <>
      <Navbar key={`navbar-${language}`} />
      <main className="flex-1" key={`main-${language}`}>{children}</main>
      <Footer key={`footer-${language}`} />
      <WhatsAppButton />
    </>
  )
}