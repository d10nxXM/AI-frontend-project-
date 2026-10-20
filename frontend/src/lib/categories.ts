import { Dumbbell, Scissors, Wrench } from 'lucide-react'

// Business categories, shared by the businesses and bookings features.
export type Category = 'hair' | 'gym' | 'service'

// Category icons from DESIGN.md, also the fallback when a business has no photo.
export const categoryIcons: Record<Category, typeof Scissors> = {
  hair: Scissors,
  gym: Dumbbell,
  service: Wrench,
}

// Narrows any string (e.g. from the URL) to a Category.
export const isCategory = (value: string | null): value is Category =>
  value !== null && value in categoryIcons
