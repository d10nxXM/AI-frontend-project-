import { ExternalLink } from 'lucide-react'

import { directionsUrl } from '@/lib/maps'

type DirectionsLinkProps = {
  address: string
  city: string
}

// "Directions" next to an address, opening Google Maps in a new tab. Used by businesses and bookings.
export function DirectionsLink({ address, city }: DirectionsLinkProps) {
  return (
    <a
      href={directionsUrl(address, city)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-sm font-medium whitespace-nowrap underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
    >
      Directions
      <ExternalLink aria-hidden className="size-3" />
      <span className="sr-only">(opens Google Maps in a new tab)</span>
    </a>
  )
}
