'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { LineaInformativa } from '@/components/LineaInformativa'
import { BackToHomeButton } from '@/components/BackToHomeButton'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { language } = useI18n()
  const [tickerConfig, setTickerConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTicker = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          console.log('Datos del ticker cargados:', {
            activo: data.tickerActivo,
            texto: data.tickerTexto,
            textoEn: data.tickerTextoEn,
            textoFr: data.tickerTextoFr,
            textoDe: data.tickerTextoDe,
            textoRu: data.tickerTextoRu
          })
          setTickerConfig({
            activo: data.tickerActivo === true,
            texto: data.tickerTexto || '',
            textoEn: data.tickerTextoEn || '',
            textoFr: data.tickerTextoFr || '',
            textoDe: data.tickerTextoDe || '',
            textoRu: data.tickerTextoRu || '',
            colorTexto: data.tickerColorTexto || '#d1b275',
            colorFondo: data.tickerColorFondo || '#000000',
            tamanioLetra: data.tickerTamanioLetra || 14,
            tipoLetra: data.tickerTipoLetra || 'Arial',
            velocidad: data.tickerVelocidad || 10,
            tiempoEntre: data.tickerTiempoEntre || 3,
            altura: data.tickerAltura || 40,
            posicion: data.tickerPosicion || 'top'
          })
        }
      } catch (error) {
        console.error('Error cargando ticker:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTicker()
  }, [])

  if (isLoading) {
    return (
      <>
        <Navbar key={`navbar-${language}`} />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <BackToHomeButton />
      </>
    )
  }

  return (
    <>
      <Navbar key={`navbar-${language}`} />
      {tickerConfig && tickerConfig.activo && (
        <LineaInformativa config={tickerConfig} />
      )}
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <BackToHomeButton />
    </>
  )
}