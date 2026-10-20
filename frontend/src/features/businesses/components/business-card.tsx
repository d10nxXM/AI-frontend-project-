import { Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { categoryIcons } from '@/lib/categories'

import type { Business } from '../types'
import { categoryLabels } from './category-meta'

type BusinessCardProps = {
  business: Business
}

// Mobile: a row with a 64 px square photo. From sm up: a card with a 16:9 cover (DESIGN.md).
export function BusinessCard({ business }: BusinessCardProps) {
  const Icon = categoryIcons[business.category]

  return (
    <Link
      to={`/businesses/${business.id}`}
      className="block h-full rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring"
    >
      <Card className="flex h-full flex-row gap-4 overflow-hidden rounded-lg p-4 shadow-none transition-colors hover:border-foreground/30 sm:flex-col sm:gap-0 sm:p-0">
        {business.imageUrl ? (
          <img
            src={business.imageUrl}
            alt={business.name}
            className="size-16 shrink-0 rounded-md bg-muted object-cover sm:aspect-video sm:size-auto sm:w-full sm:rounded-none"
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:aspect-video sm:size-auto sm:w-full sm:rounded-none">
            <Icon aria-hidden className="size-6 sm:size-10" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:p-4">
          <Badge variant="secondary" className="gap-1">
            <Icon aria-hidden />
            {categoryLabels[business.category]}
          </Badge>
          <h2 className="truncate text-base font-semibold sm:text-lg">{business.name}</h2>
          <p className="hidden text-sm text-muted-foreground sm:line-clamp-2">{business.description}</p>
          <div className="mt-auto flex flex-col gap-1 text-sm text-muted-foreground">
            <span className="flex min-w-0 items-start gap-2">
            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
            {/* Wraps instead of truncating, so the city at the end stays visible. */}
            <span className="line-clamp-2">
                {business.address}, {business.city}
              </span>
            </span>
            <span className="flex items-center gap-2 tabular-nums">
              <Clock aria-hidden className="size-4 shrink-0" />
              {business.openingHours}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
