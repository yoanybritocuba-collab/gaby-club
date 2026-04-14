'use client'

import Link from 'next/link'
import { Wine, Globe } from 'lucide-react'

export function Footer() {
  const negocio = {
    nombre: "Gaby's Club",
    direccion: "Carrer del Tropazi, 24, Gracia, 08012 Barcelona",
    telefono: "+34634492023",
    whatsapp: "+34634492023",
    email: "info@gabysclub.com"
  }

  return (
    <footer className="bg-black border-t border-gold/30 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Wine className="h-5 w-5 text-gold" />
            <span className="text-gold font-medium">{negocio.nombre}</span>
          </div>
          <div className="text-gray-400 text-sm text-center">
            {negocio.direccion}
          </div>
          <div className="flex gap-4">
            <a href={`tel:${negocio.telefono}`} className="text-gold hover:text-gold-light text-sm">
              {negocio.telefono}
            </a>
            <a href={`https://wa.me/${negocio.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light text-sm">
              WhatsApp
            </a>
          </div>
        </div>
        <div className="text-center text-gray-500 text-xs mt-4">
          © {new Date().getFullYear()} {negocio.nombre}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}