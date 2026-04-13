'use client'

import { Star } from 'lucide-react'

export function SuggestionCard({ product }: { product: any }) {
  const nombre = product.nombre || ''
  const descripcion = product.descripcion || ''

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gold/50 transition-all duration-300">
      <div className="aspect-[4/3] overflow-hidden bg-gray-800">
        {product.imagenUrl ? (
          <img 
            src={product.imagenUrl} 
            alt={nombre} 
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl bg-gradient-to-br from-gray-800 to-gray-900">
            🍽️
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-white line-clamp-1">{nombre}</h3>
          <p className="font-bold text-gold">€{product.precio.toFixed(2)}</p>
        </div>
        {descripcion && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">{descripcion}</p>
        )}
        {product.destacado && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="text-xs text-gold">Destacado</span>
          </div>
        )}
      </div>
    </div>
  )
}