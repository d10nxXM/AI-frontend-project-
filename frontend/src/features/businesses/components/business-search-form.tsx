import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type BusinessSearchFormProps = {
  onSearch: (search: string) => void
}

// The one main action of the home page: search businesses by name.
export function BusinessSearchForm({ onSearch }: BusinessSearchFormProps) {
  const [search, setSearch] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(search.trim())
  }

  return (
    <form role="search" onSubmit={submit} className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
      {/* A filled field with the magnifier inside, like Apple's search fields. */}
      <div className="relative flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Search businesses"
          placeholder="Salon, gym or service shop name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card pl-10"
        />
      </div>
      <Button type="submit" size="lg">
        <Search aria-hidden />
        Search
      </Button>
    </form>
  )
}
