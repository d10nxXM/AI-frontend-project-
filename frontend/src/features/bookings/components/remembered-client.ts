import type { ClientDetails } from '../types'

// Name and phone from the last booking, kept only in this browser so the form is filled in
// next time. A convenience: everything works the same when storage is empty or blocked.
const KEY = 'zakazi.client'

type RememberedClient = Partial<Pick<ClientDetails, 'clientName' | 'clientPhone'>>

export function loadRememberedClient(): RememberedClient {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null) return {}
    const stored = value as Record<string, unknown>
    return {
      clientName: typeof stored.clientName === 'string' ? stored.clientName : undefined,
      clientPhone: typeof stored.clientPhone === 'string' ? stored.clientPhone : undefined,
    }
  } catch {
    return {}
  }
}

export function rememberClient({ clientName, clientPhone }: ClientDetails) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ clientName, clientPhone }))
  } catch {
    // Storage can be full or blocked (private mode); the next form is just empty then.
  }
}
