import { Clock, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { categoryIcons } from '@/lib/categories'

import type { Business } from '../types'
import { categoryLabels } from './category-meta'
import { FavoriteButton } from './favorite-button'

type BusinessCardProps = {
  business: Business
  // Extra line from another feature (e.g. the next free time), placed under the opening hours.
  extra?: ReactNode
}

// Mobile: a row with a 64 px square photo. From sm up: a card with a 16:9 cover (DESIGN.md).
// The name is the link and stretches over the whole card (after:inset-0), so the heart can be
// its own button: a button inside a link is invalid and confuses keyboards and screen readers.
export function BusinessCard({ business, extra }: BusinessCardProps) {
  const Icon = categoryIcons[business.category]

  return (
    <div className="pressable group relative h-full rounded-2xl has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring">
      <Card className="flex h-full flex-row gap-4 overflow-hidden p-4 transition-shadow sm:group-hover:shadow-lg sm:flex-col sm:gap-0 sm:p-0">
        {business.imageUrl ? (
          <img
            src={business.imageUrl}
            // Decorative: the name next to it is the link, so screen readers do not hear it twice.
            alt=""
            className="size-16 shrink-0 rounded-xl bg-muted object-cover sm:aspect-video sm:size-auto sm:w-full sm:rounded-none"
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground sm:aspect-video sm:size-auto sm:w-full sm:rounded-none">
            <Icon aria-hidden className="size-6 sm:size-10" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:p-4">
          <Badge variant="secondary" className="gap-1">
            <Icon aria-hidden />
            {categoryLabels[business.category]}
          </Badge>
          <h2 className="truncate pr-10 text-base font-semibold sm:pr-0 sm:text-lg">
            <Link to={`/businesses/${business.id}`} className="outline-none after:absolute after:inset-0">
              {business.name}
            </Link>
          </h2>
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
            {extra}
          </div>
        </div>
      </Card>
      {/* Above the stretched link, so it gets its own clicks. */}
      <FavoriteButton business={business} className="absolute top-2 right-2 z-10" />
    </div>
  )
}
