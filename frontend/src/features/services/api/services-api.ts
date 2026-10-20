import { NotFoundError, delay } from '@/lib/mock-db'

import type { NewService, Service } from '../types'

let services: Service[] = [
  // Studio Lana
  {
    id: 1,
    businessId: 1,
    name: "Women's haircut and blow-dry",
    description: 'Wash, cut and styling with a blow-dry. Includes a short consultation.',
    price: 25,
    durationMinutes: 60,
  },
  {
    id: 2,
    businessId: 1,
    name: 'Full colour',
    description: 'Single-tone colour from roots to ends, with wash and blow-dry.',
    price: 45,
    durationMinutes: 120,
  },
  {
    id: 3,
    businessId: 1,
    name: 'Blow-dry',
    description: 'Wash and blow-dry, straight or with waves.',
    price: 12,
    durationMinutes: 30,
  },
  // Barber Shop Kruna
  {
    id: 4,
    businessId: 2,
    name: "Men's haircut and beard trim",
    description: 'Clipper and scissor cut with a hot towel beard trim.',
    price: 15,
    durationMinutes: 40,
  },
  {
    id: 5,
    businessId: 2,
    name: "Men's haircut",
    description: 'Clipper and scissor cut, wash and styling.',
    price: 10,
    durationMinutes: 30,
  },
  // Iron Gym
  {
    id: 6,
    businessId: 3,
    name: 'Personal training session',
    description: 'One-on-one strength training with a certified coach, plan included.',
    price: 20,
    durationMinutes: 60,
  },
  {
    id: 7,
    businessId: 3,
    name: 'Small group training',
    description: 'Up to four people with one coach, focused on strength and technique.',
    price: 8,
    durationMinutes: 60,
  },
  // FitZone Budva
  {
    id: 8,
    businessId: 4,
    name: 'Pilates class',
    description: 'Mat pilates for all levels, mats provided.',
    price: 10,
    durationMinutes: 60,
  },
  {
    id: 9,
    businessId: 4,
    name: 'Yoga class',
    description: 'Hatha yoga with breathing and stretching, beginners welcome.',
    price: 10,
    durationMinutes: 60,
  },
  // AutoServis Delta
  {
    id: 10,
    businessId: 5,
    name: 'Oil and filter change',
    description: 'Engine oil, oil filter and a free check of brakes and tyre pressure.',
    price: 55,
    durationMinutes: 45,
  },
  {
    id: 11,
    businessId: 5,
    name: 'Seasonal tyre change',
    description: 'Swap of four tyres on rims, balancing included.',
    price: 30,
    durationMinutes: 60,
  },
  // iFix Niksic
  {
    id: 12,
    businessId: 6,
    name: 'Phone screen replacement',
    description: 'New screen for most iPhone and Samsung models, 6-month warranty.',
    price: 80,
    durationMinutes: 60,
  },
  {
    id: 13,
    businessId: 6,
    name: 'Battery replacement',
    description: 'New battery for phones and laptops, old one recycled.',
    price: 40,
    durationMinutes: 60,
  },
]

export const servicesApi = {
  list: (businessId?: number) =>
    delay(businessId === undefined ? services : services.filter((s) => s.businessId === businessId)),

  get: (id: number) => {
    const service = services.find((s) => s.id === id)
    if (!service) return Promise.reject(new NotFoundError('Service', id))
    return delay(service)
  },

  create: (input: NewService) => {
    const service: Service = { ...input, id: Date.now() }
    services = [...services, service]
    return delay(service)
  },

  update: (id: number, changes: Partial<NewService>) => {
    services = services.map((s) => (s.id === id ? { ...s, ...changes } : s))
    return servicesApi.get(id)
  },

  remove: (id: number) => {
    services = services.filter((s) => s.id !== id)
    return delay(undefined)
  },
}
