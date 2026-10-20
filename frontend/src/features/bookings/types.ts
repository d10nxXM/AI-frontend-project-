import type { Category } from '@/lib/categories'

export type BookingStatus = 'booked' | 'cancelled'

// An appointment a client booked at a business for one service.
export type Booking = {
  id: number
  businessId: number
  serviceId: number
  slotId: number
  businessName: string
  category: Category
  serviceName: string
  serviceDescription: string
  price: number
  city: string
  startsAt: string
  durationMinutes: number
  status: BookingStatus
  imageUrl: string
  createdAt: string
}

export type NewBooking = Omit<Booking, 'id' | 'status' | 'createdAt'>

export type BookingChanges = Partial<Omit<Booking, 'id' | 'createdAt'>>

// What the booking flow has picked so far; the bookings feature copies these into a NewBooking.
export type BookingDraft = {
  business: { id: number; name: string; category: Category; city: string; imageUrl: string }
  service: { id: number; name: string; description: string; price: number; durationMinutes: number }
  slot: { id: number; startsAt: string }
}
