// One thing a business offers, e.g. a haircut or an oil change.
export type Service = {
  id: number
  businessId: number
  name: string
  description: string
  price: number
  durationMinutes: number
}

export type NewService = Omit<Service, 'id'>
