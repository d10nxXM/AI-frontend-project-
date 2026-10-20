import { NavLink, Outlet } from 'react-router'

import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home' },
  { to: '/listings', label: 'Listings' },
  { to: '/businesses', label: 'Businesses' },
  { to: '/bookings', label: 'Bookings' },
]

export function AppLayout() {
  return (
    <div className="min-h-dvh">
      <header className="border-b bg-card">
        <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <span className="font-heading text-lg font-bold whitespace-nowrap text-primary">Zakazi.me</span>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'text-muted-foreground hover:text-foreground',
                      isActive && 'font-semibold text-foreground',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
