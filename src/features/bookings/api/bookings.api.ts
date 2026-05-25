import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import type {
  BookingSummary,
  BookingDetail,
  CreateBookingPayload,
  CreateBookingResponse,
  CreatePaymentIntentResponse,
  ConfirmPaymentResponse,
} from '../types/booking.types'

export const bookingsApi = {
  async create(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
    const { data } = await apiClient.post<CreateBookingResponse>(API.bookings, payload)
    return data
  },

  async list(): Promise<BookingSummary[]> {
    const { data } = await apiClient.get<{ exito: boolean; reservas: BookingSummary[] }>(
      API.myBookings
    )
    return data.reservas ?? []
  },

  async get(id: number): Promise<BookingDetail> {
    const { data } = await apiClient.get<{ exito: boolean; reserva: BookingDetail }>(
      API.booking(id)
    )
    return data.reserva ?? (data as unknown as BookingDetail)
  },

  async cancel(id: number): Promise<{ exito: boolean; mensaje: string; numero_reserva: string }> {
    const { data } = await apiClient.patch(API.cancelBooking(id))
    return data
  },

  async createPaymentIntent(id: number): Promise<CreatePaymentIntentResponse> {
    const { data } = await apiClient.post<CreatePaymentIntentResponse>(
      API.createPaymentIntent(id)
    )
    return data
  },

  async confirmPayment(id: number, paymentIntentId: string): Promise<ConfirmPaymentResponse> {
    const { data } = await apiClient.post<ConfirmPaymentResponse>(API.confirmPayment(id), {
      payment_intent_id: paymentIntentId,
    })
    return data
  },
}
