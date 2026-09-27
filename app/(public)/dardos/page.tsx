'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Target, Clock, Users, MessageCircle, ChevronLeft, ChevronRight, AlertCircle, Phone, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  crearReservaConBloqueo,
  getHorariosConfig,
  getHorarioDelDia,
  generarSlotsDisponibles,
  horasMaximasDesde,
  calcularHoraFin,
  getAntelacionMinima,
  type HorariosConfig,
} from '@/lib/dardos-services'

const IMAGENES = [
  { url: '/imagenes/422737-dart-454186_1920.jpg', titulo: 'Reservado VIP de Dardos', subtitulo: 'Tu espacio privado para grupos' },
  { url: '/imagenes/ds-foto-darts-673229_1920.jpg', titulo: 'Dianas Electrónicas', subtitulo: 'Puntuación automática en pantalla' },
  { url: '/imagenes/grvault-darts-2966934_1920.jpg', titulo: 'Zona Privada', subtitulo: 'Ambiente exclusivo para grupos' },
  { url: '/imagenes/photoshopzen-darts-5760240_1920.jpg', titulo: 'Compite con Amigos', subtitulo: 'Diversión garantizada' }
]

const DURACIONES_POSIBLES = [1, 2, 3, 4, 5]

type PasoFormulario = 'datos' | 'contactar'

export default function DardosPage() {
  const [paso, setPaso] = useState<PasoFormulario>('datos')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [personas, setPersonas] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [duracion, setDuracion] = useState(0)
  const [slideActual, setSlideActual] = useState(0)
  const [horarios, setHorarios] = useState<HorariosConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGuardando, setIsGuardando] = useState(false)
  const [slotsDisponibles, setSlotsDisponibles] = useState<string[]>([])
  const [diaCerrado, setDiaCerrado] = useState(false)
  const [maxHoras, setMaxHoras] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [horaCierre, setHoraCierre] = useState<string>('')

  useEffect(() => {
    const cargar = async () => {
      const h = await getHorariosConfig()
      setHorarios(h)
      setIsLoading(false)
    }
    cargar()
  }, [])

  useEffect(() => {
    if (!fecha || !horarios) {
      setSlotsDisponibles([])
      setDiaCerrado(false)
      return
    }
    const horario = getHorarioDelDia(fecha, horarios)
    if (!horario || horario.cerrado) {
      setDiaCerrado(true)
      setSlotsDisponibles([])
      setHora('')
      return
    }
    setDiaCerrado(false)
    setSlotsDisponibles(generarSlotsDisponibles(horario.apertura, horario.cierre, fecha))
    setHoraCierre(horario.cierre)
    setHora('')
    setDuracion(0)
  }, [fecha, horarios])

  useEffect(() => {
    if (!hora || !horaCierre) {
      setMaxHoras(0)
      setDuracion(0)
      return
    }
    const max = horasMaximasDesde(hora, horaCierre)
    setMaxHoras(max)
    setDuracion(0)
  }, [hora, horaCierre])

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideActual((prev) => (prev + 1) % IMAGENES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const irAnterior = () => setSlideActual((prev) => (prev - 1 + IMAGENES.length) % IMAGENES.length)
  const irSiguiente = () => setSlideActual((prev) => (prev + 1) % IMAGENES.length)

  const horaFin = hora && duracion > 0 ? calcularHoraFin(hora, duracion) : ''

  const handleSiguiente = async () => {
    setError(null)
    if (!nombre || !telefono || !personas || !fecha || !hora || duracion === 0) {
      setError('Por favor, completa todos los campos.')
      return
    }

    setIsGuardando(true)
    try {
      await crearReservaConBloqueo({
        nombre,
        telefono,
        personas: parseInt(personas),
        fecha,
        hora,
        duracion,
      })
      setPaso('contactar')
    } catch (err: any) {
      setError(err.message || 'No se pudo crear la reserva.')
    } finally {
      setIsGuardando(false)
    }
  }

  const handleEnviarWhatsApp = () => {
    const numeroBar = '34634492023'
    const fechaObj = new Date(fecha + 'T12:00:00')
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
    const diaSemana = diasSemana[fechaObj.getDay()]
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

    const mensaje = `Hola, he solicitado una reserva en la web.%0A%0A` +
      `👤 Nombre: ${nombre}%0A` +
      `📱 WhatsApp: ${telefono}%0A` +
      `📅 Fecha: ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${fechaFormateada}%0A` +
      `🕐 Hora: ${hora} - ${horaFin}%0A` +
      `⏱️ Duración: ${duracion} hora${duracion === 1 ? '' : 's'}%0A` +
      `👥 Personas: ${personas}%0A%0A` +
      `Por favor, confírmame la disponibilidad.`

    window.open(`https://wa.me/${numeroBar}?text=${mensaje}`, '_blank')
  }

  const hoy = new Date().toISOString().split('T')[0]
  const formCompleto = !!(nombre && telefono && personas && fecha && hora && duracion > 0)
  const puedeEnviar = formCompleto && !diaCerrado && !isGuardando

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* HERO */}
      <section className="relative h-[55vh] min-h-[420px] w-full overflow-hidden">
        {IMAGENES.map((img, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === slideActual ? 'opacity-100' : 'opacity-0'}`}>
            <img src={img.url} alt={img.titulo} className="w-full h-full object-cover object-center" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Target className="h-4 w-4 text-gold" />
            <span className="text-xs uppercase tracking-wider text-gold">Reservado VIP</span>
          </div>
          <h1 className="mb-4 font-display text-4xl md:text-6xl font-bold">{IMAGENES[slideActual].titulo}</h1>
          <p className="mb-8 text-base md:text-lg text-white/90 max-w-xl">{IMAGENES[slideActual].subtitulo}</p>
        </div>
        <button onClick={irAnterior} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors">
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button onClick={irSiguiente} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors">
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {IMAGENES.map((_, index) => (
            <button key={index} onClick={() => setSlideActual(index)} className={`h-2 rounded-full transition-all ${index === slideActual ? 'w-8 bg-gold' : 'w-2 bg-white/50'}`} />
          ))}
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gold">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
            </Button>
          </Link>
        </div>

        {/* PASO 1: DATOS */}
        {paso === 'datos' && (
          <>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                Reserva tu <span className="text-gold">Reservado VIP</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Espacio privado con dianas electrónicas, monitores y servicio de cócteles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="text-center p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                <Target className="h-8 w-8 text-gold mx-auto mb-2" />
                <h3 className="text-white font-semibold text-sm">Zona Privada</h3>
                <p className="text-xs text-gray-400">Reservado solo para tu grupo</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                <Clock className="h-8 w-8 text-gold mx-auto mb-2" />
                <h3 className="text-white font-semibold text-sm">Duración Flexible</h3>
                <p className="text-xs text-gray-400">Hasta el cierre</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                <Users className="h-8 w-8 text-gold mx-auto mb-2" />
                <h3 className="text-white font-semibold text-sm">Grupos</h3>
                <p className="text-xs text-gray-400">Cualquier cantidad</p>
              </div>
            </div>

            <Card className="border-gray-800 bg-gray-950/50">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white">Tu nombre *</Label>
                    <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" className="mt-2 bg-gray-900 border-gray-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-white">Tu WhatsApp *</Label>
                    <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: +34 600 000 000" className="mt-2 bg-gray-900 border-gray-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-white">Número de personas *</Label>
                    <Input type="number" min="1" value={personas} onChange={(e) => setPersonas(e.target.value)} placeholder="Ej: 8" className="mt-2 bg-gray-900 border-gray-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-white">Fecha *</Label>
                    <Input type="date" min={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-2 bg-gray-900 border-gray-700 text-white" />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Hora de inicio *</Label>
                  <select
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    disabled={!fecha || diaCerrado}
                    className="w-full mt-2 rounded-md border border-gray-700 bg-gray-900 p-2 text-white disabled:opacity-50"
                  >
                    <option value="">Selecciona una hora</option>
                    {slotsDisponibles.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {fecha && !diaCerrado && slotsDisponibles.length === 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-red-500/10 border-2 border-red-500/60 animate-pulse-red">
                      <p className="text-xs text-red-400 font-bold">
                        ⛔ No hay horas disponibles para este día
                      </p>
                      <p className="text-xs text-red-300/80 mt-1">
                        La antelación mínima es de {getAntelacionMinima(fecha)} hora(s) antes de la reserva.
                      </p>
                    </div>
                  )}
                </div>

                {hora && (
                  <div>
                    <Label className="text-white">Duración *</Label>
                    <p className="text-xs text-gray-400 mb-3">
                      {maxHoras === 0
                        ? 'No quedan horas disponibles para esta hora'
                        : `Disponibles hasta ${maxHoras} hora${maxHoras === 1 ? '' : 's'} antes del cierre`
                      }
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {DURACIONES_POSIBLES.map((h) => {
                        const disponible = h <= maxHoras
                        const seleccionada = duracion === h
                        return (
                          <button
                            key={h}
                            type="button"
                            disabled={!disponible}
                            onClick={() => setDuracion(h)}
                            className={cn(
                              'relative flex flex-col items-center justify-center rounded-full p-3 border-2 transition-all duration-200',
                              !disponible && 'bg-gray-950/60 border-gray-800 cursor-not-allowed opacity-50',
                              disponible && !seleccionada && 'btn-gold cursor-pointer',
                              seleccionada && 'btn-gold-active'
                            )}
                          >
                            <div className="flex items-center justify-center mb-1">
                              {disponible ? (
                                seleccionada ? <Check className="h-4 w-4 text-black" /> : <Check className="h-4 w-4 text-gold" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-600" />
                              )}
                            </div>
                            <span className={cn('text-sm font-bold', !disponible && 'text-gray-600')}>
                              {h}h
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {maxHoras === 0 && (
                      <div className="mt-3 p-4 rounded-lg bg-red-500/10 border-2 border-red-500/60 animate-pulse-red">
                        <p className="text-sm text-red-400 font-bold">
                          ⛔ A esta hora ya no se puede reservar
                        </p>
                        <p className="text-xs text-red-300/80 mt-1">
                          La última reserva permitida es {getAntelacionMinima(fecha)} hora(s) antes del cierre.
                        </p>
                      </div>
                    )}

                    {hora && horaFin && duracion > 0 && (
                      <p className="text-xs text-gold mt-3 text-center">
                        🕐 Tu reserva: <strong>{hora} - {horaFin}</strong>
                      </p>
                    )}
                  </div>
                )}

                {diaCerrado && (
                  <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500/60 flex items-start gap-3 animate-pulse-red">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-400 font-bold">⛔ Este día estamos cerrados</p>
                      <p className="text-xs text-red-300/80">Por favor, elige otro día para tu reserva.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500/60 animate-pulse-red">
                    <p className="text-sm text-red-400 font-bold">⛔ {error}</p>
                  </div>
                )}

                <div className="pt-4 flex justify-center">
                  <Button
                    onClick={handleSiguiente}
                    disabled={!puedeEnviar}
                    className="btn-gold text-base px-12 py-3 rounded-full font-bold disabled:opacity-50"
                  >
                    {isGuardando ? 'Guardando...' : 'Siguiente'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* PASO 2: CONFIRMAR POR WHATSAPP */}
        {paso === 'contactar' && (
          <Card className="border-gold/40 bg-gradient-to-br from-gray-950 to-black max-w-2xl mx-auto">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gold/20 flex items-center justify-center">
                <Phone className="h-10 w-10 text-gold" />
              </div>

              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
                  Último paso para confirmar tu reserva
                </h2>
                <p className="text-gray-300 text-base mb-2">
                  Hemos recibido tu solicitud. Para confirmarla, <strong className="text-gold">contáctanos por WhatsApp</strong> o llámanos.
                </p>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Si en <strong className="text-gold">30 minutos</strong> no recibimos tu mensaje, el horario se liberará automáticamente para otros clientes.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-900/70 border border-gold/20 text-left space-y-2">
                <p className="text-sm text-gray-300"><strong className="text-gold">Nombre:</strong> {nombre}</p>
                <p className="text-sm text-gray-300"><strong className="text-gold">Fecha:</strong> {fecha}</p>
                <p className="text-sm text-gray-300"><strong className="text-gold">Hora:</strong> {hora} - {horaFin}</p>
                <p className="text-sm text-gray-300"><strong className="text-gold">Duración:</strong> {duracion} hora{duracion === 1 ? '' : 's'}</p>
                <p className="text-sm text-gray-300"><strong className="text-gold">Personas:</strong> {personas}</p>
              </div>

              <div className="pt-2 space-y-3">
                <Button onClick={handleEnviarWhatsApp} className="w-full bg-green-600 hover:bg-green-500 text-white text-lg py-6 rounded-full font-bold">
                  <MessageCircle className="mr-3 h-6 w-6" />
                  Confirmar por WhatsApp
                </Button>
                <a href="tel:+34634492023" className="block">
                  <Button variant="outline" className="btn-gold w-full py-5 rounded-full">
                    <Phone className="mr-3 h-5 w-5" />
                    Llamar por teléfono
                  </Button>
                </a>
                <p className="text-xs text-gray-500 pt-2">
                  ⏱️ Tienes 30 minutos para confirmar. Después, el horario se liberará.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}