import { ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { NextBooking } from '@/features/bookings/components/next-booking'
import { BusinessSearchForm } from '@/features/businesses/components/business-search-form'
import { BusinessesList } from '@/features/businesses/components/businesses-list'
import { CategoryLinks } from '@/features/businesses/components/category-links'

// Search first (the one main action), then the next booking, categories and a few businesses.
export function Home() {
  const navigate = useNavigate()

  const search = (query: string) =>
    navigate(query ? `/businesses?${new URLSearchParams({ search: query })}` : '/businesses')

  return (
    <div className="flex flex-col gap-12">
      <title>Zakazi.me</title>

      <section className="flex flex-col gap-4 pt-4 md:pt-8">
        <h1 className="text-3xl font-bold text-balance md:text-4xl">
          Book a free time at a salon, gym or service shop
        </h1>
        <BusinessSearchForm onSearch={search} />
      </section>

      <NextBooking />

      <section aria-labelledby="home-categories" className="flex flex-col gap-4">
        <h2 id="home-categories" className="text-xl font-semibold">
          Browse by category
        </h2>
        <CategoryLinks />
      </section>

      <section aria-labelledby="home-businesses" className="flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <h2 id="home-businesses" className="text-xl font-semibold">
            Businesses
          </h2>
          <Link
            to="/businesses"
            className="flex items-center gap-1 rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
          >
            See all
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <BusinessesList filter={{}} limit={3} />
      </section>
    </div>
  )
}
