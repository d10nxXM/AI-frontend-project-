import type { Category } from '@/lib/categories'

export const categories: Category[] = ['hair', 'gym', 'service']

export const categoryLabels: Record<Category, string> = {
  hair: 'Hair salon',
  gym: 'Gym',
  service: 'Service shop',
}

export const categoryPluralLabels: Record<Category, string> = {
  hair: 'Hair salons',
  gym: 'Gyms',
  service: 'Service shops',
}
