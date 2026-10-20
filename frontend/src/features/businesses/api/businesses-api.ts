import { NotFoundError, delay } from '@/lib/mock-db'

import type { Business, BusinessFilter, NewBusiness } from '../types'

let businesses: Business[] = [
  {
    id: 1,
    name: 'Studio Lana',
    category: 'hair',
    description: "Women's hair salon: cuts, colouring and styling for every occasion.",
    city: 'Podgorica',
    address: 'Njegoseva 12',
    openingHours: 'Mon–Sat 09:00–19:00',
    imageUrl: 'https://picsum.photos/seed/zakazi-lana/600/338',
    createdAt: '2026-09-01',
  },
  {
    id: 2,
    name: 'Barber Shop Kruna',
    category: 'hair',
    description: 'Classic barber shop for haircuts, fades and beard trims.',
    city: 'Podgorica',
    address: 'Bulevar Svetog Petra Cetinjskog 45',
    openingHours: 'Mon–Sat 09:00–20:00',
    imageUrl: 'https://picsum.photos/seed/zakazi-kruna/600/338',
    createdAt: '2026-09-03',
  },
  {
    id: 3,
    name: 'Iron Gym',
    category: 'gym',
    description: 'Strength gym with certified coaches, personal training and small groups.',
    city: 'Niksic',
    address: 'Vuka Karadzica 8',
    openingHours: 'Mon–Sat 07:00–21:00',
    imageUrl: 'https://picsum.photos/seed/zakazi-iron/600/338',
    createdAt: '2026-09-05',
  },
  {
    id: 4,
    name: 'FitZone Budva',
    category: 'gym',
    description: 'Functional training, pilates and yoga classes by the sea.',
    city: 'Budva',
    address: 'Mediteranska 21',
    openingHours: 'Mon–Sat 08:00–20:00',
    imageUrl: 'https://picsum.photos/seed/zakazi-fitzone/600/338',
    createdAt: '2026-09-08',
  },
  {
    id: 5,
    name: 'AutoServis Delta',
    category: 'service',
    description: 'Car service: oil changes, brakes, tyres and diagnostics.',
    city: 'Budva',
    address: 'Jadranski put bb',
    openingHours: 'Mon–Sat 08:00–16:00',
    imageUrl: 'https://picsum.photos/seed/zakazi-delta/600/338',
    createdAt: '2026-09-10',
  },
  {
    id: 6,
    name: 'iFix Niksic',
    category: 'service',
    description: 'Phone and laptop repair: screens, batteries and water damage.',
    city: 'Niksic',
    address: 'Njegoseva 30',
    openingHours: 'Mon–Sat 10:00–18:00',
    imageUrl: 'https://picsum.photos/seed/zakazi-ifix/600/338',
    createdAt: '2026-09-12',
  },
]

const matches = (business: Business, { search = '', category, city }: BusinessFilter) =>
  business.name.toLowerCase().includes(search.toLowerCase()) &&
  (!category || business.category === category) &&
  (!city || business.city === city)

export const businessesApi = {
  list: (filter: BusinessFilter = {}) => delay(businesses.filter((b) => matches(b, filter))),

  get: (id: number) => {
    const business = businesses.find((b) => b.id === id)
    if (!business) return Promise.reject(new NotFoundError('Business', id))
    return delay(business)
  },

  create: (input: NewBusiness) => {
    const business: Business = { ...input, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) }
    businesses = [business, ...businesses]
    return delay(business)
  },

  update: (id: number, changes: Partial<NewBusiness>) => {
    businesses = businesses.map((b) => (b.id === id ? { ...b, ...changes } : b))
    return businessesApi.get(id)
  },

  remove: (id: number) => {
    businesses = businesses.filter((b) => b.id !== id)
    return delay(undefined)
  },
}
