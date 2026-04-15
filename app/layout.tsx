import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { StoreProvider } from '@/lib/store'
import { I18nProvider } from '@/lib/i18n'
import { BackButtonHandler } from '@/components/back-button-handler'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  title: "Gaby's Club | Coctelería y Picaderas",
  description: "El mejor lugar para disfrutar de cócteles y picaderas en Barcelona",
  keywords: ['bar', 'cócteles', 'picaderas', 'Barcelona', "Gaby's Club"],
  authors: [{ name: "Gaby's Club" }],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Gaby's Club | Coctelería y Picaderas",
    description: 'El mejor lugar para disfrutar de cócteles y picaderas en Barcelona',
    type: 'website',
    locale: 'es_ES',
    alternateLocale: 'en_US',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1a1816' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1816' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <I18nProvider>
            <StoreProvider>
              {children}
              <BackButtonHandler />
            </StoreProvider>
          </I18nProvider>
        </ThemeProvider>
        <Toaster position="bottom-center" richColors />
        
        {/* Script para eliminar el toolbar de Vercel en móviles */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function removeVercelToolbar() {
                  const selectors = [
                    '#__next-vercel-toolbar',
                    '.vercel-toolbar',
                    '[data-vercel-toolbar]',
                    'div[class*="vercel-toolbar"]',
                    'iframe[title*="toolbar"]'
                  ];
                  
                  selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                      if (el) el.remove();
                    });
                  });
                  
                  const allDivs = document.querySelectorAll('div');
                  allDivs.forEach(div => {
                    if (div.style && div.style.position === 'fixed' && div.style.bottom === '20px' && div.style.right === '20px') {
                      div.remove();
                    }
                  });
                }
                
                removeVercelToolbar();
                setTimeout(removeVercelToolbar, 1000);
                setTimeout(removeVercelToolbar, 3000);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}