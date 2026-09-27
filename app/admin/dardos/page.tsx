'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Target, Clock, Users, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, MessageCircle, Calendar, Phone, Plus, Loader2,
  Inbox, CheckCheck, Ban, Lock, Check, Trash2, Edit3, Search, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  getReservasPendientes,
  getReservasConfirmadas,
  getReservasCanceladas,
  getReservasExpiradas,
  confirmarReserva,
  cancelarReserva,
  eliminarReserva,
  liberarReservasExpiradas,
  crearReservaConBloqueo,
  actualizarReservaConBloqueo,
  getHorariosConfig,
  getHorarioDelDia,
  generarSlotsDisponibles,
  horasMaximasDesde,
  calcularHoraFin,
  getAntelacionMinima,
  type ReservaDardos,
  type HorariosConfig,
} from '@/lib/dardos-services'

type Tab = 'nueva' | 'pendientes' | 'confirmadas' | 'canceladas' | 'expiradas'

const DURACIONES_POSIBLES = [1, 2, 3, 4, 5]

export default function AdminDardosPage() {
  const [tab, setTab] = useState<Tab>('pendientes')
  const [pendientes, setPendientes] = useState<ReservaDardos[]>([])
  const [confirmadas, setConfirmadas] = useState<ReservaDardos[]>([])
  const [canceladas, setCanceladas] = useState<ReservaDardos[]>([])
  const [expiradas, setExpiradas] = useState<ReservaDardos[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState<ReservaDardos | null>(null)

  const cargarTodo = useCallback(async () => {
    try {
      await liberarReservasExpiradas()
      const [p, c, x, e] = await Promise.all([
        getReservasPendientes(),
        getReservasConfirmadas(),
        getReservasCanceladas(),
        getReservasExpiradas(),
      ])
      setPendientes(ordenar(p))
      setConfirmadas(ordenar(c))
      setCanceladas(ordenar(x))
      setExpiradas(ordenar(e))
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar las reservas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarTodo()
    const interval = setInterval(cargarTodo, 30000)
    return () => clearInterval(interval)
  }, [cargarTodo])

  function ordenar(reservas: ReservaDardos[]): ReservaDardos[] {
    return [...reservas].sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`))
  }

  const filtrar = (reservas: ReservaDardos[]) => {
    if (!busqueda.trim()) return reservas
    const q = busqueda.toLowerCase()
    return reservas.filter(r => r.nombre.toLowerCase().includes(q) || r.telefono.includes(q))
  }

  const handleConfirmar = async (id: string) => {
    setProcesando(id)
    try {
      await confirmarReserva(id)
      toast.success('Reserva confirmada')
      await cargarTodo()
    } catch { toast.error('Error al confirmar') } finally { setProcesando(null) }
  }

  const handleCancelar = async (id: string) => {
    if (!confirm('¿Cancelar esta reserva? El horario quedará libre.')) return
    setProcesando(id)
    try {
      await cancelarReserva(id)
      toast.success('Reserva cancelada')
      await cargarTodo()
    } catch { toast.error('Error al cancelar') } finally { setProcesando(null) }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿ELIMINAR definitivamente esta reserva? No se puede deshacer.')) return
    setProcesando(id)
    try {
      await eliminarReserva(id)
      toast.success('Reserva eliminada')
      await cargarTodo()
    } catch { toast.error('Error al eliminar') } finally { setProcesando(null) }
  }

  const handleLimpiarExpiradas = async () => {
    if (!confirm(`¿Eliminar las ${expiradas.length} reservas expiradas?`)) return
    try {
      await Promise.all(expiradas.map(r => eliminarReserva(r.id)))
      toast.success('Expiradas eliminadas')
      await cargarTodo()
    } catch { toast.error('Error al limpiar') }
  }

  const formatFecha = (fecha: string) => {
    const [y, m, d] = fecha.split('-')
    const fechaObj = new Date(`${fecha}T12:00:00`)
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return `${dias[fechaObj.getDay()]} ${d} ${meses[parseInt(m) - 1]} ${y}`
  }

  const abrirWhatsApp = (r: ReservaDardos) => {
    const numero = r.telefono.replace(/[^0-9]/g, '')
    const mensaje = `Hola ${r.nombre}, te escribimos de Gaby's Club. Tu reserva del ${r.fecha} a las ${r.hora} (${r.duracion}h) ha sido confirmada. ¡Te esperamos!`
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const tabs = [
    { id: 'nueva' as Tab, label: 'Nueva', icon: Plus, count: 0 },
    { id: 'pendientes' as Tab, label: 'Pendientes', icon: Inbox, count: pendientes.length },
    { id: 'confirmadas' as Tab, label: 'Confirmadas', icon: CheckCheck, count: confirmadas.length },
    { id: 'canceladas' as Tab, label: 'Canceladas', icon: Ban, count: canceladas.length },
    { id: 'expiradas' as Tab, label: 'Expiradas', icon: AlertCircle, count: expiradas.length },
  ]

  const reservasActuales = useMemo(() => {
    const base = { pendientes, confirmadas, canceladas, expiradas }[tab as Exclude<Tab, 'nueva'>] || []
    return filtrar(base)
  }, [tab, pendientes, confirmadas, canceladas, expiradas, busqueda])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 p-6 border border-gold/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-gold" />
                <span className="text-xs font-medium text-gold uppercase tracking-wider">Reservas Dardos</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Panel de Reservas</h1>
              <p className="text-gray-400 text-sm mt-1">
                Crea, edita y gestiona todas las reservas del reservado VIP.
              </p>
            </div>
            <Button onClick={cargarTodo} variant="outline" className="btn-gold">
              <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-400 uppercase font-bold">Pendientes</p>
              <p className="text-2xl font-bold text-white">{pendientes.length}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-xs text-green-400 uppercase font-bold">Confirmadas</p>
              <p className="text-2xl font-bold text-white">{confirmadas.length}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-xs text-red-400 uppercase font-bold">Canceladas</p>
              <p className="text-2xl font-bold text-white">{canceladas.length}</p>
            </div>
            <div className="bg-gray-600/10 border border-gray-600/30 rounded-lg p-3">
              <p className="text-xs text-gray-400 uppercase font-bold">Expiradas</p>
              <p className="text-2xl font-bold text-white">{expiradas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-2">
        {tabs.map((t) => {
          const Icon = t.icon
          const isActive = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setBusqueda('') }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                isActive ? 'btn-gold-active' : 'btn-gold'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{t.label}</span>
              {t.count > 0 && (
                <span className={cn('ml-1 px-2 py-0.5 rounded-full text-xs font-bold', isActive ? 'bg-black/20 text-black' : 'bg-gold/20 text-gold')}>
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      {tab === 'nueva' ? (
        <FormularioReserva onCreada={() => { cargarTodo(); setTab('pendientes') }} />
      ) : (
        <>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o teléfono..." className="pl-10 bg-gray-950 border-gray-800 text-white" />
            </div>
            {tab === 'expiradas' && expiradas.length > 0 && (
              <Button onClick={handleLimpiarExpiradas} variant="outline" className="border-red-600/50 text-red-400 hover:bg-red-600/10">
                <Trash2 className="mr-2 h-4 w-4" /> Limpiar todas
              </Button>
            )}
          </div>

          {reservasActuales.length === 0 ? (
            <Card className="border-gray-800 bg-gray-950/50">
              <CardContent className="p-12 text-center">
                <Inbox className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {busqueda ? 'No se encontraron resultados' : `No hay reservas ${tab}`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reservasActuales.map((r) => (
                <ReservaAdminCard
                  key={r.id}
                  reserva={r}
                  estado={tab as Exclude<Tab, 'nueva'>}
                  procesando={procesando === r.id}
                  onConfirmar={() => handleConfirmar(r.id)}
                  onCancelar={() => handleCancelar(r.id)}
                  onEliminar={() => handleEliminar(r.id)}
                  onEditar={() => setEditando(r)}
                  onWhatsApp={() => abrirWhatsApp(r)}
                  formatFecha={formatFecha}
                />
              ))}
            </div>
          )}
        </>
      )}

      {editando && (
        <ModalEditarReserva
          reserva={editando}
          onClose={() => setEditando(null)}
          onGuardada={() => { setEditando(null); cargarTodo() }}
        />
      )}
    </div>
  )
}

// ============ FORMULARIO RESERVA ============
function FormularioReserva({
  onCreada,
  reservaEditar,
  onCancelarEdicion,
}: {
  onCreada: () => void
  reservaEditar?: ReservaDardos
  onCancelarEdicion?: () => void
}) {
  const esEdicion = !!reservaEditar

  const [nombre, setNombre] = useState(reservaEditar?.nombre || '')
  const [telefono, setTelefono] = useState(reservaEditar?.telefono || '')
  const [personas, setPersonas] = useState(reservaEditar?.personas?.toString() || '')
  const [fecha, setFecha] = useState(reservaEditar?.fecha || '')
  const [hora, setHora] = useState(reservaEditar?.hora || '')
  const [duracion, setDuracion] = useState(reservaEditar?.duracion || 0)
  const [nota, setNota] = useState(reservaEditar?.nota || '')

  const [horarios, setHorarios] = useState<HorariosConfig | null>(null)
  const [slotsDisponibles, setSlotsDisponibles] = useState<string[]>([])
  const [diaCerrado, setDiaCerrado] = useState(false)
  const [maxHoras, setMaxHoras] = useState(0)
  const [horaCierre, setHoraCierre] = useState<string>('')
  const [isGuardando, setIsGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      const h = await getHorariosConfig()
      setHorarios(h)
    }
    cargar()
  }, [])

  useEffect(() => {
    if (!fecha || !horarios) return
    const horario = getHorarioDelDia(fecha, horarios)
    if (!horario || horario.cerrado) {
      setDiaCerrado(true)
      setSlotsDisponibles([])
      return
    }
    setDiaCerrado(false)
    setSlotsDisponibles(generarSlotsDisponibles(horario.apertura, horario.cierre, fecha))
    setHoraCierre(horario.cierre)
    if (!esEdicion) {
      setHora('')
      setDuracion(0)
    }
  }, [fecha, horarios])

  useEffect(() => {
    if (!hora || !horaCierre) {
      setMaxHoras(0)
      return
    }
    setMaxHoras(horasMaximasDesde(hora, horaCierre))
  }, [hora, horaCierre])

  const horaFin = hora && duracion > 0 ? calcularHoraFin(hora, duracion) : ''
  const hoy = new Date().toISOString().split('T')[0]

  const handleGuardar = async () => {
    setError(null)
    if (!nombre || !telefono || !personas || !fecha || !hora || duracion === 0) {
      setError('Completa todos los campos.')
      return
    }
    setIsGuardando(true)
    try {
      if (esEdicion && reservaEditar) {
        await actualizarReservaConBloqueo(reservaEditar.id, {
          nombre, telefono, personas: parseInt(personas), fecha, hora, duracion, nota
        })
        toast.success('Reserva actualizada')
      } else {
        await crearReservaConBloqueo({
          nombre, telefono, personas: parseInt(personas), fecha, hora, duracion, nota
        })
        toast.success('Reserva creada correctamente')
      }
      onCreada()
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setIsGuardando(false)
    }
  }

  return (
    <Card className="border-gray-800 bg-gray-950/50">
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
            {esEdicion ? <Edit3 className="h-5 w-5 text-gold" /> : <Plus className="h-5 w-5 text-gold" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {esEdicion ? 'Editar Reserva' : 'Nueva Reserva Manual'}
            </h2>
            <p className="text-xs text-gray-400">
              {esEdicion ? 'Modifica los datos de la reserva' : 'Reserva para cliente presente en el local'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Nombre *</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-2 bg-gray-900 border-gray-700 text-white" />
          </div>
          <div>
            <Label className="text-white">WhatsApp *</Label>
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-2 bg-gray-900 border-gray-700 text-white" />
          </div>
          <div>
            <Label className="text-white">Personas *</Label>
            <Input type="number" min="1" value={personas} onChange={(e) => setPersonas(e.target.value)} className="mt-2 bg-gray-900 border-gray-700 text-white" />
          </div>
          <div>
            <Label className="text-white">Fecha *</Label>
            <Input type="date" min={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-2 bg-gray-900 border-gray-700 text-white" />
          </div>
        </div>

        <div>
          <Label className="text-white">Hora de inicio *</Label>
          <select value={hora} onChange={(e) => setHora(e.target.value)} disabled={!fecha || diaCerrado} className="w-full mt-2 rounded-md border border-gray-700 bg-gray-900 p-2 text-white disabled:opacity-50">
            <option value="">Selecciona una hora</option>
            {slotsDisponibles.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        {hora && (
          <div>
            <Label className="text-white">Duración *</Label>
            <p className="text-xs text-gray-400 mb-3">
              {maxHoras === 0 ? 'No hay horas disponibles' : `Máximo ${maxHoras} hora${maxHoras === 1 ? '' : 's'}`}
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
            {horaFin && (
              <p className="text-xs text-gold mt-3 text-center">🕐 Reserva: <strong>{hora} - {horaFin}</strong></p>
            )}
          </div>
        )}

        <div>
          <Label className="text-white">Nota (opcional)</Label>
          <Input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej: Cumpleaños, reserva VIP..." className="mt-2 bg-gray-900 border-gray-700 text-white" />
        </div>

        {diaCerrado && (
          <div className="p-3 rounded-lg bg-red-500/10 border-2 border-red-500/60 text-red-400 text-sm animate-pulse-red">
            ⛔ Este día está cerrado
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border-2 border-red-500/60 text-red-400 text-sm animate-pulse-red">
            ⛔ {error}
          </div>
        )}

        <div className="pt-2 flex justify-center gap-3">
          {esEdicion && onCancelarEdicion && (
            <Button variant="outline" onClick={onCancelarEdicion} className="btn-gold">
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleGuardar}
            disabled={isGuardando || !nombre || !telefono || !personas || !fecha || !hora || duracion === 0}
            className="btn-gold font-bold px-10 py-3 rounded-full disabled:opacity-50"
          >
            {isGuardando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (esEdicion ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
            {esEdicion ? 'Guardar cambios' : 'Crear Reserva'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ MODAL EDITAR ============
function ModalEditarReserva({
  reserva,
  onClose,
  onGuardada,
}: {
  reserva: ReservaDardos
  onClose: () => void
  onGuardada: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl my-8">
        <FormularioReserva
          reservaEditar={reserva}
          onCreada={onGuardada}
          onCancelarEdicion={onClose}
        />
      </div>
    </div>
  )
}

// ============ CARD RESERVA ============
function ReservaAdminCard({
  reserva, estado, procesando,
  onConfirmar, onCancelar, onEliminar, onEditar, onWhatsApp, formatFecha,
}: {
  reserva: ReservaDardos
  estado: Exclude<Tab, 'nueva'>
  procesando: boolean
  onConfirmar: () => void
  onCancelar: () => void
  onEliminar: () => void
  onEditar: () => void
  onWhatsApp: () => void
  formatFecha: (f: string) => string
}) {
  const colorBorde = {
    pendientes: 'border-yellow-500/40',
    confirmadas: 'border-green-500/40',
    canceladas: 'border-red-500/40',
    expiradas: 'border-gray-600/40',
  }[estado]

  const colorIcono = {
    pendientes: 'bg-yellow-500/20 text-yellow-400',
    confirmadas: 'bg-green-500/20 text-green-400',
    canceladas: 'bg-red-500/20 text-red-400',
    expiradas: 'bg-gray-600/20 text-gray-400',
  }[estado]

  const etiqueta = {
    pendientes: 'PENDIENTE',
    confirmadas: 'CONFIRMADA',
    canceladas: 'CANCELADA',
    expiradas: 'EXPIRADA',
  }[estado]

  return (
    <Card className={cn('border bg-gray-950/50', colorBorde)}>
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', colorIcono)}>
            <Target className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h3 className="text-lg font-bold text-white">{reserva.nombre}</h3>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold border', colorBorde, colorIcono)}>
                {etiqueta}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="h-4 w-4 text-gold" />
                <span>{formatFecha(reserva.fecha)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="h-4 w-4 text-gold" />
                <span>{reserva.hora} - {reserva.horaFin}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="h-4 w-4 text-gold" />
                <span>{reserva.personas} pers.</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="h-4 w-4 text-gold" />
                <span className="truncate">{reserva.telefono}</span>
              </div>
            </div>

            {reserva.nota && (
              <p className="text-xs text-gray-500 mt-2 italic">📝 {reserva.nota}</p>
            )}

            {estado === 'pendientes' && (
              <p className="text-xs text-yellow-400/80 mt-2">
                ⏱️ Expira: {reserva.expiraEn.toLocaleString('es-ES')}
              </p>
            )}
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 md:flex-shrink-0">
            <Button onClick={onWhatsApp} variant="outline" size="sm" className="border-green-600/50 text-green-400 hover:bg-green-600/10">
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
            </Button>

            {estado === 'pendientes' && (
              <>
                <Button onClick={onConfirmar} disabled={procesando} size="sm" className="bg-green-600 hover:bg-green-500 text-white">
                  {procesando ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Confirmar
                </Button>
                <Button onClick={onCancelar} disabled={procesando} variant="outline" size="sm" className="border-red-600/50 text-red-400 hover:bg-red-600/10">
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
              </>
            )}

            {estado === 'confirmadas' && (
              <>
                <Button onClick={onEditar} variant="outline" size="sm" className="btn-gold">
                  <Edit3 className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button onClick={onCancelar} disabled={procesando} variant="outline" size="sm" className="border-red-600/50 text-red-400 hover:bg-red-600/10">
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
              </>
            )}

            {(estado === 'canceladas' || estado === 'expiradas') && (
              <Button onClick={onEliminar} disabled={procesando} variant="outline" size="sm" className="border-red-600/50 text-red-400 hover:bg-red-600/10">
                {procesando ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}