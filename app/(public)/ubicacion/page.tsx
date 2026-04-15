'use client'

import { MapPin, Phone, Mail, MessageCircle, Wine, Navigation, Bus, Train, Car } from 'lucide-react'
import Link from 'next/link'

export default function UbicacionPage() {
  const negocio = {
    nombre: "Gaby's Club",
    direccion: "Carrer del Tropazi, 24, Gràcia, 08012 Barcelona",
    telefono: "+34634492023",
    whatsapp: "+34634492023",
    email: "info@gabysclub.com"
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.direccion)}`
  const whatsappUrl = `https://wa.me/${negocio.whatsapp.replace(/[^0-9]/g, '')}`

  // Coordenadas aproximadas de Gràcia
  const lat = 41.4015
  const lng = 2.1565

  // Enlaces de transporte
  const transportes = [
    {
      icon: Bus,
      name: "Autobús",
      lines: ["24", "39", "H6", "V17"],
      description: "Parada Lesseps / Travessera de Dalt",
      url: `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},17z/data=!4m2!4m1!3e3`
    },
    {
      icon: Train,
      name: "Metro",
      lines: ["L3 (Lesseps)", "L3 (Fontana)", "L7 (Gràcia)"],
      description: "Estaciones a 5-10 minutos",
      url: `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},17z/data=!4m2!4m1!3e3`
    },
    {
      icon: Car,
      name: "Coche",
      lines: ["Ronda de Dalt (B20)", "Travessera de Dalt"],
      description: "Aparcamiento público cercano",
      url: `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},17z/data=!4m2!4m1!3e3`
    }
  ]

  return (
    <div className="min-h-screen bg-black pt-[70px] md:pt-[85px]">
      <div className="container mx-auto px-4 py-12">
        {/* Título */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-1.5 mb-4">
            <MapPin className="h-4 w-4 text-gold" />
            <span className="text-xs font-medium text-gold uppercase tracking-wider">Encuéntranos</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gold mb-4">
            Nuestra Ubicación
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Ven a disfrutar de los mejores cócteles y tapas en el corazón de Gràcia
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mapa */}
          <div className="rounded-xl overflow-hidden border border-gold/30 shadow-lg bg-gray-900">
            <div className="relative w-full h-[400px] bg-gray-800 flex items-center justify-center">
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=Carrer+del+Tropazi+24+Barcelona&zoom=15&size=600x400&markers=color:gold%7CCarrer+del+Tropazi+24+Barcelona&key=AIzaSyBtZzm_wnE_lyi3F8qr8iCQdQA4TSEyozU`}
                alt="Mapa de ubicación"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-center p-4">
                      <MapPin className="h-12 w-12 text-gold mb-2" />
                      <p class="text-white font-medium">${negocio.direccion}</p>
                      <a href="${mapsUrl}" target="_blank" class="text-gold mt-4 underline">Abrir en Google Maps</a>
                    </div>`
                  }
                }}
              />
            </div>
            <div className="p-3 bg-gray-900 text-center border-t border-gold/30">
              <a 
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light text-sm flex items-center justify-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Abrir en Google Maps
              </a>
            </div>
          </div>

          {/* Información de contacto y transporte */}
          <div className="space-y-6">
            {/* Información del negocio */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gold/30">
              <div className="flex items-center gap-3 mb-4">
                <Wine className="h-6 w-6 text-gold" />
                <h2 className="text-xl font-bold text-white">{negocio.nombre}</h2>
              </div>
              
              <div className="space-y-4">
                <a 
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-300 hover:text-gold transition-colors group"
                >
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-gold" />
                  <span className="group-hover:text-gold">{negocio.direccion}</span>
                </a>
                
                <a 
                  href={`tel:${negocio.telefono}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-gold transition-colors group"
                >
                  <Phone className="h-5 w-5 text-gold" />
                  <span className="group-hover:text-gold">{negocio.telefono}</span>
                </a>
                
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-300 hover:text-gold transition-colors group"
                >
                  <MessageCircle className="h-5 w-5 text-gold" />
                  <span className="group-hover:text-gold">WhatsApp: {negocio.whatsapp}</span>
                </a>
                
                <a 
                  href={`mailto:${negocio.email}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-gold transition-colors group"
                >
                  <Mail className="h-5 w-5 text-gold" />
                  <span className="group-hover:text-gold">{negocio.email}</span>
                </a>
              </div>
            </div>

            {/* Cómo llegar - Transporte */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gold/30">
              <div className="flex items-center gap-3 mb-4">
                <Navigation className="h-6 w-6 text-gold" />
                <h2 className="text-xl font-bold text-white">Cómo llegar</h2>
              </div>
              
              <div className="space-y-4">
                {transportes.map((transporte, index) => {
                  const Icon = transporte.icon
                  return (
                    <a
                      key={index}
                      href={transporte.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg bg-gray-800/50 hover:bg-gold/10 transition-all group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-gold mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-white group-hover:text-gold transition-colors">
                            {transporte.name}
                          </h3>
                          <p className="text-sm text-gray-400">{transporte.lines.join(" • ")}</p>
                          <p className="text-xs text-gray-500 mt-1">{transporte.description}</p>
                        </div>
                        <Navigation className="h-4 w-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Botón de dirección */}
            <a 
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-gold text-black font-semibold py-3 rounded-xl hover:bg-gold-dark transition-colors"
            >
              Cómo llegar (Google Maps)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}