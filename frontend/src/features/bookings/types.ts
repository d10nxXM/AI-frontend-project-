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
