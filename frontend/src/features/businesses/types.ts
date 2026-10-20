import type { Category } from '@/lib/categories'

// A hair salon, gym or service shop that publishes services and free time slots.
export type Business = {
  id: number
  name: string
  category: Category
  description: string
  city: string
  address: string
  openingHours: string
  imageUrl: string
  createdAt: string
}

export type NewBusiness = Omit<Business, 'id' | 'createdAt'>

export type BusinessFilter = {
  search?: string
  category?: Category
  city?: string
}
