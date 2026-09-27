import { db } from './firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'

// ============ TIPOS ============
export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'expirada'

export interface ReservaDardos {
  id: string
  nombre: string
  telefono: string
  personas: number
  fecha: string
  hora: string
  duracion: number
  horaFin: string
  estado: EstadoReserva
  expiraEn: Date
  creadoEn: Date
  confirmadoEn?: Date
  canceladoEn?: Date
  nota?: string
}

export interface HorarioDia {
  apertura: string
  cierre: string
  cerrado: boolean
}

export interface HorariosConfig {
  lunes: HorarioDia
  martes: HorarioDia
  miercoles: HorarioDia
  jueves: HorarioDia
  viernes: HorarioDia
  sabado: HorarioDia
  domingo: HorarioDia
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

// ============ CONFIGURACIÓN DE ANTELACIÓN ============
const ANTELACION_POR_DIA: Record<string, number> = {
  lunes: 1,
  martes: 1,
  miercoles: 1,
  jueves: 1,
  viernes: 2,
  sabado: 2,
  domingo: 2,
}

// ============ HELPERS ============
function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

function minutosAHora(minutos: number): string {
  const m = ((minutos % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function haySolapamiento(
  horaA: string, duracionA: number,
  horaB: string, duracionB: number
): boolean {
  const inicioA = horaAMinutos(horaA)
  const finA = inicioA + duracionA * 60
  const inicioB = horaAMinutos(horaB)
  const finB = inicioB + duracionB * 60
  return inicioA < finB && inicioB < finA
}

export function horasMaximasDesde(horaInicio: string, horaCierre: string): number {
  const inicio = horaAMinutos(horaInicio)
  let cierre = horaAMinutos(horaCierre)
  if (cierre <= inicio) cierre += 24 * 60
  const disponible = cierre - inicio
  if (disponible < 60) return 0
  return Math.floor(disponible / 60)
}

export function getAntelacionMinima(fechaISO: string): number {
  const fechaObj = new Date(fechaISO + 'T12:00:00')
  const dia = DIAS_SEMANA[fechaObj.getDay()]
  return ANTELACION_POR_DIA[dia] || 1
}

export function cumpleAntelacion(fechaISO: string, horaInicio: string): boolean {
  const ahora = new Date()
  const fechaObj = new Date(fechaISO + 'T00:00:00')
  const [h, m] = horaInicio.split(':').map(Number)
  fechaObj.setHours(h, m, 0, 0)

  if (h < 6) {
    fechaObj.setDate(fechaObj.getDate() + 1)
  }

  const diffHoras = (fechaObj.getTime() - ahora.getTime()) / (1000 * 60 * 60)
  const antelacion = getAntelacionMinima(fechaISO)
  return diffHoras >= antelacion
}

export function generarSlotsDisponibles(
  apertura: string,
  cierre: string,
  fechaISO?: string
): string[] {
  const inicio = horaAMinutos(apertura)
  let cierreMin = horaAMinutos(cierre)
  if (cierreMin <= inicio) cierreMin += 24 * 60
  const ultimoSlot = cierreMin - 60

  const slots: string[] = []
  for (let m = inicio; m <= ultimoSlot; m += 60) {
    slots.push(minutosAHora(m))
  }

  if (fechaISO) {
    return slots.filter((hora) => cumpleAntelacion(fechaISO, hora))
  }

  return slots
}

export function getHorarioDelDia(fechaISO: string, horarios: HorariosConfig): HorarioDia | null {
  const fechaObj = new Date(fechaISO + 'T12:00:00')
  const dia = DIAS_SEMANA[fechaObj.getDay()] as keyof HorariosConfig
  return horarios[dia] || null
}

export function calcularHoraFin(hora: string, duracion: number): string {
  const inicio = horaAMinutos(hora)
  const fin = inicio + duracion * 60
  return minutosAHora(fin)
}

// ============ CREAR CON TRANSACCIÓN ============
export async function crearReservaConBloqueo(datos: {
  nombre: string
  telefono: string
  personas: number
  fecha: string
  hora: string
  duracion: number
  nota?: string
}): Promise<string> {
  const reservasRef = collection(db, 'reservas_dardos')
  const nuevaReservaRef = doc(reservasRef)
  const horaFin = calcularHoraFin(datos.hora, datos.duracion)
  const ahora = new Date()
  const expiraEn = new Date(ahora.getTime() + 60 * 60 * 1000)

  await runTransaction(db, async (transaction) => {
    const q = query(
      reservasRef,
      where('fecha', '==', datos.fecha),
      where('estado', 'in', ['pendiente', 'confirmada'])
    )
    const snapshot = await getDocs(q)

    for (const docSnap of snapshot.docs) {
      const r = docSnap.data()
      if (haySolapamiento(datos.hora, datos.duracion, r.hora, r.duracion)) {
        throw new Error('Ese horario ya está ocupado. Por favor, elige otro.')
      }
    }

    transaction.set(nuevaReservaRef, {
      nombre: datos.nombre,
      telefono: datos.telefono,
      personas: datos.personas,
      fecha: datos.fecha,
      hora: datos.hora,
      duracion: datos.duracion,
      horaFin,
      nota: datos.nota || '',
      estado: 'pendiente',
      expiraEn: Timestamp.fromDate(expiraEn),
      creadoEn: serverTimestamp(),
    })
  })

  return nuevaReservaRef.id
}

// ============ ACTUALIZAR CON TRANSACCIÓN ============
export async function actualizarReservaConBloqueo(
  id: string,
  datos: {
    nombre: string
    telefono: string
    personas: number
    fecha: string
    hora: string
    duracion: number
    nota?: string
  }
): Promise<void> {
  const reservasRef = collection(db, 'reservas_dardos')
  const reservaRef = doc(db, 'reservas_dardos', id)
  const horaFin = calcularHoraFin(datos.hora, datos.duracion)

  await runTransaction(db, async (transaction) => {
    const q = query(
      reservasRef,
      where('fecha', '==', datos.fecha),
      where('estado', 'in', ['pendiente', 'confirmada'])
    )
    const snapshot = await getDocs(q)

    for (const docSnap of snapshot.docs) {
      if (docSnap.id === id) continue
      const r = docSnap.data()
      if (haySolapamiento(datos.hora, datos.duracion, r.hora, r.duracion)) {
        throw new Error('Ese horario ya está ocupado. Por favor, elige otro.')
      }
    }

    transaction.update(reservaRef, {
      nombre: datos.nombre,
      telefono: datos.telefono,
      personas: datos.personas,
      fecha: datos.fecha,
      hora: datos.hora,
      duracion: datos.duracion,
      horaFin,
      nota: datos.nota || '',
    })
  })
}

// ============ LEER ============
function mapReserva(d: any): ReservaDardos {
  const data = d.data()
  return {
    id: d.id,
    ...data,
    expiraEn: data.expiraEn?.toDate?.() || new Date(),
    creadoEn: data.creadoEn?.toDate?.() || new Date(),
    confirmadoEn: data.confirmadoEn?.toDate?.(),
    canceladoEn: data.canceladoEn?.toDate?.(),
  } as ReservaDardos
}

export async function getReservasPorEstado(estado: EstadoReserva): Promise<ReservaDardos[]> {
  const q = query(collection(db, 'reservas_dardos'), where('estado', '==', estado))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapReserva)
}

export async function getReservasPendientes() { return getReservasPorEstado('pendiente') }
export async function getReservasConfirmadas() { return getReservasPorEstado('confirmada') }
export async function getReservasCanceladas() { return getReservasPorEstado('cancelada') }
export async function getReservasExpiradas() { return getReservasPorEstado('expirada') }

export async function getReservaById(id: string): Promise<ReservaDardos | null> {
  const snap = await getDoc(doc(db, 'reservas_dardos', id))
  if (!snap.exists()) return null
  return mapReserva(snap)
}

// ============ CONFIRMAR / CANCELAR / ELIMINAR ============
export async function confirmarReserva(id: string): Promise<void> {
  await updateDoc(doc(db, 'reservas_dardos', id), {
    estado: 'confirmada',
    confirmadoEn: serverTimestamp(),
  })
}

export async function cancelarReserva(id: string): Promise<void> {
  await updateDoc(doc(db, 'reservas_dardos', id), {
    estado: 'cancelada',
    canceladoEn: serverTimestamp(),
  })
}

export async function eliminarReserva(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reservas_dardos', id))
}

// ============ LIBERAR EXPIRADAS ============
export async function liberarReservasExpiradas(): Promise<number> {
  const ahora = new Date()
  const pendientes = await getReservasPendientes()
  let liberadas = 0
  for (const reserva of pendientes) {
    if (reserva.expiraEn < ahora) {
      await updateDoc(doc(db, 'reservas_dardos', reserva.id), {
        estado: 'expirada',
        canceladoEn: serverTimestamp(),
      })
      liberadas++
    }
  }
  return liberadas
}

// ============ HORARIOS ============
export async function getHorariosConfig(): Promise<HorariosConfig | null> {
  try {
    const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.horarios) return data.horarios as HorariosConfig
    }
    return null
  } catch (error) {
    console.error('Error cargando horarios:', error)
    return null
  }
}