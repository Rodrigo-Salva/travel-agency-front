export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded'
export type PassengerType = 'adult' | 'child' | 'infant'

export interface Passenger {
  passenger_type: PassengerType
  title?: string
  first_name: string
  last_name: string
  date_of_birth?: string
  gender?: string
  passport_number?: string
  nationality?: string
}

export interface BookingSummary {
  id: number
  booking_number: string
  travel_date: string | null
  return_date: string | null
  num_adults: number
  num_children: number
  num_infants: number
  total_amount: string
  status: BookingStatus
  payment_status: PaymentStatus
  booking_date: string
}

export interface BookingDetail extends BookingSummary {
  customer: number
  package: number | null
  subtotal: string
  discount_amount: string
  tax_amount: string
  paid_amount: string
  special_requests: string | null
  updated_at: string
  passengers: Passenger[]
}

export interface CreateBookingPayload {
  package: number
  travel_date: string
  return_date?: string
  num_adults: number
  num_children: number
  num_infants: number
  special_requests?: string
  passengers: Passenger[]
}

export interface CreateBookingResponse {
  exito: boolean
  mensaje: string
  numero_reserva: string
  detalles: BookingDetail
}

// Wizard state
export interface WizardState {
  // Step 1 — Fechas y pasajeros
  packageId: number | null
  packageName: string
  packageImage: string | null
  priceAdult: string
  priceChild: string
  durationDays: number
  travelDate: string
  returnDate: string
  numAdults: number
  numChildren: number
  numInfants: number

  // Step 2 — Datos pasajeros
  passengers: Passenger[]

  // Step 3 — Solicitudes + resumen
  specialRequests: string

  // Calculated
  subtotal: number
  total: number
}
