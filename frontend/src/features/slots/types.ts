export type SlotStatus = 'free' | 'booked'

// A time window a business publishes; a client books a free one.
export type TimeSlot = {
  id: number
  businessId: number
  startsAt: string
  durationMinutes: number
  status: SlotStatus
}

export type NewTimeSlot = Omit<TimeSlot, 'id' | 'status'>

export type SlotFilter = {
  businessId?: number
  date?: string
  status?: SlotStatus
}
