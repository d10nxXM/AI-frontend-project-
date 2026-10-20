import { Clock, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { categoryIcons } from '@/lib/categories'
import { NotFoundError } from '@/lib/mock-db'

import { useBusiness } from '../api/use-businesses'
import { categoryLabels } from './category-meta'

type BusinessDetailProps = {
  id: number
  // Shown next to the info (below it on phones), only once the business has loaded.
  children?: ReactNode
}

// Cover photo, name and the practical info, with loading, not-found and error states.
export function BusinessDetail({ id, children }: BusinessDetailProps) {
  const { data: business, isLoading, error } = useBusiness(id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 lg:w-2/5">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (error instanceof NotFoundError) {
    return <p className="text-muted-foreground">This business does not exist or was removed.</p>
  }

  if (error || !business) {
    return <p className="text-destructive">Business failed to load. Please try again.</p>
  }

  const Icon = categoryIcons[business.category]

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <article className="flex flex-col gap-4">
        {business.imageUrl ? (
          <img
            src={business.imageUrl}
            alt={business.name}
            className="aspect-video w-full rounded-lg bg-muted object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon aria-hidden className="size-12" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="gap-1">
            <Icon aria-hidden />
            {categoryLabels[business.category]}
          </Badge>
          <h1 className="text-3xl font-bold">{business.name}</h1>
          <p className="text-muted-foreground">{business.description}</p>
        </div>

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <dt>
              <MapPin aria-label="Address" className="size-4 text-muted-foreground" />
            </dt>
            <dd>
              {business.address}, {business.city}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>
              <Clock aria-label="Opening hours" className="size-4 text-muted-foreground" />
            </dt>
            <dd className="tabular-nums">{business.openingHours}</dd>
          </div>
        </dl>
      </article>
      {children}
    </div>
  )
}
