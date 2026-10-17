import { NotFoundError, delay } from '@/lib/mock-db'

import type { Booking, BookingChanges, NewBooking } from '../types'

let bookings: Booking[] = [
  {
    id: 1,
    businessName: 'Studio Lana',
    category: 'hair',
    serviceName: "Women's haircut and blow-dry",
    serviceDescription: 'Wash, cut and styling with a blow-dry. Includes a short consultation.',
    price: 25,
    city: 'Podgorica',
    startsAt: '2026-10-20T09:30',
    durationMinutes: 60,
    status: 'booked',
    imageUrl: 'https://picsum.photos/seed/zakazi-lana/600/338',
    createdAt: '2026-10-15',
  },
  {
    id: 2,
    businessName: 'Iron Gym',
    category: 'gym',
    serviceName: 'Personal training session',
    serviceDescription: 'One-on-one strength training with a certified coach, plan included.',
    price: 20,
    city: 'Niksic',
    startsAt: '2026-10-21T18:00',
    durationMinutes: 60,
    status: 'booked',
    imageUrl: 'https://picsum.photos/seed/zakazi-iron/600/338',
    createdAt: '2026-10-14',
  },
  {
    id: 3,
    businessName: 'AutoServis Delta',
    category: 'service',
    serviceName: 'Oil and filter change',
    serviceDescription: 'Engine oil, oil filter and a free check of brakes and tyre pressure.',
    price: 55,
    city: 'Budva',
    startsAt: '2026-10-23T08:00',
    durationMinutes: 45,
    status: 'booked',
    imageUrl: 'https://picsum.photos/seed/zakazi-delta/600/338',
    createdAt: '2026-10-12',
  },
  {
    id: 4,
    businessName: 'Barber Shop Kruna',
    category: 'hair',
    serviceName: "Men's haircut and beard trim",
    serviceDescription: 'Clipper and scissor cut with a hot towel beard trim.',
    price: 15,
    city: 'Podgorica',
    startsAt: '2026-10-18T16:30',
    durationMinutes: 40,
    status: 'cancelled',
    imageUrl: 'https://picsum.photos/seed/zakazi-kruna/600/338',
    createdAt: '2026-10-10',
  },
]

const matches = (booking: Booking, search: string) =>
  [booking.serviceName, booking.businessName, booking.city].some((value) =>
    value.toLowerCase().includes(search.toLowerCase()),
  )

export const bookingsApi = {
  list: (search = '') =>
    delay(bookings.filter((b) => matches(b, search)).sort((a, b) => a.startsAt.localeCompare(b.startsAt))),

  get: (id: number) => {
    const booking = bookings.find((b) => b.id === id)
    if (!booking) return Promise.reject(new NotFoundError('Booking', id))
    return delay(booking)
  },

  create: (input: NewBooking) => {
    const booking: Booking = {
      ...input,
      id: Date.now(),
      status: 'booked',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    bookings = [booking, ...bookings]
    return delay(booking)
  },

  update: (id: number, changes: BookingChanges) => {
    bookings = bookings.map((b) => (b.id === id ? { ...b, ...changes } : b))
    return bookingsApi.get(id)
  },

  remove: (id: number) => {
    bookings = bookings.filter((b) => b.id !== id)
    return delay(undefined)
  },
}
