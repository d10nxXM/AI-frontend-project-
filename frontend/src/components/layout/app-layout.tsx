import { Link, NavLink, Outlet } from 'react-router'

import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home' },
  { to: '/businesses', label: 'Businesses' },
  { to: '/bookings', label: 'Bookings' },
]

export function AppLayout() {
  return (
    <div className="min-h-dvh">
      <header className="border-b bg-card">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
        >
          {/* Neutral, not red: red is only for the main action on a screen (DESIGN.md). */}
          <Link
            to="/"
            className="w-fit rounded-sm font-heading text-lg font-bold whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            Zakazi.me
          </Link>
          <div className="flex items-center justify-between gap-6">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring',
                        isActive && 'font-semibold text-foreground',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
