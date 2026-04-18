import { create } from 'zustand'
import type { Passenger, WizardState } from '../types/booking.types'

interface WizardStore {
  step: number
  state: WizardState
  completedBookingNumber: string | null

  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setPackage: (pkg: {
    id: number
    name: string
    image: string | null
    priceAdult: string
    priceChild: string
    durationDays: number
  }) => void
  setDates: (travelDate: string, returnDate: string) => void
  setPax: (adults: number, children: number, infants: number) => void
  setPassengers: (passengers: Passenger[]) => void
  setSpecialRequests: (text: string) => void
  setCompletedBooking: (bookingNumber: string) => void
  reset: () => void
}

const INITIAL_STATE: WizardState = {
  packageId: null,
  packageName: '',
  packageImage: null,
  priceAdult: '0',
  priceChild: '0',
  durationDays: 1,
  travelDate: '',
  returnDate: '',
  numAdults: 1,
  numChildren: 0,
  numInfants: 0,
  passengers: [],
  specialRequests: '',
  subtotal: 0,
  total: 0,
}

function calcTotal(state: WizardState): number {
  const adult = parseFloat(state.priceAdult) || 0
  const child = parseFloat(state.priceChild) || 0
  return adult * state.numAdults + child * state.numChildren
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  step: 1,
  state: INITIAL_STATE,
  completedBookingNumber: null,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 4) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),

  setPackage: (pkg) =>
    set((s) => {
      const next: WizardState = {
        ...s.state,
        packageId: pkg.id,
        packageName: pkg.name,
        packageImage: pkg.image,
        priceAdult: pkg.priceAdult,
        priceChild: pkg.priceChild,
        durationDays: pkg.durationDays,
      }
      return { state: { ...next, subtotal: calcTotal(next), total: calcTotal(next) } }
    }),

  setDates: (travelDate, returnDate) =>
    set((s) => ({ state: { ...s.state, travelDate, returnDate } })),

  setPax: (adults, children, infants) =>
    set((s) => {
      const next = { ...s.state, numAdults: adults, numChildren: children, numInfants: infants }
      const total = calcTotal(next)
      return { state: { ...next, subtotal: total, total } }
    }),

  setPassengers: (passengers) =>
    set((s) => ({ state: { ...s.state, passengers } })),

  setSpecialRequests: (text) =>
    set((s) => ({ state: { ...s.state, specialRequests: text } })),

  setCompletedBooking: (bookingNumber) => set({ completedBookingNumber: bookingNumber }),

  reset: () => set({ step: 1, state: INITIAL_STATE, completedBookingNumber: null }),
}))
